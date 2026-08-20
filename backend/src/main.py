import logging

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .conversation import process_message

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Allow CORS from the frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DEFAULT_SESSION_ID = "default"


class MessageRequest(BaseModel):
    message: str
    session_id: str | None = None


@app.get("/")
async def read_root():
    return {"message": "Hello from FastAPI backend"}


@app.post("/")
@app.post("/conversation/message")
async def receive_message(payload: MessageRequest):
    if not payload.message or not payload.message.strip():
        raise HTTPException(status_code=400, detail="message must not be empty")

    session_id = payload.session_id or DEFAULT_SESSION_ID

    try:
        return process_message(session_id, payload.message)
    except RuntimeError as e:
        logger.error("extraction_config_error error=%s", str(e))
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
