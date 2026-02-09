from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import Optional

from app.config import settings
from app.services.pdf_parser import PDFParser
from app.services.ai_service import AIAnalyzer

app = FastAPI(
    title="Summarize AI", 
    description="AI-powered document summarization API", 
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
        "https://worko-ai-assignment-ten.vercel.app",
        "http://localhost:5173",
        "http://localhost:3000",  
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

pdf_parser = PDFParser()
ai_analyzer = AIAnalyzer()


@app.get("/")
async def root():
    return {
        "message": "Document Summarization AI API",
        "endpoints": {
            "POST /summarize": "Summarize a document (PDF file or text input)",
            "GET /health": "Health check endpoint",
            "GET /styles": "Get available summarization styles"
        },
    }


@app.get("/health")
@app.head("/health")
async def health_check():
    return {"status": "healthy", "api_configured": bool(settings.GROQ_API_KEY)}


@app.get("/styles")
async def get_styles():
    return {
        "styles": [
            {
                "name": "brief",
                "description": "Concise 3-4 sentence summary of main points"
            },
            {
                "name": "detailed",
                "description": "Comprehensive summary covering all major themes"
            },
            {
                "name": "bullet_points",
                "description": "Structured bullet-point summary by topic"
            }
        ]
    }


@app.post("/summarize")
async def summarize_document(
    style: str = Form(default="brief"),
    file: Optional[UploadFile] = File(None),
    text: Optional[str] = Form(None)
):

    
    valid_styles = ["brief", "detailed", "bullet_points"]
    if style not in valid_styles:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid style. Choose from: {', '.join(valid_styles)}"
        )
    
    if file is None and text is None:
        raise HTTPException(
            status_code=400,
            detail="Please provide either a PDF file or text input"
        )
    
    if file is not None and text is not None:
        raise HTTPException(
            status_code=400,
            detail="Please provide only one input method (file OR text, not both)"
        )
    
    document_text = None
    input_type = None
    
    if file is not None:
        if not file.filename.endswith(".pdf"):
            raise HTTPException(
                status_code=400, 
                detail="Only PDF files are supported"
            )
        
        try:
            file_content = await file.read()
            
            if len(file_content) > settings.MAX_FILE_SIZE:
                raise HTTPException(
                    status_code=400,
                    detail=f"File too large. Maximum size: {settings.MAX_FILE_SIZE / (1024 * 1024)}MB",
                )
        except Exception as e:
            raise HTTPException(
                status_code=500, 
                detail=f"Failed to read file: {str(e)}"
            )
        
        try:
            document_text = pdf_parser.extract_text(file_content)
            
            if not document_text:
                raise HTTPException(
                    status_code=400,
                    detail="Could not extract text from PDF. Please ensure the PDF contains selectable text.",
                )
            
            input_type = "pdf"
            
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
        except Exception as e:
            raise HTTPException(
                status_code=500, 
                detail=f"PDF processing failed: {str(e)}"
            )
    

    else:
        document_text = text.strip()
        

        if not document_text:
            raise HTTPException(
                status_code=400,
                detail="Text input cannot be empty"
            )
        
        if len(document_text) < 50:
            raise HTTPException(
                status_code=400,
                detail="Text is too short to summarize (minimum 50 characters)"
            )
        

        max_text_length = 50000  
        if len(document_text) > max_text_length:
            raise HTTPException(
                status_code=400,
                detail=f"Text is too long. Maximum length: {max_text_length} characters"
            )
        
        input_type = "text"
    
    if not settings.GROQ_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="AI service not configured. Please set GROQ_API_KEY.",
        )
    
    result = ai_analyzer.summarize_document(document_text, style)
    
    if not result.get("success"):
        raise HTTPException(
            status_code=500, 
            detail=result.get("error", "Summarization failed")
        )
    
    return JSONResponse(
        content={
            "input_type": input_type,
            "filename": file.filename if file else None,
            "style": style,
            "summary": result["summary"],
            "model": result["model_used"],
            "character_count": len(document_text),
        }
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)