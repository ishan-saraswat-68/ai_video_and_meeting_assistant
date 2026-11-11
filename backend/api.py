import os
import uuid
import shutil
from typing import Optional, Dict, Any
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Core pipeline imports
from utils.audio_processor import process_input, get_youtube_transcript_fast
from core.transcriber import transcribe_all
from core.summarizer import analyze_transcript
from core.rag_engine import build_rag_chain, ask_question

app = FastAPI(
    title="AI Video Assistant API",
    description="REST backend for transcribing, summarizing, and conversational RAG querying over videos and meetings.",
    version="1.0.0"
)

# Allow Cross-Origin Requests from frontend dev servers (React, Next.js, Vite, Vue, etc.)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# In-memory storage for processed video sessions & active RAG chains
# session_id -> { "title", "transcript", "summary", "action_items", "key_decisions", "open_questions", "rag_chain" }
sessions: Dict[str, Dict[str, Any]] = {}


# --- Request / Response Schemas ---

class ProcessUrlRequest(BaseModel):
    url: str = Field(..., description="YouTube video URL or direct web media link")
    language: str = Field(default="english", description="'english' or 'hinglish'")


class ChatRequest(BaseModel):
    session_id: str = Field(..., description="The session_id returned from /api/process-url or /api/upload")
    question: str = Field(..., description="Question to ask the meeting/video")


class ProcessResponse(BaseModel):
    session_id: str
    title: str
    transcript: str
    summary: str
    action_items: str
    key_decisions: str
    open_questions: str


class ChatResponse(BaseModel):
    session_id: str
    question: str
    answer: str


# --- Core Helper ---

def run_analysis_pipeline(source: str, language: str = "english") -> Dict[str, Any]:
    """Runs the processing pipeline on a given URL or saved local audio/video file."""
    audio_path = None
    transcript = None
    try:
        # 1. If YouTube URL, attempt fast subtitle fetch (1-2s)
        if source.startswith("http://") or source.startswith("https://"):
            transcript = get_youtube_transcript_fast(source)

        # 2. If subtitles unavailable or local file uploaded, downsample audio & transcribe
        if not transcript:
            audio_path = process_input(source)
            transcript = transcribe_all(audio_path, language)

        if not transcript:
            raise ValueError("Failed to obtain transcript from media.")

        # 3. Analyze transcript with Gemini (scaled according to length)
        analysis = analyze_transcript(transcript)

        # 4. Build RAG chain for real-time Q&A
        rag_chain = build_rag_chain(transcript, analysis["summary"])

        session_id = str(uuid.uuid4())
        sessions[session_id] = {
            "title": analysis.get("title", "Video Analysis"),
            "transcript": transcript,
            "summary": analysis.get("summary", ""),
            "action_items": analysis.get("action_items", ""),
            "key_decisions": analysis.get("key_decisions", ""),
            "open_questions": analysis.get("open_questions", ""),
            "rag_chain": rag_chain,
        }

        return {
            "session_id": session_id,
            "title": sessions[session_id]["title"],
            "transcript": transcript,
            "summary": sessions[session_id]["summary"],
            "action_items": sessions[session_id]["action_items"],
            "key_decisions": sessions[session_id]["key_decisions"],
            "open_questions": sessions[session_id]["open_questions"],
        }
    finally:
        # Clean up temporary audio file to preserve disk space
        if audio_path and os.path.exists(audio_path):
            try:
                os.remove(audio_path)
            except OSError:
                pass


# --- API Routes ---

@app.get("/")
@app.get("/api/health")
def health_check():
    return {"status": "online", "message": "AI Video Assistant API is running"}


@app.post("/api/process-url", response_model=ProcessResponse)
def process_url(req: ProcessUrlRequest):
    """
    Process YouTube URL:
    - Fast fetches subtitles if available (takes ~1-2 seconds)
    - Or falls back to audio download + transcription
    - Summarizes with dynamic detail
    - Indexes in RAG for instant chat
    """
    try:
        result = run_analysis_pipeline(req.url, req.language)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/upload", response_model=ProcessResponse)
async def upload_file(
    file: UploadFile = File(...),
    language: str = Form(default="english")
):
    """
    Upload local audio/video file (MP3, MP4, WAV, M4A, etc.):
    - Saves file temporarily
    - Extracts & downsamples audio
    - Runs STT transcription + Gemini summarizer
    - Builds RAG chain and returns session_id
    """
    file_path = os.path.join(UPLOAD_DIR, f"{uuid.uuid4().hex}_{file.filename}")
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        result = run_analysis_pipeline(file_path, language)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except OSError:
                pass


@app.post("/api/chat", response_model=ChatResponse)
def chat_with_session(req: ChatRequest):
    """
    Ask any question about a processed video/meeting using its session_id.
    Uses RAG retrieval over the transcript + summary.
    """
    session = sessions.get(req.session_id)
    if not session:
        raise HTTPException(
            status_code=404,
            detail=f"Session '{req.session_id}' not found. Please process a video or file first."
        )

    rag_chain = session.get("rag_chain")
    if not rag_chain:
        raise HTTPException(status_code=500, detail="RAG chain not initialized for this session.")

    try:
        answer = ask_question(rag_chain, req.question)
        return {
            "session_id": req.session_id,
            "question": req.question,
            "answer": answer,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error querying RAG engine: {str(e)}")


@app.get("/api/session/{session_id}")
def get_session(session_id: str):
    """Retrieve already-processed session metadata (summary, action items, transcript, etc.)."""
    session = sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    return {
        "session_id": session_id,
        "title": session["title"],
        "transcript": session["transcript"],
        "summary": session["summary"],
        "action_items": session["action_items"],
        "key_decisions": session["key_decisions"],
        "open_questions": session["open_questions"],
    }
