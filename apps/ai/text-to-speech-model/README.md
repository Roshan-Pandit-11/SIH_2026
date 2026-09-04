# Text to speech model explored 

## To Run 
- Make a kaggle account or colab(not tested)
- Make ngrock account copy auth token to kaggle secrets variables (Add ons->Secrets->see bottom add secrets->name is NGROCK_T(Important))
- Run the notebook on GPU T4X2 (Settings->accelerator->Select top gpu)
- Only last cell of notebook is required to run
- The output of the last cell will give the url which will look like this:

  🚀 YOUR PUBLIC API ENDPOINT URL IS:
  
  https://scorch-citric-denial.ngrok-free.dev

## UI for testing the model 
- Local host the html
- change the url in html doc to the public ngrock url that you obitained in last cell output and add /v1/synthesize at the end of url
- example (const activeKaggleUrl = "https://scorch-citric-denial.ngrok-free.dev/v1/synthesize";)


## Audio Samples
<table>
  <tr>
    <td width="300">
      <details>
        <summary><b>▶️ Click to listen to english audio</b></summary><video src="https://github.com/user-attachments/assets/68579b6c-fa34-41ce-82b6-a29ea4080057" controls></video>
      </details>
    </td>
    <td width="300">      
      <details>
        <summary><b>▶️ Click to listen to hindi audio</b></summary><video src="https://github.com/user-attachments/assets/f9defc03-de92-4633-a472-32fb3af3f418" controls></video>
      </details>
    </td>
  </tr>
</table>



