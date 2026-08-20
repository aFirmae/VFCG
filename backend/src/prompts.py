"""Prompt library for backend LLM calls.

Every prompt sent to a model lives here, not inline in adapter code. Two
things that buys us:

1. One place to audit for the data-sovereignty rule: restricted citizen
   fields only ever leave the local process if this file deliberately puts
   them in a template. A reviewer checking what crosses the cloud-AI
   boundary only has to read this module, not grep the whole codebase.
2. Prompt wording is decoupled from the code that calls the model, so it
   can be tuned without touching ai_extractor.py, and reused from another
   call site later without duplicating the string.

Static instructions are kept as a fixed prefix, with the per-turn payload
(catalog context, collected fields, user message) appended after. Providers
with prefix/context caching (Gemini included) can then reuse the cached
prefix across turns instead of reprocessing it every time - keeping that
boundary byte-for-byte stable is a real token/cost saving, not just style.
"""

import json
from typing import Optional

from .catalog import SERVICE_CATALOG
from .schemas import ApplicationState

EXTRACTION_INSTRUCTIONS = """\
You are an information extraction agent for a government certificate \
application system.

Extract ONLY information explicitly provided by the user in their message.

Rules:
- Do not invent or infer information the user did not state.
- If a field is not mentioned in this message, return null for it.
- If the user is correcting a value they gave earlier, return the corrected \
value for that field.
- Identify the certificate service the user wants, if it can be determined.\
"""


def _service_catalog_context(service: Optional[str]) -> str:
    """The catalog slice relevant to this turn, and nothing more.

    Before a service is chosen, the model only needs id -> display name to
    map informal phrasing ("income certificate") onto a catalog entry - full
    field lists for every service would just be unused tokens. Once a
    service is locked in, only that service's required fields matter; the
    other ~20+ services in a full catalog become irrelevant. Either way the
    prompt stays a fixed small size regardless of how large the catalog
    grows, instead of scaling with the number of certificate services.
    """

    if service and service in SERVICE_CATALOG:
        entry = SERVICE_CATALOG[service]
        return json.dumps(
            {"selected_service": service, "required_fields": entry["required_fields"]},
            indent=2,
        )

    available = {sid: entry["name"] for sid, entry in SERVICE_CATALOG.items()}
    return json.dumps({"available_services": available}, indent=2)


def render_extraction_prompt(message: str, application: ApplicationState) -> str:
    """Prompt for turning one user utterance into candidate structured
    fields. The result is only ever a candidate - the caller still runs it
    through deterministic schema and business-rule validation before
    anything is accepted."""

    catalog_context = _service_catalog_context(application.service)
    current_fields = json.dumps(application.fields, indent=2)

    return f"""{EXTRACTION_INSTRUCTIONS}

Certificate catalog context:
{catalog_context}

Fields already collected in this application:
{current_fields}

User message:
{message}
"""
