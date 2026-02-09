import PyPDF2
import io
from typing import Optional


class PDFParser:
    @staticmethod
    def extract_text(pdf_bytes: bytes) -> Optional[str]:
        """Extract text from PDF bytes."""
        try:
            pdf_file = io.BytesIO(pdf_bytes)
            pdf_reader = PyPDF2.PdfReader(pdf_file)

            text_content = []
            for page in pdf_reader.pages:
                text = page.extract_text()
                if text:
                    text_content.append(text)

            full_text = "\n".join(text_content)

            if not full_text.strip():
                return None

            return full_text

        except Exception as e:
            raise ValueError(f"Failed to parse PDF: {str(e)}")
