import os
from dotenv import load_dotenv
load_dotenv()

from utils.audio_processor import process_input, get_youtube_transcript_fast
from core.transcriber import transcribe_all
from core.summarizer import analyze_transcript
from core.rag_engine import build_rag_chain, ask_question


def run_pipeline(source: str, language: str = "english") -> dict:
    print("starting AI Video Assistant")

    audio_path = None
    transcript = None
    try:
        # Check if YouTube URL and try instant direct captions first
        if source.startswith("http://") or source.startswith("https://"):
            print("⚡ Attempting fast direct transcript retrieval...")
            transcript = get_youtube_transcript_fast(source)
            if transcript:
                print("✅ Found direct YouTube transcript (translated to English)!")

        # Fallback to audio extraction + Whisper/Sarvam if direct transcript not available
        if not transcript:
            print("🔊 Direct transcript not found. Processing audio stream...")
            audio_path = process_input(source)
            transcript = transcribe_all(audio_path, language)

        print(f"raw transcription (first 300 characters ): {transcript[:300]}")


        print("Analyzing meeting with Gemini...")
        analysis = analyze_transcript(transcript)

        rag_chain = build_rag_chain(transcript, analysis["summary"])

        return {
            "title": analysis["title"],
            "transcript": transcript,
            "summary": analysis["summary"],
            "action_items": analysis["action_items"],
            "key_decisions": analysis["key_decisions"],
            "open_questions": analysis["open_questions"],
            "rag_chain": rag_chain,
        }
    finally:
        if audio_path and os.path.exists(audio_path):
            try:
                os.remove(audio_path)
                print(f"🧹 Successfully deleted audio file: {audio_path}")
            except OSError as e:
                print(f"⚠️ Could not delete audio file {audio_path}: {e}")



if __name__ == "__main__":
    # CLI entry point
    source = input("Enter YouTube URL or local file path: ").strip()
    language = input("Language (english/hinglish): ").strip() or "english"
    result = run_pipeline(source, language)

    print("\n" + "=" * 60)
    print(f"📌 Title: {result['title']}")
    print(f"\n📋 Summary:\n{result['summary']}")
    print(f"\n✅ Action Items:\n{result['action_items']}")
    print(f"\n🔑 Key Decisions:\n{result['key_decisions']}")
    print(f"\n❓ Open Questions:\n{result['open_questions']}")
    print("=" * 60)

    # Phase 2 — Chat with your meeting via RAG
    print("\n💬 Chat with your meeting (type 'exit' to quit)\n")
    rag_chain = result["rag_chain"]
    while True:
        question = input("You: ").strip()
        if question.lower() in ["exit", "quit", "q"]:
            print("👋 Goodbye!")
            break
        if not question:
            continue
        answer = ask_question(rag_chain, question)
        print(f"\n🤖 Assistant: {answer}\n")