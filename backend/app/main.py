from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="JPHack API", version="0.1.0")


class HealthResponse(BaseModel):
    status: str


class MessageResponse(BaseModel):
    message: str


@app.get("/api/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(status="ok")


@app.get("/api/hello", response_model=MessageResponse)
def hello() -> MessageResponse:
    return MessageResponse(message="Pythonバックエンドとの接続に成功しました！")
