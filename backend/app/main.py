from fastapi import FastAPI
from pydantic import BaseModel

from app.hotpepper import router as hotpepper_router

app = FastAPI(title="JPHack API", version="0.1.0")
app.include_router(hotpepper_router)


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
