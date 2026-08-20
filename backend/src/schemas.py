from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class ExtractedInformation(BaseModel):
    """Candidate fields extracted from a single user utterance. Nothing here is trusted
    until it passes validation in conversation.py."""

    service: Optional[str] = Field(
        default=None, description="The certificate service requested by the user."
    )
    full_name: Optional[str] = Field(default=None, description="Applicant's full name.")
    date_of_birth: Optional[str] = Field(default=None, description="Applicant's date of birth.")
    annual_income: Optional[float] = Field(default=None, description="Applicant's annual income.")
    occupation: Optional[str] = Field(default=None, description="Applicant's occupation.")
    address: Optional[str] = Field(default=None, description="Applicant's residential address.")
    years_of_residence: Optional[int] = Field(
        default=None, description="Years the applicant has lived at the address."
    )
    caste: Optional[str] = Field(default=None, description="Applicant's caste.")


class ApplicationState(BaseModel):
    session_id: str
    service: Optional[str] = None
    fields: Dict[str, Any] = Field(default_factory=dict)
    current_status: str = "STARTED"
    documents: List[str] = Field(default_factory=list)
    payment_status: str = "NOT_REQUIRED"
    submission_status: str = "NOT_SUBMITTED"
    conversation_history: List[Dict[str, str]] = Field(default_factory=list)
