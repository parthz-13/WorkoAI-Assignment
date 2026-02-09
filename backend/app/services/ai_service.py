from groq import Groq
from app.config import settings


class AIAnalyzer:
    def __init__(self):
        self.client = Groq(api_key=settings.GROQ_API_KEY)
        self.model = "llama-3.3-70b-versatile"  

    def summarize_document(self, document_text: str, style: str = "brief") -> dict:

        prompts = {
            "brief": f"""Provide a concise summary of the following document in 3-4 sentences, capturing only the main points:

    {document_text}

    Summary:""",
            
            "detailed": f"""Provide a comprehensive summary of the following document, covering all major themes, key arguments, and important details:

    {document_text}

    Detailed Summary:""",
            
            "bullet_points": f"""Summarize the following document as a structured list of bullet points, organizing information by topics or themes:

    {document_text}

    Provide the summary in this format:
    • [Main point 1]
    • [Main point 2]
    • [Main point 3]
    ..."""
        }
        
        prompt = prompts.get(style, prompts["brief"])
        
        try:
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": "You are a professional document analyst. Provide clear, accurate summaries based on the requested format."
                    },
                    {"role": "user", "content": prompt}
                ],
                model=self.model,
                temperature=0.5,  
                max_tokens=1500,  
            )
            
            summary = chat_completion.choices[0].message.content
            
            return {
                "success": True, 
                "summary": summary, 
                "style": style,
                "model_used": self.model
            }
            
        except Exception as e:
            return {
                "success": False, 
                "error": f"Summarization failed: {str(e)}"
            }