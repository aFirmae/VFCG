from typing import Any, Dict

from google import genai

from . import config
from .prompts import render_extraction_prompt
from .schemas import ApplicationState, ExtractedInformation

_client = None


def _get_client() -> genai.Client:
    global _client
    if _client is None:
        if not config.GEMINI_API_KEY:
            raise RuntimeError(
                "GEMINI_API_KEY is not set. Copy backend/.env.example to backend/.env "
                "and add your key."
            )
        _client = genai.Client(api_key=config.GEMINI_API_KEY)
    return _client


def extract_information(user_message: str, state: ApplicationState) -> Dict[str, Any]:
    """Send the user's utterance to Gemini and get back a schema-shaped candidate.
    Callers must still run this through deterministic validation before trusting it."""

    prompt = render_extraction_prompt(user_message, state)

    client = _get_client()
    response = client.models.generate_content(
        model=config.GEMINI_MODEL,
        contents=prompt,
        config={
            "response_mime_type": "application/json",
            "response_schema": ExtractedInformation,
        },
    )

    return ExtractedInformation.model_validate_json(response.text).model_dump()
