# SummarizeAI - Document Summarization Service



## Overview

SummarizeAI AI is a document summarization service that leverages Large Language Models to generate summaries in three distinct styles: brief, detailed, and bullet points. The service accepts both PDF file uploads and direct text input.

**Live Demo**: [Your deployed URL here]

**Tech Stack**: FastAPI, Groq API (Llama 3.3), Python 3.11

## Setup Instructions

### Prerequisites

- Python 3.11 or higher
- A Groq API key ([Get one free here](https://console.groq.com))

### Local Installation

**1. Clone the repository**
```bash
git clone <your-repo-url>
cd docusum-ai
```

**2. Create and activate virtual environment**
```bash
# Using venv
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Or using uv (faster)
uv venv
source .venv/bin/activate
```

**3. Install dependencies**
```bash
# Using pip
pip install -r requirements.txt

# Or using uv (faster)
uv sync
```

**4. Configure environment variables**

Create a `.env` file in the project root:
```env
GROQ_API_KEY=your_groq_api_key_here
MAX_FILE_SIZE=10485760
FRONTEND_URL=http://localhost:5173
```

**5. Run the server**
```bash
# Standard method
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Or with uv
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**6. Verify installation**

Visit `http://localhost:8000/health` - you should see:
```json
{"status": "healthy", "api_configured": true}
```

### Quick Start with Docker (Optional)
```bash
docker build -t docusum-ai .
docker run -p 8000:8000 -e GROQ_API_KEY=your_key_here docusum-ai
```

## Usage Guide

### Web Interface (Interactive Docs)

1. Navigate to `http://localhost:8000/docs`
2. Click on the `POST /summarize` endpoint
3. Click "Try it out"
4. Upload a PDF or enter text
5. Select a style (brief/detailed/bullet_points)
6. Click "Execute"

### Command Line (cURL)

**Summarize a PDF file:**
```bash
curl -X POST "http://localhost:8000/summarize" \
  -F "file=@sample.pdf" \
  -F "style=brief"
```

**Summarize text input:**
```bash
curl -X POST "http://localhost:8000/summarize" \
  -F "text=Artificial intelligence has transformed many industries..." \
  -F "style=detailed"
```

**Get available styles:**
```bash
curl http://localhost:8000/styles
```

### Python Script
```python
import requests

# Example 1: PDF summarization
with open('document.pdf', 'rb') as f:
    response = requests.post(
        'http://localhost:8000/summarize',
        files={'file': f},
        data={'style': 'bullet_points'}
    )
    print(response.json()['summary'])

# Example 2: Text summarization
response = requests.post(
    'http://localhost:8000/summarize',
    data={
        'text': 'Your long document text here...',
        'style': 'brief'
    }
)
print(response.json()['summary'])
```

### JavaScript/Frontend Integration
```javascript
// PDF upload example
async function summarizePDF(file, style) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('style', style);
  
  const response = await fetch('http://localhost:8000/summarize', {
    method: 'POST',
    body: formData
  });
  
  return await response.json();
}

// Text input example
async function summarizeText(text, style) {
  const formData = new FormData();
  formData.append('text', text);
  formData.append('style', style);
  
  const response = await fetch('http://localhost:8000/summarize', {
    method: 'POST',
    body: formData
  });
  
  return await response.json();
}

// Usage
const result = await summarizeText('Your document text...', 'detailed');
console.log(result.summary);
```

## API Reference

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API information |
| GET | `/health` | Health check |
| GET | `/styles` | Available summarization styles |
| POST | `/summarize` | Summarize document |

### POST /summarize

**Request Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `style` | string | No | Summarization style: `brief` (default), `detailed`, or `bullet_points` |
| `file` | file | No* | PDF file to summarize |
| `text` | string | No* | Text content to summarize |

*Either `file` OR `text` must be provided, not both.

**Response Format:**
```json
{
  "input_type": "pdf",
  "filename": "document.pdf",
  "style": "brief",
  "summary": "The generated summary text...",
  "model": "llama-3.3-70b-versatile",
  "character_count": 5420
}
```

**Error Responses:**
- `400`: Invalid input (wrong format, file too large, text too short)
- `500`: Server error (API failure, configuration issues)

### Input Constraints

- **PDF files**: Maximum 10MB, must contain selectable text
- **Text input**: Minimum 50 characters, maximum 50,000 characters
- **Supported styles**: brief, detailed, bullet_points

## Design Decisions

### 1. **Architecture: Layered Service Design**

**Rationale**: Separation of concerns for maintainability and testability.
```
API Layer (main.py)
    ↓
Service Layer (ai_service.py, pdf_parser.py)
    ↓
External Services (Groq API)
```

**Benefits**:
- Easy to swap LLM providers (just modify `ai_service.py`)
- PDF parsing logic isolated and reusable
- API endpoints remain clean and focused on HTTP concerns

### 2. **LLM Provider: Groq API**

**Why Groq over OpenAI/Anthropic?**
- ✅ **Free tier** with generous limits (perfect for development/demos)
- ✅ **High performance**: Sub-second inference times
- ✅ **Llama 3.3 70B**: Excellent quality for summarization
- ✅ **Simple API**: Similar to OpenAI, easy integration
- ❌ Trade-off: Less brand recognition than OpenAI

**Alternative considered**: OpenAI GPT-4, but cost and rate limits made Groq more practical for this demo.

### 3. **Dual Input Support: File Upload + Text Area**

**Design choice**: Support both input methods in a single endpoint.

**Rationale**:
- Better user experience (users choose their preferred method)
- Validation enforces exactly one input method
- Shared summarization logic reduces code duplication

**Implementation**:
```python
if file is not None and text is not None:
    raise HTTPException(400, "Provide only ONE input method")
```

### 4. **Three Summarization Styles**

**Brief** (3-4 sentences):
- Use case: Quick overview, email summaries
- Parameters: `temperature=0.5`, `max_tokens=1500`

**Detailed** (comprehensive):
- Use case: Research, thorough understanding
- Captures nuances, context, and supporting details

**Bullet Points** (structured):
- Use case: Meeting notes, action items, scannable format
- Explicitly prompts for topic-organized lists

**Why these three?**
- Cover most common use cases
- Distinct enough to demonstrate API flexibility
- Easy for users to understand and choose

### 5. **Error Handling Strategy**

**Graceful degradation** at every layer:
```python
# Input validation
if not document_text:
    raise HTTPException(400, "Text input cannot be empty")

# Service layer
try:
    chat_completion = self.client.chat.completions.create(...)
except Exception as e:
    return {"success": False, "error": f"Summarization failed: {str(e)}"}

# API layer
if not result.get("success"):
    raise HTTPException(500, result.get("error", "Summarization failed"))
```

**Benefits**:
- User gets specific, actionable error messages
- Application never crashes silently
- Easy debugging during development

### 6. **Input Validation Rules**

**PDF Files**:
- Max size: 10MB (prevents memory issues, timeout)
- Format check: `.pdf` extension
- Content check: Must contain extractable text

**Text Input**:
- Min length: 50 characters (prevents trivial inputs)
- Max length: 50,000 characters (prevents context overflow)

**Rationale**: Balance between flexibility and system protection.

### 7. **Code Reusability Approach**

This project was **adapted from my AI Resume Reviewer** project:

**What was reused**:
- ✅ FastAPI project structure
- ✅ PDF parsing logic
- ✅ Error handling patterns
- ✅ Configuration management

**What was changed**:
- Prompts: Resume analysis → Document summarization
- Endpoints: `/analyze` → `/summarize`
- Response format: Analysis structure → Summary with style metadata
- Input: Single mode → Dual mode (file + text)

**Why this approach?**
- Demonstrates clean, modular code architecture
- Faster development (focus on unique features)
- Production-proven error handling
- Shows ability to adapt existing solutions to new requirements

### 8. **Configuration Management**

Used **Pydantic Settings** for environment variables:
```python
class Settings(BaseSettings):
    GROQ_API_KEY: str
    MAX_FILE_SIZE: int = 10485760
    FRONTEND_URL: str = "http://localhost:5173"
```

**Benefits**:
- Type safety and validation
- Easy testing (mock settings)
- Clear documentation of required config

### 9. **CORS Configuration**

Explicit origin whitelisting:
```python
allow_origins=[
    settings.FRONTEND_URL,
    "http://localhost:5173",
]
```

**Rationale**: Secure by default, easy to extend for production domains.

### 10. **Why FastAPI?**

**Alternatives considered**: Flask, Django

**FastAPI chosen for**:
- ✅ Automatic API documentation (Swagger/ReDoc)
- ✅ Built-in validation with Pydantic
- ✅ Async support (though not needed here)
- ✅ Modern Python type hints
- ✅ Fast development iteration

## Testing

### Manual Testing Checklist

- [ ] Health check returns healthy status
- [ ] PDF upload with each style (brief/detailed/bullet_points)
- [ ] Text input with each style
- [ ] Error case: File too large
- [ ] Error case: Empty text
- [ ] Error case: Both file AND text provided
- [ ] Error case: Invalid style parameter
- [ ] Error case: Non-PDF file upload

### Sample Test Documents

Create test files in `tests/` directory:

**short_doc.txt** (50-100 chars):
```
Artificial intelligence is transforming industries worldwide through automation.
```

**medium_doc.txt** (500-1000 chars):
```
[Include a few paragraphs about any topic]
```

**long_doc.txt** (5000+ chars):
```
[Include several pages of content]
```

### Quick Test Script
```bash
# Test health
curl http://localhost:8000/health

# Test styles endpoint
curl http://localhost:8000/styles

# Test text summarization
curl -X POST "http://localhost:8000/summarize" \
  -F "text=$(cat tests/medium_doc.txt)" \
  -F "style=brief"

# Test PDF summarization
curl -X POST "http://localhost:8000/summarize" \
  -F "file=@tests/sample.pdf" \
  -F "style=bullet_points"
```

## Deployment

**Live URL**: [Add your deployed URL]

Deployed on: Render / Railway / Fly.io (specify which)

**Environment Variables Set**:
- `GROQ_API_KEY`: Production API key
- `MAX_FILE_SIZE`: 10485760
- `FRONTEND_URL`: Production frontend URL

## Project Structure
```
docusum-ai/
├── app/
│   ├── __init__.py
│   ├── main.py              # API endpoints & request handling
│   ├── config.py            # Environment configuration
│   └── services/
│       ├── __init__.py
│       ├── ai_service.py    # LLM integration & summarization
│       └── pdf_parser.py    # PDF text extraction
├── tests/                   # Test documents
├── .env                     # Environment variables (gitignored)
├── .env.example            # Template for .env
├── .python-version         # Python 3.11
├── requirements.txt        # Dependencies
├── Procfile               # Deployment configuration
└── README.md
```

## Assignment Requirements Checklist

- ✅ Accept text input (via file upload or text area)
- ✅ Integrate with LLM API (Groq)
- ✅ Implement different summarization styles (brief, detailed, bullet points)
- ✅ Handle API errors gracefully
- ✅ Include basic input validation
- ✅ Provide simple web interface (FastAPI docs at `/docs`)

## Contact

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your.email@example.com
- LinkedIn: [Your Profile](https://linkedin.com/in/yourprofile)

---

**Built with ❤️ for Worko.ai Technical Assessment**