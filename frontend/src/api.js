import axios from "axios";

const API_BASE_URL = "http://localhost:8000";

export const summarizeDocument = async (payload, style = "brief") => {
  const formData = new FormData();
  formData.append("style", style);

  if (payload.file) {
    formData.append("file", payload.file);
  } else if (payload.text) {
    formData.append("text", payload.text);
  }

  try {
    const response = await axios.post(`${API_BASE_URL}/summarize`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.detail || "Summarization failed");
    }
    throw new Error("Network error. Please ensure the backend is running.");
  }
};

export const checkHealth = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/health`);
    return response.data;
  } catch (error) {
    console.log(error)
    return { status: "unhealthy" };
  }
};
