
import os
import time
from pathlib import Path

from dotenv import load_dotenv
from google import genai
from google.genai import errors

# Load environment variables
load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")
MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

# Supported recording formats
SUPPORTED_FORMATS = {
    ".mp3",
    ".wav",
    ".m4a",
    ".ogg",
    ".webm",
    ".mp4"
}


def wait_for_file_processing(
    client,
    file_name: str,
    timeout: int = 300
):
    """Wait until Gemini finishes processing an uploaded file."""

    start_time = time.time()

    while time.time() - start_time < timeout:
        file_info = client.files.get(name=file_name)
        state = str(file_info.state).upper()

        print(f"Gemini file processing state: {state}")

        if state.endswith("ACTIVE"):
            return file_info

        if state.endswith("FAILED"):
            raise RuntimeError(
                "Gemini could not process the uploaded recording."
            )

        time.sleep(5)

    raise TimeoutError(
        "Gemini file processing timed out. "
        "Try a shorter recording."
    )


def transcribe_audio(file_path: str) -> str:
    """
    Transcribe a meeting recording using Gemini.

    Supports:
    MP3, WAV, M4A, OGG, WEBM and MP4.

    Includes prompt-based speaker identification.
    """

    if not API_KEY:
        raise ValueError("Gemini API key is missing.")

    path = Path(file_path)

    # Validate recording
    if not path.exists():
        raise FileNotFoundError(
            f"Recording not found: {file_path}"
        )

    if path.suffix.lower() not in SUPPORTED_FORMATS:
        raise ValueError(
            f"Unsupported recording format: {path.suffix}"
        )

    if path.stat().st_size == 0:
        raise ValueError(
            "The uploaded recording is empty."
        )

    client = genai.Client(api_key=API_KEY)
    uploaded_file = None

    try:
        # Step 1: Upload recording
        print("Uploading recording to Gemini...")

        uploaded_file = client.files.upload(
            file=str(path)
        )

        # Step 2: Wait for Gemini processing
        print("Waiting for Gemini to process the recording...")

        active_file = wait_for_file_processing(
            client,
            uploaded_file.name
        )

        print(
            "Recording is ready. Starting transcription "
            "with speaker identification..."
        )

        # Step 3: Generate transcript with retries
        response = None

        for attempt in range(3):
            try:
                print(
                    f"Transcription attempt {attempt + 1}/3"
                )

                response = client.models.generate_content(
                    model=MODEL,
                    contents=[
                        active_file,
                        """
                        You are an accurate meeting transcription
                        and speaker identification assistant.

                        Transcribe the COMPLETE meeting recording.

                        SPEAKER IDENTIFICATION:

                        1. Identify each distinguishable speaker.
                        2. Assign consistent labels:
                           Speaker 1, Speaker 2, Speaker 3, etc.
                        3. Use the same label whenever the same
                           voice speaks again.
                        4. Do not invent speaker names.
                        5. Do not guess a person's identity,
                           gender, job title, or role.
                        6. If a voice cannot be distinguished,
                           use [Unknown Speaker].
                        7. If multiple people speak at once,
                           indicate [Overlapping speech] when clear.

                        TRANSCRIPTION:

                        8. Preserve the original spoken language.
                        9. Follow the exact conversation order.
                        10. Do not translate the conversation.
                        11. Do not summarize or omit speech.
                        12. Mark unclear words as [unclear].
                        13. Preserve timestamps when they can
                            be reliably identified.
                        14. Do not invent timestamps.

                        OUTPUT FORMAT:

                        Speaker 1: First speaker's words.

                        Speaker 2: Second speaker's words.

                        Speaker 1: First speaker speaks again.

                        IMPORTANT:

                        Return only the complete transcript.
                        Keep speaker labels consistent throughout
                        the entire recording.
                        """
                    ]
                )

                break

            except errors.ServerError:
                if attempt == 2:
                    raise

                wait_seconds = 10 * (attempt + 1)

                print(
                    "Gemini temporarily unavailable. "
                    f"Retrying in {wait_seconds} seconds..."
                )

                time.sleep(wait_seconds)

        # Step 4: Validate transcript
        if response is None or not response.text:
            raise RuntimeError(
                "Gemini returned an empty transcript."
            )

        print(
            "Transcription with speaker identification "
            "completed successfully."
        )

        return response.text

    finally:
        # Step 5: Delete temporary Gemini upload
        if uploaded_file is not None:
            try:
                client.files.delete(
                    name=uploaded_file.name
                )

                print("Temporary Gemini file deleted.")

            except Exception as error:
                print(
                    "Could not delete Gemini file:",
                    error
                )
