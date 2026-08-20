import json
import os

from . import config
from .schemas import ApplicationState

os.makedirs(config.DATA_DIR, exist_ok=True)


def _path(session_id: str) -> str:
    safe_id = "".join(c for c in session_id if c.isalnum() or c in ("-", "_")) or "default"
    return os.path.join(config.DATA_DIR, f"{safe_id}.json")


def load_state(session_id: str) -> ApplicationState:
    path = _path(session_id)
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        return ApplicationState.model_validate(data)
    return ApplicationState(session_id=session_id)


def save_state(state: ApplicationState) -> None:
    path = _path(state.session_id)
    with open(path, "w", encoding="utf-8") as f:
        f.write(state.model_dump_json(indent=2))
