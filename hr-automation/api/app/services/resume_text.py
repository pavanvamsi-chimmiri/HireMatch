from io import BytesIO

from pypdf import PdfReader


def extract_text_from_upload(file_name: str, content: bytes) -> str:
    lower = file_name.lower()
    if lower.endswith(".pdf"):
        reader = PdfReader(BytesIO(content))
        parts: list[str] = []
        for page in reader.pages:
            text = page.extract_text() or ""
            if text.strip():
                parts.append(text)
        return "\n".join(parts).strip()

    if lower.endswith(".docx"):
        from docx import Document

        document = Document(BytesIO(content))
        return "\n".join(p.text for p in document.paragraphs if p.text.strip())

    if lower.endswith(".txt"):
        return content.decode("utf-8", errors="ignore").strip()

    raise ValueError("Unsupported file type. Upload PDF, DOCX, or TXT.")
