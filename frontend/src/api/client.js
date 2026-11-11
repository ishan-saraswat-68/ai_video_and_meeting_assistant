const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

/**
 * Common handler for checking fetch responses and extracting descriptive errors
 */
async function handleResponse(response) {
  if (!response.ok) {
    let errorDetail = `Request failed with status ${response.status}`;
    try {
      const data = await response.json();
      if (data && data.detail) {
        errorDetail = typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail);
      }
    } catch {
      // Fallback to text or status text
      const text = await response.text().catch(() => '');
      if (text) errorDetail = text;
    }
    throw new Error(errorDetail);
  }
  return await response.json();
}

/**
 * Health check endpoint
 */
export async function checkHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/`);
    return await handleResponse(res);
  } catch (err) {
    console.warn("Backend health check failed:", err.message);
    return null;
  }
}

/**
 * Process YouTube or Web Media URL
 * @param {string} url 
 * @param {'english' | 'hinglish'} language 
 */
export async function processUrl(url, language = 'english') {
  const response = await fetch(`${API_BASE_URL}/api/process-url`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url: url.trim(), language }),
  });
  return await handleResponse(response);
}

/**
 * Upload audio or video file
 * @param {File} file 
 * @param {'english' | 'hinglish'} language 
 */
export async function uploadFile(file, language = 'english') {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('language', language);

  // Note: Content-Type is intentionally omitted so the browser automatically sets the multipart boundary
  const response = await fetch(`${API_BASE_URL}/api/upload`, {
    method: 'POST',
    body: formData,
  });
  return await handleResponse(response);
}

/**
 * Fetch processed session data by session_id
 * @param {string} sessionId 
 */
export async function getSession(sessionId) {
  const response = await fetch(`${API_BASE_URL}/api/session/${encodeURIComponent(sessionId)}`);
  return await handleResponse(response);
}

/**
 * Ask a question about the video transcript using RAG
 * @param {string} sessionId 
 * @param {string} question 
 */
export async function askQuestion(sessionId, question) {
  const response = await fetch(`${API_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      session_id: sessionId,
      question: question.trim(),
    }),
  });
  return await handleResponse(response);
}

export { API_BASE_URL };
