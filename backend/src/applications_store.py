"""In-memory store for submitted certificate applications.

All data lives in a module-level dict and is lost when the server restarts.
This is intentional — the store is meant for session-lifetime demos only.
"""

import threading
from datetime import datetime, timezone
from typing import Any, Dict, List

from .schemas import ApplicationState

# Thread-safe lock for the shared store
_lock = threading.Lock()

# {application_no: {…record…}}
_applications: Dict[str, Dict[str, Any]] = {}

# Per-prefix sequential counters  e.g. {"INC": 3, "DOM": 1}
_counters: Dict[str, int] = {}

# Certificate-type → prefix mapping
_PREFIX_MAP = {
    "income_certificate": "INC",
    "domicile_certificate": "DOM",
    "caste_certificate": "CST",
}


def _generate_application_no(service: str) -> str:
    """Generate an application number like INC-20260822-0001."""
    prefix = _PREFIX_MAP.get(service, "APP")
    date_str = datetime.now(timezone.utc).strftime("%Y%m%d")

    with _lock:
        key = f"{prefix}-{date_str}"
        _counters[key] = _counters.get(key, 0) + 1
        seq = _counters[key]

    return f"{prefix}-{date_str}-{seq:04d}"


def submit_application(state: ApplicationState) -> Dict[str, Any]:
    """Persist a READY_FOR_REVIEW application and return the stored record."""
    application_no = _generate_application_no(state.service or "unknown")
    now = datetime.now(timezone.utc)

    record = {
        "application_no": application_no,
        "session_id": state.session_id,
        "service": state.service,
        "fields": dict(state.fields),
        "status": "SUBMITTED",
        "submitted_at": now.isoformat(),
        "submitted_at_display": now.strftime("%d %b %Y, %I:%M %p UTC"),
    }

    with _lock:
        _applications[application_no] = record

    return record


def list_applications() -> List[Dict[str, Any]]:
    """Return all submitted applications (newest first)."""
    with _lock:
        apps = list(_applications.values())
    # Sort newest-first by submitted_at
    apps.sort(key=lambda r: r["submitted_at"], reverse=True)
    return apps
