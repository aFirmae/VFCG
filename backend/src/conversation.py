"""Conversation engine, implemented as a LangGraph state machine.

Each turn (one citizen message) flows through explicit nodes rather than one
imperative function. This is the seam where the rest of the citizen journey
(DOCUMENT_COLLECTION, PAYMENT, ESCALATION, ...) gets added later as more
nodes/branches, without touching the API layer in main.py.

    extract -> merge -> check_missing --missing--> ask --------> persist -> END
                                       \\--complete--> validate --error--> error_reply -> persist -> END
                                                                 \\--ok----> ready_reply  -> persist -> END

The LLM (extract) only ever produces a *candidate*. missing-field detection
and validate are deterministic and have the final say over what gets accepted -
the graph structure itself keeps those two concerns as separate, un-skippable
steps rather than something an LLM node could quietly bypass.
"""

import logging
from typing import Any, Dict, List, TypedDict

from langgraph.graph import END, StateGraph

from .ai_extractor import extract_information
from .catalog import FIELD_QUESTIONS, SERVICE_CATALOG
from .schemas import ApplicationState
from .state_store import load_state, save_state

logger = logging.getLogger(__name__)


class ConversationState(TypedDict):
    session_id: str
    message: str
    application: Dict[str, Any]
    extracted: Dict[str, Any]
    missing_fields: List[str]
    validation_errors: List[str]
    reply: str


def _missing_fields(application: Dict[str, Any]) -> List[str]:
    service = application.get("service")
    fields = application.get("fields", {})

    if not service or service not in SERVICE_CATALOG:
        return ["service"]

    required = SERVICE_CATALOG[service]["required_fields"]
    return [f for f in required if f not in fields]


def _validate(application: Dict[str, Any]) -> List[str]:
    errors = []
    fields = application.get("fields", {})

    if not application.get("service"):
        errors.append("Certificate service is missing.")
    if "full_name" not in fields:
        errors.append("Full name is required.")
    if "date_of_birth" not in fields:
        errors.append("Date of birth is required.")

    if application.get("service") == "income_certificate" and "annual_income" in fields:
        income = fields["annual_income"]
        if not isinstance(income, (int, float)):
            errors.append("Annual income must be numeric.")
        elif income < 0:
            errors.append("Annual income cannot be negative.")

    return errors


def extract_node(state: ConversationState) -> Dict[str, Any]:
    application = ApplicationState.model_validate(state["application"])
    extracted = extract_information(state["message"], application)
    return {"extracted": extracted}


def merge_node(state: ConversationState) -> Dict[str, Any]:
    application = dict(state["application"])
    fields = dict(application.get("fields", {}))
    extracted = state["extracted"]

    if extracted.get("service"):
        application["service"] = extracted["service"]

    for key, value in extracted.items():
        if key == "service" or value is None:
            continue
        fields[key] = value
    application["fields"] = fields

    history = list(application.get("conversation_history", []))
    history.append({"role": "user", "text": state["message"]})
    application["conversation_history"] = history

    return {"application": application}


def check_missing_node(state: ConversationState) -> Dict[str, Any]:
    return {"missing_fields": _missing_fields(state["application"])}


def route_after_missing(state: ConversationState) -> str:
    return "ask" if state["missing_fields"] else "validate"


def ask_node(state: ConversationState) -> Dict[str, Any]:
    missing = state["missing_fields"]
    reply = FIELD_QUESTIONS.get(missing[0], f"Please provide: {missing[0]}")
    return {"reply": reply, "validation_errors": []}


def validate_node(state: ConversationState) -> Dict[str, Any]:
    return {"validation_errors": _validate(state["application"])}


def route_after_validate(state: ConversationState) -> str:
    return "error" if state["validation_errors"] else "ready"


def error_reply_node(state: ConversationState) -> Dict[str, Any]:
    application = dict(state["application"])
    application["current_status"] = "VALIDATION_FAILED"
    reply = "There are some issues with your application: " + "; ".join(
        state["validation_errors"]
    )
    return {"application": application, "reply": reply}


def ready_reply_node(state: ConversationState) -> Dict[str, Any]:
    application = dict(state["application"])
    application["current_status"] = "READY_FOR_REVIEW"
    reply = "Thanks, I have everything I need. Please review your application."
    return {"application": application, "reply": reply}


def persist_node(state: ConversationState) -> Dict[str, Any]:
    application = dict(state["application"])
    history = list(application.get("conversation_history", []))
    history.append({"role": "system", "text": state["reply"]})
    application["conversation_history"] = history

    validated = ApplicationState.model_validate(application)
    save_state(validated)

    logger.info(
        "conversation_turn session_id=%s service=%s missing_fields=%s status=%s",
        validated.session_id,
        validated.service,
        state["missing_fields"],
        validated.current_status,
    )

    return {"application": validated.model_dump()}


def _build_graph():
    graph = StateGraph(ConversationState)

    graph.add_node("extract", extract_node)
    graph.add_node("merge", merge_node)
    graph.add_node("check_missing", check_missing_node)
    graph.add_node("ask", ask_node)
    graph.add_node("validate", validate_node)
    graph.add_node("error_reply", error_reply_node)
    graph.add_node("ready_reply", ready_reply_node)
    graph.add_node("persist", persist_node)

    graph.set_entry_point("extract")
    graph.add_edge("extract", "merge")
    graph.add_edge("merge", "check_missing")
    graph.add_conditional_edges(
        "check_missing", route_after_missing, {"ask": "ask", "validate": "validate"}
    )
    graph.add_edge("ask", "persist")
    graph.add_conditional_edges(
        "validate", route_after_validate, {"error": "error_reply", "ready": "ready_reply"}
    )
    graph.add_edge("error_reply", "persist")
    graph.add_edge("ready_reply", "persist")
    graph.add_edge("persist", END)

    return graph.compile()


_compiled_graph = _build_graph()


def process_message(session_id: str, message: str) -> Dict[str, Any]:
    state = load_state(session_id)

    result = _compiled_graph.invoke(
        {
            "session_id": session_id,
            "message": message,
            "application": state.model_dump(),
            "extracted": {},
            "missing_fields": [],
            "validation_errors": [],
            "reply": "",
        }
    )

    application = result["application"]

    return {
        "session_id": session_id,
        "service": application.get("service"),
        "collected_fields": application.get("fields", {}),
        "missing_fields": result["missing_fields"],
        "validation_errors": result["validation_errors"],
        "status": application.get("current_status"),
        "reply": result["reply"],
    }
