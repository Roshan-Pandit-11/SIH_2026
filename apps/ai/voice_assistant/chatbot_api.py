import os
import aiohttp
from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import uvicorn

# -------------------------
# Local Ollama Configuration (Replaces AI Pipe)
# -------------------------
OLLAMA_URL = "http://localhost:11434/v1/chat/completions"
MODEL_NAME = "llama3.2:1b"  # Change to "llama3" or "mistral" if you downloaded those


# -------------------------
# Load environment variables
# -------------------------
load_dotenv()
API_KEY = os.getenv("API_KEY")
if not API_KEY:
    raise ValueError("Please set API_KEY in your .env file")
AI_PIPE_URL = "https://aipipe.org/openai/v1/chat/completions"

# -------------------------
# System prompt for neutral responses
# -------------------------
SYSTEM_PROMPT = (
    "You are a neutral AI assistant for student Q&A. "
    "Answer questions factually, concisely, and without inferring emotions or mental state. "
    "Do not provide advice or emotional support unless explicitly requested."
)

# -------------------------
# FastAPI setup
# -------------------------
app = FastAPI(title="Neutral Student Q&A Chatbot API")

origins = ["http://localhost:5173","http://127.0.0.1:5500","http://localhost:5500"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------
# Pydantic model
# -------------------------
class QueryRequest(BaseModel):
    question: str

# -------------------------
# Safety check for crisis keywords
# -------------------------
def safety_check(question: str) -> Optional[str]:
    crisis_keywords = ["suicide", "kill myself", "self harm", "end my life", "die", "can't go on"]
    if any(word in question.lower() for word in crisis_keywords):
        return (
            "⚠️ It seems you may be in danger. "
            "Please reach out to a professional immediately:\n\n"
            "📞 India: AASRA Helpline +91-9820466726\n"
            "📞 USA: suicide and crisis hotline\n"
            "📞 UK: Samaritans 116 123\n\n"
            "If you're in immediate danger, call emergency services."
        )
    return None

# -------------------------
# Generate answer (Direct Chat)
# -------------------------
async def async_generate_answer(query: str):
    prompt_messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": query}
    ]

    payload = {
        "model": "gpt-4.1-nano",
        "messages": prompt_messages,
        "temperature": 0.5,
        "max_tokens": 150
    }

    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }

    async with aiohttp.ClientSession() as session:
        async with session.post(AI_PIPE_URL, headers=headers, json=payload) as resp:
            if resp.status != 200:
                return f"AI Pipe error {resp.status}: {await resp.text()}"
            result = await resp.json()
            return result["choices"][0]["message"]["content"]

# -------------------------
# FastAPI endpoints
# -------------------------
@app.post("/query")
async def post_query(request: QueryRequest):
    crisis_response = safety_check(request.question)
    if crisis_response:
        return {"question": request.question, "answer": crisis_response, "escalated": True}

    answer = await async_generate_answer(request.question)
    return {"question": request.question, "answer": answer, "escalated": False}

@app.get("/query")
async def get_query(q: str):
    crisis_response = safety_check(q)
    if crisis_response:
        return {"question": q, "answer": crisis_response, "escalated": True}

    answer = await async_generate_answer(q)
    return {"question": q, "answer": answer, "escalated": False}

if __name__ == "__main__":
    uvicorn.run("chatbot_api:app", host="127.0.0.1", port=8001, reload=True)
