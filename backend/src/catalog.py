SERVICE_CATALOG = {
    "income_certificate": {
        "name": "Income Certificate",
        "required_fields": [
            "full_name",
            "date_of_birth",
            "annual_income",
            "occupation",
            "address",
        ],
    },
    "domicile_certificate": {
        "name": "Domicile Certificate",
        "required_fields": [
            "full_name",
            "date_of_birth",
            "address",
            "years_of_residence",
        ],
    },
    "caste_certificate": {
        "name": "Caste Certificate",
        "required_fields": [
            "full_name",
            "date_of_birth",
            "address",
            "caste",
        ],
    },
}

FIELD_QUESTIONS = {
    "full_name": "What is your full name?",
    "date_of_birth": "What is your date of birth?",
    "annual_income": "What is your annual income?",
    "occupation": "What is your occupation?",
    "address": "What is your current residential address?",
    "years_of_residence": "How many years have you been living at this address?",
    "caste": "What is your caste?",
}
