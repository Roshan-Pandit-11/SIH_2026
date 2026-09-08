import express from "express";
import cors from "cors" ;
import authRoutes from "./routes/auth/route.js";
import workerRoutes from "./routes/worker/route.js";

const app = express() ;

app.use(cors()) ;
app.use(express.json()) ;

app.use("/auth", authRoutes) ;
app.use("/worker", workerRoutes) ;

export default app ;