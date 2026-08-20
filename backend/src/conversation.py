import logging
from typing import Any, Dict, List

from .ai_extractor import extract_information
from .catalog import FIELD_QUESTIONS, SERVICE_CATALOG
from .schemas import ApplicationState
from .state_store import load_state, save_state

logger = logging.getLogger(__name__)


def _update_state(state: ApplicationState, extracted: Dict[str, Any]) -> ApplicationState:
    if extracted.get("service"):
        state.service = extracted["service"]

    for key, value in extracted.items():
        if key == "service" or value is None:
            continue
        state.fields[key] = value

    return state


def _missing_fields(state: ApplicationState) -> List[str]:
    if not state.service or state.service not in SERVICE_CATALOG:
        return ["service"]

    required = SERVICE_CATALOG[state.service]["required_fields"]
    return [f for f in required if f not in state.fields]


def _validate(state: ApplicationState) -> List[str]:
    errors = []

    if not state.service:
        errors.append("Certificate service is missing.")
    if "full_name" not in state.fields:
        errors.append("Full name is required.")
    if "date_of_birth" not in state.fields:
        errors.append("Date of birth is required.")

    if state.service == "income_certificate" and "annual_income" in state.fields:
        income = state.fields["annual_income"]
        if not isinstance(income, (int, float)):
            errors.append("Annual income must be numeric.")
        elif income < 0:
            errors.append("Annual income cannot be negative.")

    return errors


def process_message(session_id: str, message: str) -> Dict[str, Any]:
    state = load_state(session_id)

    extracted = extract_information(message, state)
    state = _update_state(state, extracted)
    state.conversation_history.append({"role": "user", "text": message})

    missing = _missing_fields(state)
    errors = _validate(state) if not missing else []

    if missing:
        reply = FIELD_QUESTIONS.get(missing[0], f"Please provide: {missing[0]}")
    elif errors:
        reply = "There are some issues with your application: " + "; ".join(errors)
        state.current_status = "VALIDATION_FAILED"
    else:
        state.current_status = "READY_FOR_REVIEW"
        reply = "Thanks, I have everything I need. Please review your application."

    state.conversation_history.append({"role": "system", "text": reply})
    save_state(state)

    logger.info(
        "conversation_turn session_id=%s service=%s missing_fields=%s status=%s",
        session_id,
        state.service,
        missing,
        state.current_status,
    )

    return {
        "session_id": session_id,
        "service": state.service,
        "collected_fields": state.fields,
        "missing_fields": missing,
        "validation_errors": errors,
        "status": state.current_status,
        "reply": reply,
    }
