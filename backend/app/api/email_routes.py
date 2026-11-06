
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.services.email_service import send_meeting_report

router = APIRouter(
    prefix="/api/email",
    tags=["Email Reports"]
)


@router.post("/send-report")
async def send_report(
    recipient_email: str = Form(...),
    meeting_title: str = Form(...),
    pdf_file: UploadFile = File(...)
):
    if not recipient_email.strip():
        raise HTTPException(
            status_code=400,
            detail="Client email address is required."
        )

    if not pdf_file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed."
        )

    pdf_bytes = await pdf_file.read()

    if not pdf_bytes:
        raise HTTPException(
            status_code=400,
            detail="Uploaded PDF is empty."
        )

    if not pdf_bytes.startswith(b"%PDF-"):
        raise HTTPException(
            status_code=400,
            detail="Invalid PDF file."
        )

    try:
        result = await send_meeting_report(
            recipient_email=recipient_email,
            pdf_bytes=pdf_bytes,
            meeting_title=meeting_title
        )

        return result

    except Exception as error:
        print("Report email error:", error)

        raise HTTPException(
            status_code=500,
            detail="Unable to send the meeting report."
        )
