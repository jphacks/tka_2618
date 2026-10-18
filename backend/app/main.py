import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.hotpepper import router as hotpepper_router
from app.locations import router as locations_router

app = FastAPI(title="JPHack API", version="0.1.0")
cors_origins = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS", "http://localhost:8000,http://127.0.0.1:8000"
    ).split(",")
    if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(hotpepper_router)
app.include_router(locations_router)


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
