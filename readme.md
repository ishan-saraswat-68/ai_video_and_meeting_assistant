<p align="center">
  <img src="https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python"/>
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI"/>
  <img src="https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React"/>
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/LangChain-1C3C3C?style=for-the-badge&logo=langchain&logoColor=white" alt="LangChain"/>
  <img src="https://img.shields.io/badge/Mistral_AI-FF7000?style=for-the-badge&logo=mistral&logoColor=white" alt="Mistral"/>
  <img src="https://img.shields.io/badge/Whisper-412991?style=for-the-badge&logo=openai&logoColor=white" alt="Whisper"/>
  <img src="https://img.shields.io/badge/ChromaDB-00897B?style=for-the-badge&logoColor=white" alt="ChromaDB"/>
</p>

<h1 align="center">🎬 AI Video & Meeting Assistant</h1>

<p align="center">
  <strong>An end-to-end, AI-powered application that transforms any YouTube video or uploaded audio/video recording into structured, actionable knowledge — with a conversational RAG interface to "chat" with your content.</strong>
</p>

<p align="center">
  Paste a YouTube link or drop a meeting recording → Get instant transcripts, AI summaries, action items, key decisions, open questions, and a ChatGPT-style Q&A interface powered by Retrieval-Augmented Generation (RAG).
</p>

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [High-Level System Architecture](#-high-level-system-architecture)
- [Complete Processing Pipeline](#-complete-processing-pipeline)
- [Backend Architecture Deep-Dive](#-backend-architecture-deep-dive)
  - [Audio Processor (`utils/audio_processor.py`)](#1-audio-processor)
  - [Transcriber (`core/transcriber.py`)](#2-transcriber)
  - [Summarizer (`core/summarizer.py`)](#3-summarizer)
  - [Extractor (`core/extractor.py`)](#4-extractor)
  - [Vector Store (`core/vector_store.py`)](#5-vector-store)
  - [RAG Engine (`core/rag_engine.py`)](#6-rag-engine)
  - [FastAPI Server (`app.py`)](#7-fastapi-server)
- [RAG Pipeline — In-Depth](#-rag-pipeline--in-depth)
- [How LLMs Are Used in This Project](#-how-llms-are-used-in-this-project)
- [LangChain LCEL Chains Explained](#-langchain-lcel-chains-explained)
- [Frontend Architecture Deep-Dive](#-frontend-architecture-deep-dive)
- [API Reference](#-api-reference)
- [Data Flow Diagrams](#-data-flow-diagrams)
- [Project Structure](#-project-structure)
- [Tech Stack](#-tech-stack)
- [Setup & Installation](#-setup--installation)
- [Environment Variables](#-environment-variables)
- [Running the Application](#-running-the-application)
- [Design Decisions & Trade-offs](#-design-decisions--trade-offs)
- [Future Improvements](#-future-improvements)
- [License](#-license)

---

## 🌟 Overview

The **AI Video & Meeting Assistant** is a full-stack application designed to solve a simple but powerful problem: **extracting structured intelligence from unstructured audio/video content**. Whether it's a recorded team meeting, a college lecture, a conference talk, or a YouTube video, this tool will:

1. **Transcribe** the audio using OpenAI Whisper (English) or Sarvam AI (Hinglish/Hindi)
2. **Summarize** the transcript using Mistral LLM with a Map-Reduce strategy
3. **Extract** action items, key decisions, and open questions using targeted LLM chains
4. **Build a knowledge base** by chunking & embedding the transcript into a ChromaDB vector store
5. **Enable conversational Q&A** through a full RAG pipeline (Retrieve → Augment → Generate)

The system has **two interfaces**:
- A **CLI** (`main.py`) for quick terminal-based usage
- A **modern React web app** connected to a **FastAPI REST API** (`app.py`)

---

## ✨ Key Features

| Feature | Description | Powered By |
|---------|-------------|------------|
| 🎥 **YouTube Download** | Download and extract audio from any YouTube URL | `yt-dlp` + `FFmpeg` |
| 📁 **File Upload** | Upload local MP4, MP3, WAV, M4A, MOV files | `pydub` + `FFmpeg` |
| 🎙️ **Speech-to-Text** | Accurate transcription with language routing | OpenAI Whisper (English) / Sarvam AI (Hinglish) |
| 📝 **AI Summary** | Professional Map-Reduce summarization | Mistral LLM via LangChain |
| ✅ **Action Items** | Auto-extract tasks with owners & deadlines | Mistral LLM |
| 🔑 **Key Decisions** | Extract decisions made during meetings | Mistral LLM |
| ❓ **Open Questions** | Find unresolved questions needing follow-up | Mistral LLM |
| 💬 **RAG Chat** | Ask natural language questions about the content | ChromaDB + HuggingFace Embeddings + Mistral |
| 🌐 **Multilingual** | Support for English and Hindi/Hinglish audio | Whisper + Sarvam AI STT-Translate |
| 🖥️ **Premium Web UI** | Dark-themed, animated, modern SaaS-style interface | React 19 + TailwindCSS + Framer Motion |

---

## 🏗️ High-Level System Architecture

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                              USER INTERFACE LAYER                               │
│                                                                                  │
│   ┌─────────────────────────────────┐   ┌──────────────────────────────────────┐ │
│   │       React 19 Web App          │   │          CLI (main.py)               │ │
│   │  (Vite + TypeScript + Tailwind) │   │     Terminal-based interface         │ │
│   │                                 │   │                                      │ │
│   │  • Landing Page                 │   │  • Interactive prompt input          │ │
│   │  • Dashboard (URL + Upload)     │   │  • Print results to stdout          │ │
│   │  • Results (Tabs: Overview,     │   │  • Chat loop in terminal            │ │
│   │    Summary, Transcript,         │   │                                      │ │
│   │    Insights, Ask AI)            │   │                                      │ │
│   │  • History / Saved / Settings   │   │                                      │ │
│   └──────────────┬──────────────────┘   └───────────────┬──────────────────────┘ │
│                  │ HTTP (Axios)                          │ Direct Python call     │
└──────────────────┼──────────────────────────────────────┼────────────────────────┘
                   │                                      │
┌──────────────────▼──────────────────────────────────────▼────────────────────────┐
│                              API / ORCHESTRATION LAYER                           │
│                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────┐   │
│   │                    FastAPI Server (app.py)                               │   │
│   │                                                                          │   │
│   │  POST /process/url      ← YouTube URL processing                        │   │
│   │  POST /process/upload   ← File upload processing                        │   │
│   │  POST /chat             ← RAG question answering                         │   │
│   │  DELETE /session/{id}   ← Session cleanup                                │   │
│   │  GET /                  ← Health check                                   │   │
│   │                                                                          │   │
│   │  In-Memory Session Store: { session_id → pipeline results + rag_chain }  │   │
│   └──────────────────────────────────┬───────────────────────────────────────┘   │
│                                      │                                           │
└──────────────────────────────────────┼───────────────────────────────────────────┘
                                       │
┌──────────────────────────────────────▼───────────────────────────────────────────┐
│                              CORE PROCESSING LAYER                               │
│                                                                                  │
│   ┌──────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────┐  │
│   │  Audio   │  │  Transcriber │  │  Summarizer  │  │      Extractor         │  │
│   │ Processor│→ │              │→ │              │→ │                        │  │
│   │          │  │ Whisper /    │  │ Map-Reduce   │  │ • Action Items         │  │
│   │ yt-dlp   │  │ Sarvam AI   │  │ via Mistral  │  │ • Key Decisions        │  │
│   │ pydub    │  │              │  │              │  │ • Open Questions       │  │
│   │ FFmpeg   │  │              │  │              │  │                        │  │
│   └──────────┘  └──────────────┘  └──────────────┘  └────────────────────────┘  │
│                                                                                  │
│   ┌────────────────────────────────────────────────────────────────────────────┐ │
│   │                         RAG SUBSYSTEM                                      │ │
│   │                                                                            │ │
│   │  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────────────────┐   │ │
│   │  │  Vector Store    │  │  RAG Engine      │  │  Mistral LLM            │   │ │
│   │  │  (ChromaDB)      │→ │  (LCEL Chain)    │→ │  (Answer Generation)    │   │ │
│   │  │                  │  │                  │  │                          │   │ │
│   │  │  HuggingFace     │  │  Retriever(k=4) │  │  Context-grounded        │   │ │
│   │  │  Embeddings      │  │  + Prompt +      │  │  Responses               │   │ │
│   │  │  (MiniLM-L6-v2)  │  │  LLM Pipeline   │  │                          │   │ │
│   │  └─────────────────┘  └─────────────────┘  └──────────────────────────┘   │ │
│   └────────────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Complete Processing Pipeline

The following diagram shows the **full end-to-end journey** of content from input to interactive Q&A:

```mermaid
flowchart TD
    A["🎬 User Input"] --> B{"Input Type?"}
    B -->|YouTube URL| C["yt-dlp: Download<br/>Best Audio Stream"]
    B -->|Local File<br/>MP4/MP3/WAV/M4A| D["pydub: Convert to<br/>16kHz Mono WAV"]
    
    C --> E["WAV Audio File"]
    D --> E
    
    E --> F["chunk_audio()<br/>Split into 10-min chunks"]
    F --> G["Audio Chunks<br/>[chunk_0.wav, chunk_1.wav, ...]"]
    
    G --> H{"Language?"}
    H -->|English| I["OpenAI Whisper<br/>(Local Model: 'small')"]
    H -->|Hinglish| J["Sarvam AI API<br/>(saaras:v2.5)<br/>Split to ≤25s pieces"]
    
    I --> K["Raw Transcript Text"]
    J --> K
    
    K --> L["generate_title()<br/>Mistral LLM"]
    K --> M["summarize()<br/>Map-Reduce Strategy"]
    K --> N["extract_action_items()<br/>Mistral LLM"]
    K --> O["extract_key_decisions()<br/>Mistral LLM"]
    K --> P["extract_questions()<br/>Mistral LLM"]
    K --> Q["build_rag_chain()<br/>Vector Store + LCEL"]
    
    L --> R["📌 Title"]
    M --> S["📋 Summary"]
    N --> T["✅ Action Items"]
    O --> U["🔑 Key Decisions"]
    P --> V["❓ Open Questions"]
    Q --> W["💬 RAG Chain Ready"]
    
    R --> X["Session Created<br/>(UUID)"]
    S --> X
    T --> X
    U --> X
    V --> X
    W --> X
    
    X --> Y["Results Rendered<br/>in Dashboard"]
    
    Y --> Z{"User asks<br/>a question?"}
    Z -->|Yes| AA["RAG Pipeline<br/>Retrieve → Augment → Generate"]
    AA --> AB["🤖 AI Answer<br/>Grounded in transcript"]
    AB --> Z
```

---

## 🔧 Backend Architecture Deep-Dive

### 1. Audio Processor

📁 **File:** `utils/audio_processor.py`

The audio processor is the **entry gate** of the pipeline. It normalizes any input — whether a YouTube URL or a local file — into a list of fixed-duration WAV audio chunks ready for transcription.

```mermaid
flowchart LR
    A["process_input(source)"] --> B{"Is URL?"}
    B -->|Yes| C["download_youtube_audio()"]
    B -->|No| D["convert_to_wav()"]
    C --> E["WAV file on disk"]
    D --> E
    E --> F["chunk_audio(wav, 10min)"]
    F --> G["[chunk_0.wav, chunk_1.wav, ...]"]
```

**Key Functions:**

| Function | Purpose | Details |
|----------|---------|---------|
| `download_youtube_audio(url)` | Downloads audio from YouTube | Uses `yt-dlp` with FFmpeg post-processing to extract the best audio stream and convert to WAV |
| `convert_to_wav(input_path)` | Converts any audio/video to WAV | Uses `pydub.AudioSegment`, converts to mono channel at 16kHz sampling rate (optimal for Whisper) |
| `chunk_audio(wav_path, chunk_minutes=10)` | Splits long audio into chunks | Breaks audio at 10-minute boundaries to stay within Whisper's comfort zone. Each chunk is saved as a separate WAV file |
| `process_input(source)` | Main entry point | Routes to YouTube download or local conversion, then chunks the result |

**Why 16kHz Mono?**
- Whisper is trained on 16kHz audio — providing higher sample rates wastes compute without improving accuracy
- Mono reduces file size by 50% compared to stereo, with no loss for speech recognition

**Why 10-minute chunks?**
- Whisper can handle up to ~30 minutes, but accuracy degrades on very long segments
- 10-minute chunks provide a good balance between accuracy and throughput
- Chunks are processed sequentially and concatenated

---

### 2. Transcriber

📁 **File:** `core/transcriber.py`

The transcriber is a **dual-engine speech-to-text system** that routes audio to different STT backends based on the language:

```mermaid
flowchart TD
    A["transcribe_all(chunks, language)"] --> B["For each chunk..."]
    B --> C{"language?"}
    
    C -->|"english"| D["transcribe_chunk_whisper()"]
    C -->|"hinglish"| E["transcribe_chunk_sarvam()"]
    
    D --> F["load_model()<br/>Whisper 'small' model<br/>(Singleton, Thread-Safe)"]
    F --> G["model.transcribe()<br/>fp16=False for CPU"]
    G --> H["English Text"]
    
    E --> I["AudioSegment.from_wav()"]
    I --> J["Split into ≤25s pieces"]
    J --> K["For each piece..."]
    K --> L["POST → Sarvam API<br/>speech-to-text-translate"]
    L --> M["English Text<br/>(Translated from Hindi)"]
    
    H --> N["Concatenate all chunks"]
    M --> N
    N --> O["Full Transcript"]
```

**Engine Details:**

| Engine | Language | Model | Type | Token Limit |
|--------|----------|-------|------|-------------|
| **OpenAI Whisper** | English | `small` (244M params) | Local (on-device) | ~30 min per segment |
| **Sarvam AI** | Hindi/Hinglish | `saaras:v2.5` | Cloud API | ≤30 seconds per request |

**Whisper Architecture (Brief):**
- Whisper is an encoder-decoder Transformer trained on 680K hours of multilingual audio
- The `small` model has 244M parameters — a good balance of speed vs. accuracy
- It uses log-mel spectrograms as input (80 channels, 25ms window, 10ms stride)
- The model is loaded as a **singleton** (`_model` global) and access is **thread-safe** via `threading.Lock`

**Sarvam AI Integration:**
- Sarvam's STT-Translate API simultaneously transcribes Hindi/Hinglish speech AND translates it to English
- The API has a strict 30-second audio limit, so each chunk is further split into 25-second pieces (5s safety margin)
- Pieces are uploaded as WAV via multipart form POST
- Results are joined with spaces to form the full chunk transcript

---

### 3. Summarizer

📁 **File:** `core/summarizer.py`

The summarizer uses a **Map-Reduce pattern** with LangChain LCEL to handle transcripts of any length:

```mermaid
flowchart TD
    A["summarize(transcript)"] --> B["split_transcript()<br/>RecursiveCharacterTextSplitter<br/>chunk_size=3000, overlap=200"]
    B --> C["Chunks: [c1, c2, c3, ..., cN]"]
    
    C --> D["MAP Phase"]
    D --> E["For each chunk cᵢ:"]
    E --> F["map_prompt:<br/>'Summarize this portion<br/>of a meeting transcript<br/>concisely.'"]
    F --> G["map_chain =<br/>map_prompt | Mistral LLM | StrOutputParser"]
    G --> H["Partial Summaries:<br/>[s1, s2, s3, ..., sN]"]
    
    H --> I["Join with \\n\\n"]
    I --> J["REDUCE Phase"]
    J --> K["combined_prompt:<br/>'Combine these partial<br/>summaries into one final<br/>professional summary<br/>with bullet points.'"]
    K --> L["combined_chain =<br/>RunnablePassthrough | Lambda | combined_prompt | LLM | StrOutputParser"]
    L --> M["📋 Final Summary"]
    
    style D fill:#6C63FF,color:#fff
    style J fill:#00D4FF,color:#000
```

**Why Map-Reduce?**
- LLMs have context window limits (Mistral Small: ~32K tokens)
- A 1-hour meeting transcript can be 15,000+ words (well beyond the context window)
- Map-Reduce solves this by summarizing in two passes:
  1. **Map:** Independently summarize each 3000-character chunk
  2. **Reduce:** Combine all partial summaries into one cohesive summary
- The combined summaries are much shorter than the raw transcript, fitting easily into a single LLM call

**Title Generation (`generate_title`):**
- Takes only the first 2000 characters of the transcript
- Uses a system prompt: *"Generate a short professional meeting title (max 8 words)"*
- Returns only the title string

---

### 4. Extractor

📁 **File:** `core/extractor.py`

The extractor uses **three specialized LLM chains**, each with a targeted system prompt, to extract structured information:

```mermaid
flowchart LR
    A["Transcript"] --> B["extract_action_items()"]
    A --> C["extract_key_decisions()"]
    A --> D["extract_questions()"]
    
    B --> E["System Prompt:<br/>'Extract all action items.<br/>For each: Task, Owner, Deadline.<br/>Format as numbered list.'"]
    C --> F["System Prompt:<br/>'Extract all key decisions.<br/>Format as numbered list.'"]
    D --> G["System Prompt:<br/>'Extract all unresolved questions<br/>or topics needing follow-up.<br/>Format as numbered list.'"]
    
    E --> H["build_chain(prompt)<br/>= Passthrough | Lambda<br/>| ChatPromptTemplate<br/>| Mistral LLM<br/>| StrOutputParser"]
    F --> H
    G --> H
    
    H --> I["Structured Output"]
```

**Chain Construction (`build_chain`):**
All three extractors share the same chain architecture via the `build_chain()` helper:

```python
RunnablePassthrough()           # Pass transcript as-is
| RunnableLambda(lambda x: {"text": x})  # Wrap in dict for prompt template
| ChatPromptTemplate.from_messages([...])  # Format with system + human messages
| ChatMistralAI(model="mistral-small-latest", temperature=0.2)  # Generate
| StrOutputParser()             # Extract string from AIMessage
```

**Note:** The file also contains a **commented-out upgraded version** that uses Map-Reduce chunking (similar to the summarizer) for handling very long meetings. The current active version sends the full transcript in one shot, which works well for meetings under ~45 minutes.

---

### 5. Vector Store

📁 **File:** `core/vector_store.py`

The vector store is the **foundation of the RAG system** — it converts the transcript into searchable semantic vectors:

```mermaid
flowchart TD
    A["build_vector_store(transcript, summary)"] --> B["RecursiveCharacterTextSplitter<br/>chunk_size=500, overlap=50"]
    B --> C["Text Chunks<br/>[chunk_0, chunk_1, ..., chunk_N]"]
    
    C --> D["Create Documents<br/>with Metadata"]
    D --> E["Document(page_content=chunk,<br/>metadata={chunk_index, source:'transcript'})"]
    
    F{"Summary<br/>provided?"} -->|Yes| G["Append summary as<br/>additional Document<br/>source='summary'"]
    F -->|No| H["Skip"]
    
    E --> I["HuggingFaceEmbeddings<br/>model: all-MiniLM-L6-v2<br/>(384-dimensional vectors)"]
    G --> I
    
    I --> J["Chroma.from_documents()<br/>Collection: meeting_{uuid}"]
    J --> K["ChromaDB Vector Store<br/>(In-Memory)"]
    
    K --> L["get_retriever(k=4)<br/>search_type='similarity'"]
    L --> M["Retriever Object<br/>(Returns top-4 most<br/>similar chunks)"]
```

**Embedding Model Details:**

| Property | Value |
|----------|-------|
| Model | `all-MiniLM-L6-v2` (from Sentence-Transformers) |
| Dimensions | 384 |
| Parameters | 22.7M |
| Speed | ~14K sentences/second on CPU |
| Max Sequence Length | 256 word pieces |
| Training Data | 1B+ sentence pairs |

**Why 500-character chunks with 50-character overlap?**
- 500 characters ≈ 70-80 words ≈ a single coherent thought/paragraph
- Smaller chunks allow the retriever to find more precise, relevant passages
- The 50-character overlap prevents information loss at chunk boundaries
- This is smaller than the summarizer's 3000-character chunks because **retrieval precision** is more important than **comprehension breadth**

**Why is the summary also embedded?**
- The summary provides a high-level semantic representation of the entire meeting
- When a user asks a broad question like *"What was this meeting about?"*, the summary chunk will rank highest
- This gives the RAG system both micro (transcript chunks) and macro (summary) context

---

### 6. RAG Engine

📁 **File:** `core/rag_engine.py`

The RAG engine is the **core intelligence layer** that powers the "Ask AI" chat feature. It constructs a full **Retrieve → Augment → Generate** chain using LangChain Expression Language (LCEL):

```mermaid
flowchart TD
    A["User Question:<br/>'What deadlines were<br/>discussed?'"] --> B["RunnablePassthrough()<br/>(passes question through)"]
    
    B --> C["Parallel Execution"]
    
    C --> D["RETRIEVE:<br/>Retriever (k=4)<br/>Similarity search in<br/>ChromaDB"]
    C --> E["PASS-THROUGH:<br/>Question string"]
    
    D --> F["Top 4 relevant<br/>document chunks"]
    F --> G["format_docs()<br/>Join with \\n\\n"]
    G --> H["context string"]
    
    H --> I["AUGMENT:<br/>ChatPromptTemplate"]
    E --> I
    
    I --> J["System: 'You are an expert<br/>meeting assistant. Answer<br/>based ONLY on the context.'<br/><br/>Context: {retrieved chunks}<br/><br/>Human: {user question}"]
    
    J --> K["GENERATE:<br/>Mistral LLM<br/>(temperature=0.3)"]
    
    K --> L["StrOutputParser()"]
    L --> M["🤖 AI Answer"]
    
    style D fill:#22C55E,color:#fff
    style I fill:#6C63FF,color:#fff
    style K fill:#FF7000,color:#fff
```

**The LCEL RAG Chain in Code:**

```python
rag_chain = (
    {
        "context": retriever | RunnableLambda(format_docs),   # Retrieve + Format
        "question": RunnablePassthrough()                      # Pass question as-is
    }
    | prompt     # Augment: inject context + question into template
    | llm        # Generate: Mistral produces the answer
    | StrOutputParser()  # Parse AIMessage → string
)
```

**How LCEL Works Here:**
1. The `dict` at the start creates a **parallel branch**: `context` and `question` are computed simultaneously
2. `retriever | format_docs` → the user's question is used as the search query; ChromaDB returns the top-4 most semantically similar chunks; these are joined into a single string
3. `RunnablePassthrough()` → the user's question passes through unchanged
4. Both `context` and `question` are injected into the `ChatPromptTemplate`
5. The formatted prompt goes to `Mistral` which generates a contextually-grounded answer
6. `StrOutputParser` extracts the text from the LLM's `AIMessage` object

**System Prompt Design:**
The RAG system prompt enforces **factual grounding**:
> *"Answer the user's question based ONLY on the meeting transcript context provided below. If the answer is not found in the context, say: 'I could not find this information in the meeting transcript.'"*

This prevents the LLM from hallucinating information that wasn't in the original recording.

---

### 7. FastAPI Server

📁 **File:** `app.py`

The FastAPI server exposes the entire pipeline as a REST API with session management:

```mermaid
flowchart TD
    A["Client Request"] --> B{"Endpoint?"}
    
    B -->|"POST /process/url"| C["ProcessURLRequest<br/>{source, language}"]
    B -->|"POST /process/upload"| D["UploadFile + language Form"]
    B -->|"POST /chat"| E["ChatRequest<br/>{session_id, question}"]
    B -->|"DELETE /session/{id}"| F["Delete session"]
    B -->|"GET /"| G["Health check"]
    
    C --> H["run_pipeline(source, language)"]
    D --> I["Save file to uploads/"]
    I --> H
    
    H --> J["process_input → transcribe_all<br/>→ generate_title → summarize<br/>→ extract_* → build_rag_chain"]
    
    J --> K["_store_session(result)"]
    K --> L["SESSIONS dict<br/>{uuid: {title, transcript,<br/>summary, action_items,<br/>key_decisions, open_questions,<br/>rag_chain}}"]
    
    L --> M["ProcessResponse<br/>{session_id, title, transcript,<br/>summary, action_items,<br/>key_decisions, open_questions}"]
    
    E --> N["SESSIONS.get(session_id)"]
    N --> O["ask_question(rag_chain, question)"]
    O --> P["ChatResponse<br/>{session_id, question, answer}"]
```

**Session Management:**
- Sessions are stored **in-memory** in a Python `dict` keyed by UUID
- Each session stores the complete pipeline results including the live `rag_chain` object
- Sessions persist for the lifetime of the server process
- The `DELETE /session/{id}` endpoint enables cleanup

**CORS Configuration:**
- All origins are allowed (`*`) for development
- Should be restricted in production deployments

---

## 🔬 RAG Pipeline — In-Depth

RAG (Retrieval-Augmented Generation) is the architecture pattern that enables the "Chat with your meeting" feature. Here is the complete data flow with exact dimensions and parameters:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          INDEXING PHASE (Build Time)                    │
│                                                                         │
│  Transcript (string, ~5K-50K characters)                                │
│       │                                                                 │
│       ▼                                                                 │
│  RecursiveCharacterTextSplitter(chunk_size=500, overlap=50)             │
│       │                                                                 │
│       ▼                                                                 │
│  Text Chunks: ["chunk_0", "chunk_1", ..., "chunk_N"]                   │
│  + Summary Document (if provided)                                       │
│       │                                                                 │
│       ▼                                                                 │
│  HuggingFaceEmbeddings(model="all-MiniLM-L6-v2")                       │
│       │                                                                 │
│       ▼                                                                 │
│  384-dimensional float vectors: [[0.023, -0.156, ...], ...]             │
│       │                                                                 │
│       ▼                                                                 │
│  ChromaDB (in-memory, collection="meeting_{uuid}")                      │
│  Stores: { document_text, embedding_vector, metadata }                  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

                              ▼ (one-time, at process time)

┌─────────────────────────────────────────────────────────────────────────┐
│                         QUERY PHASE (Chat Time)                         │
│                                                                         │
│  User Question: "What budget was approved?"                             │
│       │                                                                 │
│       ▼                                                                 │
│  ① RETRIEVE                                                             │
│  Embed the question → 384-dim vector                                    │
│  Cosine similarity search in ChromaDB                                   │
│  Return top-k=4 most relevant document chunks                           │
│       │                                                                 │
│       ▼                                                                 │
│  ② AUGMENT                                                              │
│  Inject retrieved chunks into the prompt template:                      │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ System: "You are an expert meeting assistant. Answer based      │    │
│  │ ONLY on the context. If not found, say so."                     │    │
│  │                                                                 │    │
│  │ Context: {chunk_1}\n\n{chunk_2}\n\n{chunk_3}\n\n{chunk_4}      │    │
│  │                                                                 │    │
│  │ Human: "What budget was approved?"                              │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│       │                                                                 │
│       ▼                                                                 │
│  ③ GENERATE                                                             │
│  Mistral Small LLM (temperature=0.3)                                    │
│  Generates answer grounded in the provided context                      │
│       │                                                                 │
│       ▼                                                                 │
│  Answer: "The team approved a $50K budget for Q3 marketing              │
│  campaigns, as mentioned by the finance lead."                          │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Similarity Search — How it Works:**

1. The user's question is converted to a 384-dimensional vector using the same `all-MiniLM-L6-v2` model
2. ChromaDB computes the **cosine similarity** between the question vector and every stored chunk vector
3. The 4 chunks with the highest similarity scores are returned
4. These chunks form the "context" that the LLM uses to answer the question

**Why k=4?**
- 4 chunks × 500 chars ≈ 2000 characters of context
- This fits well within Mistral's context window while providing enough relevant information
- Too few chunks (k=1-2) might miss important context; too many (k=8+) could dilute relevance with noise

---

## 🧠 How LLMs Are Used in This Project

This project uses **Mistral AI's `mistral-small-latest` model** for all LLM tasks. Here is a comprehensive map of every LLM call:

```mermaid
flowchart TD
    subgraph LLM["Mistral Small (mistral-small-latest)"]
        direction TB
        L1["Temperature: 0.3<br/>API: Mistral Cloud"]
    end
    
    subgraph Tasks["LLM Tasks in Pipeline"]
        direction TB
        T1["🏷️ Title Generation<br/>temp=0.3 | input: first 2000 chars"]
        T2["📋 Map Summarization<br/>temp=0.3 | input: 3000-char chunks"]
        T3["📋 Reduce Summarization<br/>temp=0.3 | input: combined partials"]
        T4["✅ Action Item Extraction<br/>temp=0.2 | input: full transcript"]
        T5["🔑 Decision Extraction<br/>temp=0.2 | input: full transcript"]
        T6["❓ Question Extraction<br/>temp=0.2 | input: full transcript"]
        T7["💬 RAG Answer Generation<br/>temp=0.3 | input: context + question"]
    end
    
    T1 --> LLM
    T2 --> LLM
    T3 --> LLM
    T4 --> LLM
    T5 --> LLM
    T6 --> LLM
    T7 --> LLM
```

| # | Task | Temperature | Input | System Prompt Strategy |
|---|------|-------------|-------|----------------------|
| 1 | **Title Generation** | 0.3 | First 2000 chars of transcript | "Generate a short professional meeting title (max 8 words)" |
| 2 | **Map Summary** | 0.3 | Each 3000-char chunk | "Summarize this portion of a meeting transcript concisely" |
| 3 | **Reduce Summary** | 0.3 | Joined partial summaries | "Combine partial summaries into one final professional summary with bullet points" |
| 4 | **Action Items** | 0.2 | Full transcript | "Extract all action items with Task, Owner, Deadline" |
| 5 | **Key Decisions** | 0.2 | Full transcript | "Extract all key decisions made. Format as numbered list" |
| 6 | **Open Questions** | 0.2 | Full transcript | "Extract all unresolved questions or topics needing follow-up" |
| 7 | **RAG Answers** | 0.3 | Retrieved context + question | "Answer based ONLY on the meeting transcript context. If not found, say so" |

**Why Mistral Small?**
- Fast inference speeds (important for real-time web app)
- Strong instruction following for structured extraction
- Cost-effective for high-volume processing
- 32K token context window — sufficient for most meeting-length content

**Temperature Settings Explained:**
- **0.2** (Extractors): Lower temperature = more deterministic, factual output. Critical for extracting exact items/decisions
- **0.3** (Summary/RAG): Slightly higher for more natural, fluent language while remaining factual

---

## ⛓️ LangChain LCEL Chains Explained

The project uses **LangChain Expression Language (LCEL)** for composing all LLM chains. LCEL provides a declarative pipe (`|`) syntax for building processing pipelines:

### Chain Pattern Used Throughout

```python
# The base chain pattern (used by extractor, summarizer, rag_engine)
chain = (
    RunnablePassthrough()                    # Step 1: Accept input as-is
    | RunnableLambda(lambda x: {"text": x})  # Step 2: Wrap in dict for template
    | ChatPromptTemplate.from_messages([...])  # Step 3: Format the prompt
    | ChatMistralAI(...)                      # Step 4: Call the LLM
    | StrOutputParser()                       # Step 5: Extract text from response
)
```

### Execution Flow:

```
Input String
     │
     ▼
RunnablePassthrough()     →  "The meeting discussed..."
     │
     ▼
RunnableLambda()          →  {"text": "The meeting discussed..."}
     │
     ▼
ChatPromptTemplate()      →  [SystemMessage("Summarize..."), 
                               HumanMessage("The meeting discussed...")]
     │
     ▼
ChatMistralAI()           →  AIMessage("Here is a summary: ...")
     │
     ▼
StrOutputParser()         →  "Here is a summary: ..."
```

### RAG Chain (More Complex):

```python
rag_chain = (
    {
        "context": retriever | RunnableLambda(format_docs),  # Branch A
        "question": RunnablePassthrough()                     # Branch B
    }
    | prompt | llm | StrOutputParser()
)
```

```
Input: "What deadlines were discussed?"
           │
     ┌─────┴─────┐
     ▼           ▼
  Branch A    Branch B
     │           │
  retriever   passthrough
     │           │
  [Doc1,Doc2]   "What deadlines..."
     │           │
  format_docs    │
     │           │
  "chunk1\n\n   │
   chunk2"       │
     │           │
     └─────┬─────┘
           ▼
    {"context": "chunk1\n\nchunk2",
     "question": "What deadlines..."}
           │
           ▼
      ChatPromptTemplate
           │
           ▼
      Mistral LLM
           │
           ▼
     "The project deadline
      is March 15th..."
```

---

## 🎨 Frontend Architecture Deep-Dive

### Tech Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 19 | UI library |
| Vite | 8.x | Build tool & dev server |
| TypeScript | 6.x | Type safety |
| TailwindCSS | 3.4 | Utility-first CSS |
| Framer Motion | 12.x | Animations |
| React Router | 7.x | Client-side routing |
| TanStack Query | 5.x | Server state management |
| Axios | 1.x | HTTP client |
| Sonner | 2.x | Toast notifications |
| Lucide React | 1.x | Icon library |
| React Dropzone | 17.x | Drag & drop file upload |
| React Markdown | 10.x | Markdown rendering |

### Application Architecture

```mermaid
flowchart TD
    subgraph Entry["Entry Point"]
        A["main.tsx<br/>React.StrictMode<br/>QueryClientProvider<br/>Toaster (Sonner)"]
    end
    
    subgraph Router["React Router"]
        B["App.tsx<br/>BrowserRouter"]
        B --> C["/ → Landing"]
        B --> D["Layout Wrapper"]
        D --> E["/dashboard → Dashboard"]
        D --> F["/history → History"]
        D --> G["/saved → Saved"]
        D --> H["/settings → Settings"]
        B --> I["/* → NotFound (404)"]
    end
    
    subgraph Layout["Layout Components"]
        J["Layout.tsx<br/>(Sidebar + TopNav + Outlet)"]
        K["Sidebar.tsx<br/>(280px fixed, NavLinks)"]
        L["TopNav.tsx<br/>(Status indicator)"]
    end
    
    subgraph Dashboard["Dashboard Components"]
        M["UploadCard.tsx<br/>(React Dropzone)"]
        N["ProgressPipeline.tsx<br/>(6-step animated pipeline)"]
        O["ChatWindow.tsx<br/>(ChatGPT-style interface)"]
    end
    
    subgraph Data["Data Layer"]
        P["services/api.ts<br/>(Axios HTTP client)"]
        Q["hooks/useApi.ts<br/>(TanStack Query mutations)"]
    end
    
    A --> B
    D --> J
    J --> K
    J --> L
    E --> M
    E --> N
    E --> O
    O --> Q
    M --> Q
    Q --> P
    P --> R["FastAPI Backend<br/>localhost:8000"]
```

### Page Descriptions

| Page | Route | Description |
|------|-------|-------------|
| **Landing** | `/` | Hero section with gradient text, feature cards, and CTA button. Modern SaaS-style landing page. |
| **Dashboard** | `/dashboard` | Main workspace. URL input with glow effect, drag-and-drop upload, language selector. Shows processing pipeline animation, then results in tabbed view (Overview, Summary, Transcript, Insights, Ask AI). |
| **History** | `/history` | Lists previously processed videos with search and filter (empty state placeholder). |
| **Saved** | `/saved` | Bookmarked/pinned summaries in grid layout (empty state placeholder). |
| **Settings** | `/settings` | Backend URL config, API health status, theme info. |
| **404** | `/*` | Gradient 404 text with return-to-dashboard button. |

### Dashboard State Machine

```mermaid
stateDiagram-v2
    [*] --> InputMode: Page Load
    
    InputMode --> Processing: User submits URL or uploads file
    Processing --> ResultsMode: Pipeline completes
    Processing --> InputMode: Error occurs
    
    state ResultsMode {
        [*] --> Overview
        Overview --> Summary: Click tab
        Overview --> Transcript: Click tab
        Overview --> Insights: Click tab
        Overview --> AskAI: Click tab
        Summary --> Overview: Click tab
        Transcript --> Overview: Click tab
        Insights --> Overview: Click tab
        AskAI --> Overview: Click tab
        
        state AskAI {
            [*] --> Idle
            Idle --> Sending: User sends question
            Sending --> Receiving: API call in progress
            Receiving --> Idle: Answer received
        }
    }
```

### Design System

| Token | Value | Usage |
|-------|-------|-------|
| Background | `#09090B` | Page background |
| Card | `#111214` | Card surfaces |
| Sidebar | `#0F1012` | Sidebar background |
| Border | `#23262D` | All borders |
| Primary | `#6C63FF` | Buttons, accents, active states |
| Secondary | `#00D4FF` | Gradient endpoint, secondary accents |
| Success | `#22C55E` | Success states, decisions |
| Warning | `#F59E0B` | Warning states, questions |
| Danger | `#EF4444` | Error states |
| Heading Font | `Space Grotesk` | All headings |
| Body Font | `Inter` | Body text |
| Mono Font | `JetBrains Mono` | Code, timestamps, technical text |

---

## 📡 API Reference

### Base URL
```
http://localhost:8000
```

### Endpoints

#### `GET /` — Health Check
```json
// Response 200
{
  "status": "ok",
  "service": "AI Video Assistant API"
}
```

---

#### `POST /process/url` — Process YouTube URL

**Request Body:**
```json
{
  "source": "https://www.youtube.com/watch?v=example",
  "language": "english"   // "english" | "hinglish"
}
```

**Response 200:**
```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Q3 Marketing Strategy Review",
  "transcript": "Full transcript text...",
  "summary": "## Meeting Summary\n- Point 1\n- Point 2...",
  "action_items": "1. Task A - Owner: John - Deadline: March 15\n2. ...",
  "key_decisions": "1. Approved $50K budget for...\n2. ...",
  "open_questions": "1. Should we expand to EU markets?\n2. ..."
}
```

---

#### `POST /process/upload` — Process Uploaded File

**Request:** `multipart/form-data`

| Field | Type | Description |
|-------|------|-------------|
| `file` | File | Audio/video file (MP4, MP3, WAV, M4A, MOV) |
| `language` | string | `"english"` or `"hinglish"` (default: `"english"`) |

**Response 200:** Same structure as `/process/url`

---

#### `POST /chat` — Chat with Processed Content (RAG)

**Request Body:**
```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "question": "What deadlines were discussed?"
}
```

**Response 200:**
```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "question": "What deadlines were discussed?",
  "answer": "Based on the meeting transcript, the following deadlines were discussed: ..."
}
```

**Response 404:**
```json
{
  "detail": "Session not found. Process a video first."
}
```

---

#### `DELETE /session/{session_id}` — Delete Session

**Response 200:**
```json
{
  "status": "deleted",
  "session_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

---

## 📊 Data Flow Diagrams

### Complete Request Lifecycle (URL Processing)

```mermaid
sequenceDiagram
    participant U as User (Browser)
    participant F as React Frontend
    participant A as FastAPI Server
    participant YT as YouTube (yt-dlp)
    participant W as Whisper Model
    participant M as Mistral AI API
    participant C as ChromaDB
    participant HF as HuggingFace<br/>Embeddings

    U->>F: Pastes YouTube URL + clicks Generate
    F->>F: Show ProgressPipeline animation
    F->>A: POST /process/url {source, language}
    
    A->>YT: yt-dlp download(url)
    YT-->>A: audio.wav
    A->>A: chunk_audio(10 min chunks)
    
    loop For each chunk
        A->>W: model.transcribe(chunk)
        W-->>A: chunk_text
    end
    A->>A: Concatenate → full transcript
    
    par Generate Title
        A->>M: "Generate title" + transcript[:2000]
        M-->>A: title
    and Map-Reduce Summarize
        loop For each 3000-char chunk
            A->>M: "Summarize this portion"
            M-->>A: partial_summary
        end
        A->>M: "Combine into final summary"
        M-->>A: final_summary
    and Extract Insights
        A->>M: "Extract action items" + transcript
        M-->>A: action_items
        A->>M: "Extract key decisions" + transcript
        M-->>A: key_decisions
        A->>M: "Extract open questions" + transcript
        M-->>A: open_questions
    and Build RAG
        A->>A: Split transcript (500 chars)
        A->>HF: Embed chunks
        HF-->>A: 384-dim vectors
        A->>C: Store vectors + documents
        C-->>A: vector_store ready
        A->>A: Build LCEL rag_chain
    end
    
    A->>A: Store in SESSIONS[uuid]
    A-->>F: ProcessResponse {session_id, title, ...}
    F->>F: Hide pipeline, show Results tabs
    F-->>U: Display Overview tab

    U->>F: Clicks "Ask AI" tab, types question
    F->>A: POST /chat {session_id, question}
    A->>C: Similarity search (k=4)
    C-->>A: Top 4 relevant chunks
    A->>M: Context + Question prompt
    M-->>A: AI-generated answer
    A-->>F: ChatResponse {answer}
    F-->>U: Display answer in chat bubble
```

---

## 📁 Project Structure

```
ai-video-assistant/
│
├── 📄 app.py                    # FastAPI REST API server (production entry point)
├── 📄 main.py                   # CLI entry point (terminal-based usage)
├── 📄 test.py                   # Quick test script for pipeline validation
├── 📄 requirements.txt          # Python dependencies
├── 📄 .env                      # API keys (MISTRAL, SARVAM, WHISPER config)
├── 📄 .gitignore                # Git ignore rules
├── 📄 report.md                 # Frontend build specification document
├── 📄 readme.md                 # ← You are here
│
├── 📂 core/                     # Core AI processing modules
│   ├── 📄 transcriber.py        # Dual-engine STT (Whisper + Sarvam AI)
│   ├── 📄 summarizer.py         # Map-Reduce summarization via Mistral
│   ├── 📄 extractor.py          # Action items, decisions, questions extraction
│   ├── 📄 vector_store.py       # ChromaDB vector store + HuggingFace embeddings
│   └── 📄 rag_engine.py         # RAG chain construction + question answering
│
├── 📂 utils/                    # Utility modules
│   └── 📄 audio_processor.py    # YouTube download, WAV conversion, audio chunking
│
├── 📂 uploads/                  # Temporary storage for uploaded files
├── 📂 downloades/               # yt-dlp download directory
│
└── 📂 frontend/                 # React 19 web application
    ├── 📄 package.json          # Node.js dependencies
    ├── 📄 vite.config.ts        # Vite build configuration
    ├── 📄 tailwind.config.js    # TailwindCSS theme configuration
    ├── 📄 tsconfig.json         # TypeScript configuration
    ├── 📄 index.html            # HTML entry point
    │
    └── 📂 src/
        ├── 📄 main.tsx          # React entry point (QueryClient, Toaster)
        ├── 📄 App.tsx           # Router configuration
        ├── 📄 index.css         # Global styles (fonts, base layer)
        ├── 📄 App.css           # Legacy CSS (from Vite scaffold)
        │
        ├── 📂 pages/
        │   ├── 📄 Landing.tsx   # Hero + features landing page
        │   ├── 📄 Dashboard.tsx # Main workspace (URL input, upload, results tabs, chat)
        │   ├── 📄 History.tsx   # Processing history (placeholder)
        │   ├── 📄 Saved.tsx     # Saved summaries (placeholder)
        │   ├── 📄 Settings.tsx  # API config & theme settings
        │   └── 📄 NotFound.tsx  # 404 page
        │
        ├── 📂 components/
        │   ├── 📂 layout/
        │   │   ├── 📄 Layout.tsx    # Sidebar + TopNav + Outlet wrapper
        │   │   ├── 📄 Sidebar.tsx   # Fixed 280px sidebar with navigation
        │   │   └── 📄 TopNav.tsx    # Top bar with system status
        │   ├── 📂 dashboard/
        │   │   ├── 📄 UploadCard.tsx       # Drag-and-drop file upload zone
        │   │   └── 📄 ProgressPipeline.tsx # 6-step animated processing pipeline
        │   └── 📂 chat/
        │       └── 📄 ChatWindow.tsx       # ChatGPT-style Q&A interface
        │
        ├── 📂 services/
        │   └── 📄 api.ts       # Axios HTTP client + typed API functions
        │
        ├── 📂 hooks/
        │   └── 📄 useApi.ts    # TanStack Query mutation hooks
        │
        ├── 📂 lib/
        │   └── 📄 utils.ts    # cn() utility (clsx + tailwind-merge)
        │
        ├── 📂 styles/          # (empty, reserved for additional styles)
        ├── 📂 contexts/        # (empty, reserved for React contexts)
        ├── 📂 types/           # (empty, reserved for shared TypeScript types)
        ├── 📂 utils/           # (empty, reserved for frontend utilities)
        └── 📂 assets/          # Static assets
```

---

## 🛠️ Tech Stack

### Backend

| Technology | Version | Role |
|-----------|---------|------|
| **Python** | ≥ 3.10 | Core language |
| **FastAPI** | Latest | REST API framework |
| **Uvicorn** | Latest | ASGI server |
| **OpenAI Whisper** | ≥ 20231117 | Local speech-to-text |
| **PyTorch** | ≥ 2.2 | Deep learning backend for Whisper |
| **yt-dlp** | ≥ 2024.4 | YouTube audio download |
| **pydub** | ≥ 0.25 | Audio format conversion & chunking |
| **FFmpeg** | System install | Audio/video codec processing |
| **LangChain** | ≥ 0.2 | LLM orchestration framework |
| **LangChain-MistralAI** | ≥ 0.1 | Mistral LLM integration |
| **Mistral AI** (API) | mistral-small-latest | LLM for summarization, extraction, RAG |
| **ChromaDB** | ≥ 0.5 | In-memory vector database |
| **Sentence-Transformers** | ≥ 3.0 | Text embeddings |
| **HuggingFace Hub** | ≥ 0.23 | Model download |
| **Sarvam AI** (API) | saaras:v2.5 | Hindi/Hinglish STT + translation |
| **python-dotenv** | ≥ 1.0 | Environment variable loading |

### Frontend

| Technology | Version | Role |
|-----------|---------|------|
| **React** | 19 | UI library |
| **Vite** | 8.x | Build toolchain |
| **TypeScript** | ~6.0 | Type safety |
| **TailwindCSS** | 3.4 | Utility-first styling |
| **Framer Motion** | 12.x | Animations & transitions |
| **React Router** | 7.x | Client-side routing |
| **TanStack Query** | 5.x | Async state management |
| **Axios** | 1.x | HTTP client |
| **React Dropzone** | 17.x | File upload UI |
| **React Markdown** | 10.x | Markdown rendering |
| **Sonner** | 2.x | Toast notifications |
| **Lucide React** | 1.x | Icon system |
| **clsx + tailwind-merge** | Latest | Conditional className utility |

---

## ⚙️ Setup & Installation

### Prerequisites

- **Python** ≥ 3.10
- **Node.js** ≥ 18
- **FFmpeg** installed on your system
- **Mistral AI API key** (free tier available at [console.mistral.ai](https://console.mistral.ai))
- **Sarvam AI API key** (optional, only for Hinglish support — [sarvam.ai](https://www.sarvam.ai))

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/ai-video-assistant.git
cd ai-video-assistant
```

### 2. Install FFmpeg

```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt update && sudo apt install ffmpeg

# Windows (via Chocolatey)
choco install ffmpeg
```

### 3. Set Up Python Backend

```bash
# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # macOS/Linux
# .venv\Scripts\activate   # Windows

# Install dependencies
pip install -r requirements.txt
```

### 4. Configure Environment Variables

Create a `.env` file in the project root:

```env
MISTRAL_API_KEY=your_mistral_api_key_here
WHISPER_MODEL=small
SARVAM_API_KEY=your_sarvam_api_key_here      # Optional
SARVAM_STT_MODEL=saaras:v2.5                  # Optional
```

### 5. Set Up Frontend

```bash
cd frontend
npm install
```

---

## 🏃 Running the Application

### Option A: Full Stack (Backend + Frontend)

**Terminal 1 — Start Backend:**
```bash
# From project root
source .venv/bin/activate
python app.py
# Server starts at http://localhost:8000
```

**Terminal 2 — Start Frontend:**
```bash
cd frontend
npm run dev
# Dev server starts at http://localhost:5173
```

Open `http://localhost:5173` in your browser.

### Option B: CLI Mode (No Frontend)

```bash
source .venv/bin/activate
python main.py
# Follow the interactive prompts
```

### Option C: Quick Test

```bash
source .venv/bin/activate
python test.py
# Tests the pipeline with a hardcoded YouTube URL
```

---

## 🔐 Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `MISTRAL_API_KEY` | ✅ Yes | — | API key for Mistral AI LLM |
| `WHISPER_MODEL` | No | `small` | Whisper model size (`tiny`, `base`, `small`, `medium`, `large`) |
| `SARVAM_API_KEY` | No | — | API key for Sarvam AI (Hindi/Hinglish support) |
| `SARVAM_STT_MODEL` | No | `saaras:v2.5` | Sarvam STT model identifier |

---

## 🤔 Design Decisions & Trade-offs

| Decision | Rationale | Trade-off |
|----------|-----------|-----------|
| **In-memory sessions** | Simple, fast, no DB setup needed | Sessions lost on server restart. Not suitable for multi-worker deployments |
| **Whisper `small` model** | Good accuracy/speed balance on CPU | Larger models (medium, large) are more accurate but much slower without GPU |
| **ChromaDB in-memory** | No disk persistence needed for single-session use | Vector store is recreated each time; could persist to disk for reuse |
| **500-char RAG chunks** | High retrieval precision for Q&A | Might split a single thought across chunks (mitigated by 50-char overlap) |
| **Full transcript to extractors** | Simpler code, works for most meeting lengths | May fail on very long meetings (>32K tokens). Commented-out Map-Reduce version solves this |
| **Mistral Small for all tasks** | Cost-effective, fast, good enough quality | Larger models (Mistral Large, GPT-4) would produce better summaries for complex content |
| **No authentication** | Development/demo simplicity | Must add auth before any production deployment |
| **CORS allow all origins** | Easy frontend-backend development | Must restrict origins in production |

---

## 🚀 Future Improvements

- [ ] **Persistent storage** — Replace in-memory sessions with PostgreSQL or Redis
- [ ] **User authentication** — Add OAuth2 / JWT-based auth
- [ ] **Streaming responses** — Use SSE or WebSockets for real-time LLM streaming in chat
- [ ] **Speaker diarization** — Identify and label different speakers in the transcript
- [ ] **Multi-language support** — Extend beyond English and Hinglish
- [ ] **PDF/DOCX export** — Download summaries and transcripts as formatted documents
- [ ] **Batch processing** — Process multiple videos in parallel
- [ ] **GPU acceleration** — CUDA support for faster Whisper inference
- [ ] **Larger Whisper models** — Option to use `medium` or `large-v3` for better accuracy
- [ ] **Map-Reduce extractors** — Enable the commented-out chunked extraction for very long meetings
- [ ] **Vector store persistence** — Save ChromaDB to disk for session resume
- [ ] **Frontend history persistence** — Store processing history in localStorage or backend DB
- [ ] **Testing** — Add unit tests for each pipeline stage and integration tests for API endpoints
- [ ] **Docker** — Containerize the full stack for easy deployment
- [ ] **CI/CD** — GitHub Actions for automated testing and deployment

---

## 📄 License

This project is built for educational and demonstration purposes.

---

<p align="center">
  <strong>Built with ❤️ using Whisper, Mistral AI, LangChain, ChromaDB, FastAPI, and React</strong>
</p>
