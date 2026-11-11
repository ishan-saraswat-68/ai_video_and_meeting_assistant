# AI Video Assistant - API & Frontend Integration Guide

This guide explains how the **FastAPI backend** (`api.py`) works and how to connect any web frontend (React, Next.js, Vite, Vue, Svelte, or plain HTML/JS).

---

## 1. Running the Backend Server

Start the API with Uvicorn:

```bash
uvicorn api:app --reload --port 8000
```

- **Base URL**: `http://localhost:8000`
- **Interactive Swagger Docs**: `http://localhost:8000/docs`
- **ReDoc API Documentation**: `http://localhost:8000/redoc`
- **CORS**: Enabled by default for all origins (`*`) so your local frontend dev server (e.g. `http://localhost:3000` or `http://localhost:5173`) can communicate directly.

---

## 2. API Endpoints Overview

| Method | Endpoint | Description | Content-Type |
|---|---|---|---|
| `GET` | `/` | Health check | `application/json` |
| `POST` | `/api/process-url` | Process a YouTube URL | `application/json` |
| `POST` | `/api/upload` | Process an uploaded video/audio file | `multipart/form-data` |
| `POST` | `/api/chat` | Ask questions to the video's RAG chain | `application/json` |
| `GET` | `/api/session/{session_id}` | Retrieve cached session data | `application/json` |

---

## 3. Endpoints In Detail

### 3.1. Process YouTube URL: `POST /api/process-url`

Fetches direct subtitles in 1-2 seconds (or falls back to audio download + transcription), generates dynamically scaled notes, and indexes the transcript into RAG.

#### Request Body (`application/json`):
```json
{
  "url": "https://www.youtube.com/watch?v=JWEIdvoz1To",
  "language": "english"
}
```
> `language` can be `"english"` or `"hinglish"`.

#### Response (`200 OK`):
```json
{
  "session_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "title": "Master OOP in Java: Comprehensive Guide",
  "summary": "### **Executive & Technical Summary**\n\n## Key Discussion Points & Modules:\n* **[Module 1: Classes & Objects]**...",
  "action_items": "1. Implement custom classes with constructors\n2. Practice method overriding",
  "key_decisions": "1. Encapsulation preferred for mutable fields",
  "open_questions": "No open questions noted.",
  "transcript": "Full raw text..."
}
```

---

### 3.2. Upload Local Audio/Video File: `POST /api/upload`

Uploads any meeting recording or lecture (`.mp3`, `.mp4`, `.wav`, `.m4a`, etc.).

#### Request (`multipart/form-data`):
- `file`: The media file binary
- `language`: `"english"` (default) or `"hinglish"` (form field)

#### Response (`200 OK`):
Returns the same JSON format as `/api/process-url` with a unique `session_id`.

---

### 3.3. Chat with Video: `POST /api/chat`

Ask any question about the video transcript using the `session_id` returned from processing.

#### Request Body (`application/json`):
```json
{
  "session_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "question": "What did the speaker say about inheritance and polymorphism?"
}
```

#### Response (`200 OK`):
```json
{
  "session_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "question": "What did the speaker say about inheritance and polymorphism?",
  "answer": "The speaker explained that inheritance allows a child class to inherit fields and methods from a parent class..."
}
```

---

### 3.4. Get Session Details: `GET /api/session/{session_id}`

Retrieves previously processed data by ID without reprocessing.

---

## 4. Frontend Integration Guide

Here is a quick reference showing how to wire these endpoints into your frontend.

### 4.1. React / Next.js / TypeScript Example

```tsx
import React, { useState } from 'react';

const API_BASE = "http://localhost:8000";

export function VideoAssistant() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  
  // Chat state
  const [question, setQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState<Array<{role: string, text: string}>>([]);

  // 1. Process Video
  const handleProcessUrl = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/process-url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, language: "english" }),
      });
      const result = await res.json();
      setData(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 2. Chat with Video
  const handleAskQuestion = async () => {
    if (!data?.session_id || !question.trim()) return;

    const userQ = question;
    setQuestion("");
    setChatHistory(prev => [...prev, { role: "user", text: userQ }]);

    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: data.session_id, question: userQ }),
      });
      const chatRes = await res.json();
      setChatHistory(prev => [...prev, { role: "assistant", text: chatRes.answer }]);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <input 
        value={url} 
        onChange={(e) => setUrl(e.target.value)} 
        placeholder="Enter YouTube URL..." 
      />
      <button onClick={handleProcessUrl} disabled={loading}>
        {loading ? "Processing..." : "Analyze Video"}
      </button>

      {data && (
        <div>
          <h2>{data.title}</h2>
          <div className="summary">{data.summary}</div>

          <h3>Chat</h3>
          <div className="messages">
            {chatHistory.map((msg, i) => (
              <p key={i}><strong>{msg.role}:</strong> {msg.text}</p>
            ))}
          </div>
          <input 
            value={question} 
            onChange={(e) => setQuestion(e.target.value)} 
            placeholder="Ask anything about the video..." 
          />
          <button onClick={handleAskQuestion}>Ask</button>
        </div>
      )}
    </div>
  );
}
```

### 4.2. File Upload via JavaScript (`FormData`)

```javascript
async function uploadVideo(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("language", "english");

  const response = await fetch("http://localhost:8000/api/upload", {
    method: "POST",
    body: formData, // do not set Content-Type header manually; browser sets boundary
  });
  return await response.json();
}
```

---

## 5. Recommended Frontend Flow

1. **Input Screen**:
   - URL input bar (with tab to toggle between "YouTube URL" and "Upload File").
   - Dropzone for local audio/video file drag-and-drop.
2. **Processing State**:
   - Show quick status loader. Fast YouTube subtitle fetches take ~1-2 seconds, while file uploads take a few seconds longer.
3. **Results View**:
   - **Main Card**: Render `summary` using a markdown renderer (like `react-markdown` or `marked`).
   - **Action Items / Decisions**: Display cards for `action_items`, `key_decisions`, and `open_questions`.
   - **Chat Box**: Persistent chat pane using `/api/chat` with `session_id`.
