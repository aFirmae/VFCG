import logging

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .applications_store import list_applications, submit_application
from .conversation import process_message
from .state_store import load_state

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Allow CORS from the frontend dev server (Vite may use 5173 or 5174)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DEFAULT_SESSION_ID = "default"


class MessageRequest(BaseModel):
    message: str
    session_id: str | None = None


class SubmitRequest(BaseModel):
    session_id: str


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


# ───────── Application submission & listing ─────────


@app.post("/applications/submit")
async def submit(payload: SubmitRequest):
    """Submit an application that is READY_FOR_REVIEW and get an application number."""
    state = load_state(payload.session_id)

    if state.current_status != "READY_FOR_REVIEW":
        raise HTTPException(
            status_code=400,
            detail=f"Application is not ready for submission (status={state.current_status}). "
            "Please complete all required fields first.",
        )

    record = submit_application(state)
    logger.info(
        "application_submitted app_no=%s session=%s service=%s",
        record["application_no"],
        payload.session_id,
        record["service"],
    )
    return record


@app.get("/applications")
async def get_applications():
    """Return all submitted applications (newest first). In-memory only."""
    return list_applications()


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
