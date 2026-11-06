
import json
from dotenv import load_dotenv
from google import genai
from google.genai import types
import os

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")
MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")


def analyze_meeting(transcript: str):

    if not API_KEY:
        raise ValueError("Gemini API key is missing.")

    client = genai.Client(api_key=API_KEY)

    prompt = f"""
    Analyze the following meeting transcript.

    Return valid JSON with this structure:

    {{
        "summary": "Short meeting summary",
        "key_points": ["Important discussion points"],
        "decisions": ["Decisions made"],
        "action_items": [
            {{
                "task": "Task description",
                "owner": "Responsible person or Unknown",
                "deadline": "Deadline or Not specified"
            }}
        ]
    }}

    Rules:
    - Use only information from the transcript.
    - Never invent names, decisions or deadlines.
    - If information is missing, use Unknown or Not specified.
    - Keep the summary clear and professional.

    TRANSCRIPT:
    {transcript}
    """

    response = client.models.generate_content(
        model=MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json"
        )
    )

    return json.loads(response.text)
