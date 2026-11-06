
import os
import aiosmtplib

from email.message import EmailMessage


async def send_meeting_report(
    recipient_email: str,
    pdf_bytes: bytes,
    meeting_title: str
):
    sender_email = os.getenv("SMTP_USERNAME")
    sender_password = os.getenv("SMTP_PASSWORD")

    if not sender_email or not sender_password:
        raise ValueError(
            "Email configuration is missing. Check backend .env file."
        )

    message = EmailMessage()

    message["From"] = sender_email
    message["To"] = recipient_email
    message["Subject"] = f"Meeting Report - {meeting_title}"

    message.set_content(
        f"""
Hello,

Please find attached the meeting report for:

Meeting: {meeting_title}

The report includes:
- Executive summary
- Key discussion points
- Decisions made
- Action items
- Meeting transcript

Thank you,
RESSHMA VP
MeetMind AI
        """
    )

    message.add_attachment(
        pdf_bytes,
        maintype="application",
        subtype="pdf",
        filename="MeetMind_AI_Meeting_Report.pdf"
    )

    try:
        await aiosmtplib.send(
            message,
            hostname="smtp.gmail.com",
            port=465,
            username=sender_email,
            password=sender_password,
            use_tls=True
        )

        return {
            "success": True,
            "message": "Meeting report sent successfully."
        }

    except Exception as error:
        print("Email sending error:", error)
        raise
