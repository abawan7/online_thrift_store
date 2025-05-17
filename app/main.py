from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .controllers.chatbot.controller import chat_with_bot  # Using relative import with dot notation

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "Hello World"}


@app.get("/chat")
async def chat(user_id: str, user_input: str):
    return await chat_with_bot(user_id, user_input) 