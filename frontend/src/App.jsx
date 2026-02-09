import { useState, useEffect } from "react";
import { summarizeDocument, checkHealth } from "./api";

function App() {
  const [file, setFile] = useState(null);
  const [textInput, setTextInput] = useState("");
  const [inputType, setInputType] = useState("file"); 
  const [style, setStyle] = useState("brief");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [apiHealthy, setApiHealthy] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    checkHealth().then((health) => {
      setApiHealthy(health.status === "healthy" && health.api_configured);
    });
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    validateAndSetFile(selectedFile);
  };

  const validateAndSetFile = (selectedFile) => {
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setError(null);
      setResult(null);
    } else {
      setError("Please select a valid PDF file");
      setFile(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const selectedFile = e.dataTransfer.files[0];
    validateAndSetFile(selectedFile);
  };

  const handleSummarize = async () => {
    if (!apiHealthy) {
      setError(
        "Backend API is not configured. Please check GROQ_API_KEY in backend .env file.",
      );
      return;
    }

    if (inputType === "file" && !file) {
      setError("Please select a file first");
      return;
    }

    if (inputType === "text" && !textInput.trim()) {
      setError("Please enter some text to summarize");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const payload = inputType === "file" ? { file } : { text: textInput };
      const data = await summarizeDocument(payload, style);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (result) {
      const resultsElement = document.querySelector(".results-container");
      if (resultsElement) {
        resultsElement.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [result]);

  return (
    <div className="app">
      <div className="hero">
        <h1>
          Summarize <span className="hero-highlight">AI</span>
        </h1>
        <p>
          Intelligent document summarization powered by AI. Upload a PDF or
          paste text to get started.
        </p>
        {!apiHealthy && (
          <div className="warning-banner">
            ⚠️ Hosted on free-tier infrastructure. First request may take ~20–30
            seconds due to cold start. Kindly wait for this message to
            disappear.
          </div>
        )}
      </div>

      <div className="upload-container">
        <div className="input-tabs">
          <button
            className={`tab-btn ${inputType === "file" ? "active" : ""}`}
            onClick={() => setInputType("file")}
          >
            File Upload
          </button>
          <button
            className={`tab-btn ${inputType === "text" ? "active" : ""}`}
            onClick={() => setInputType("text")}
          >
            Text Input
          </button>
        </div>

        {inputType === "file" ? (
          <div
            className={`drop-zone ${isDragOver ? "dragging" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="file-input"
              id="file-upload"
            />

            <div className="icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                />
              </svg>
            </div>

            <div className="drop-text">
              {file ? file.name : "Choose a PDF file or drag & drop it here"}
            </div>
            <div className="drop-subtext">PDF formats, up to 5MB</div>
          </div>
        ) : (
          <div className="text-input-container">
            <textarea
              className="text-area"
              placeholder="Paste your text here (min 50 characters)..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              rows={10}
            />
          </div>
        )}

        <div className="controls-container">
          <label className="style-label">Summarization Style:</label>
          <select
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            className="style-select"
          >
            <option value="brief">Brief (Concise)</option>
            <option value="detailed">Detailed (Comprehensive)</option>
            <option value="bullet_points">Bullet Points (Structured)</option>
          </select>
        </div>

        <button
          onClick={handleSummarize}
          disabled={
            loading ||
            (inputType === "file" && !file) ||
            (inputType === "text" && !textInput.trim())
          }
          className="analyze-btn"
        >
          {loading ? "Summarizing..." : "Summarize"}
        </button>

        {loading && (
          <div className="loading-container">
            <span className="loader"></span>
            <p>Processing document... This may take a few seconds.</p>
          </div>
        )}

        {result && !loading && (
          <div
            className="success-message"
            style={{
              marginTop: "20px",
              textAlign: "center",
              color: "#468d68ff",
              fontWeight: "bold",
              fontSize: "1.1rem",
            }}
          >
            Summary generated successfully!
          </div>
        )}

        {error && (
          <div className="error" style={{ marginTop: "20px" }}>
            <strong>Error:</strong> {error}
          </div>
        )}
      </div>

      {result && (
        <div className="results-container">
          <div className="results-header">
            <h2>Summary Results</h2>
            <div className="result-meta">
              <span className="meta-tag">{result.style}</span>
              <span className="meta-tag">
                {result.input_type === "pdf" ? "PDF" : "Text"}
              </span>
            </div>
          </div>
          <div className="results-content">
            {result.summary.split("\n").map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
