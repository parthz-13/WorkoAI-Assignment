# SummarizeAI - AI Document Summarization

A modern web application that provides intelligent document summarization powered by AI. Users can upload PDF files or paste text to generate concise summaries in multiple formats.

## Live Demo

- **Frontend**: https://worko-ai-assignment-ten.vercel.app/
- **Backend API**: https://workoai-assignment-a5wp.onrender.com

## Features

- **Dual Input Methods**: Upload PDF files or paste text directly
- **Multiple Summarization Styles**:
  - Brief: Concise 3-4 sentence summary
  - Detailed: Comprehensive coverage of all major themes
  - Bullet Points: Structured summary by topic
- **Drag & Drop Interface**: Intuitive file upload with visual feedback
- **Real-time Processing**: Instant AI-powered summarization
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Error Handling**: Comprehensive error messages and validation

## Architecture

### Backend (FastAPI + Python)

- **FastAPI**: Modern, fast web framework for building APIs
- **Groq AI**: Llama 3.3 70B model for high-quality summarization
- **PyPDF2**: PDF text extraction and processing
- **Uvicorn**: ASGI server for production deployment

### Frontend (React + Vite)

- **React 19**: Modern UI with hooks for state management
- **Vite**: Fast build tool and development server
- **Axios**: HTTP client for API communication
- **CSS3**: Custom styling with modern design patterns

## Setup Instructions

### Prerequisites

- Python 3.11+
- Node.js 16+
- GROQ API key (get from https://console.groq.com/)

### Backend Setup

1. **Clone the repository**:

   ```bash
   git clone https://github.com/parthz-13/WorkoAI-Assignment.git
   cd WorkoAI-Assignment/backend
   ```

2. **Install dependencies**:

   ```bash
   pip install -r requirements.txt
   ```

3. **Create environment file**:

   ```bash
   .env
   ```

4. **Add your GROQ API key to .env**:

   ```env
   GROQ_API_KEY=your_groq_api_key_here
   FRONTEND_URL=http://localhost:5173
   ```

5. **Start the backend server**:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

### Frontend Setup

1. **Navigate to frontend directory**:

   ```bash
   cd ../frontend
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Create environment file**:

   ```bash
   cp .env.example .env
   ```

4. **Configure API URL in .env**:

   ```env
   VITE_API_URL=http://localhost:8000
   ```

5. **Start the development server**:
   ```bash
   npm run dev
   ```

## Design Decisions

### Architecture Choices

- **Separation of Concerns**: Clear distinction between frontend and backend responsibilities
- **RESTful API Design**: Clean, intuitive endpoints for different operations
- **Environment Configuration**: Flexible deployment across different environments

### Technical Decisions

#### Backend

- **FastAPI**: Chosen for its automatic API documentation, type hints, and high performance
- **Groq AI**: Selected for fast inference times and cost-effective Llama 3.3 access
- **PyPDF2**: Reliable PDF parsing with broad compatibility
- **Modular Structure**: Organized into services (AI, PDF parsing) for maintainability

#### Frontend

- **React Hooks**: Modern state management without class components
- **Vite**: Faster development experience compared to Create React App
- **Custom CSS**: Avoided heavy UI frameworks for better performance and control
- **Progressive Enhancement**: Graceful degradation for API failures

### User Experience

- **Immediate Feedback**: Loading states and error messages for all operations
- **Input Validation**: Client-side and server-side validation for robustness
- **Responsive Design**: Mobile-first approach with breakpoint-based layouts
- **Accessibility**: Semantic HTML and keyboard navigation support

## Project Structure

```
WorkoAI-Assignment/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI application and endpoints
│   │   ├── config.py            # Configuration and environment variables
│   │   └── services/
│   │       ├── ai_service.py    # Groq AI integration
│   │       └── pdf_parser.py    # PDF text extraction
│   ├── requirements.txt         # Python dependencies
│   └── .env                     # Environment variables
├── frontend/
│   ├── src/
│   │   ├── App.jsx              # Main React component
│   │   ├── api.js               # API communication layer
│   │   ├── main.jsx             # React entry point
│   │   └── index.css            # Global styles
│   ├── package.json             # Node.js dependencies
│   └── .env                     # Frontend environment variables
└── README.md                    # This file
```

## 🔧 API Endpoints

### Health Check

**GET /health** - Check API status and configuration

**Response**:

```json
{
  "status": "healthy",
  "api_configured": true
}
```

### Summarization

**POST /summarize** - Generate document summary

**Parameters**:

- `style` (brief/detailed/bullet_points)
- `file` (PDF)
- `text` (string)

**Example Request**:

```bash
curl -X POST "http://localhost:8000/summarize" \
  -F "file=@document.pdf" \
  -F "style=brief"
```

**Response**:

```json
{
  "input_type": "pdf",
  "filename": "document.pdf",
  "style": "brief",
  "summary": "Generated summary text...",
  "model": "llama-3.3-70b-versatile",
  "character_count": 5420
}
```

### Styles

**GET /styles** - Get available summarization styles

**Response**:

```json
{
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
```

---
