import requests, os

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

def handle_openrouter_faq(question):
    headers = {"Authorization": f"Bearer {OPENROUTER_API_KEY}"}
    payload = {
      "model":"openai/gpt-3.5-turbo",
      "messages":[{"role":"user","content":question}]
    }
    r = requests.post("https://openrouter.ai/api/v1/chat/completions",json=payload,headers=headers)
    return r.json()["choices"][0]["message"]["content"]
