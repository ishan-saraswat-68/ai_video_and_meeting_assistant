from dotenv import load_dotenv
load_dotenv()   # MUST be before any core/ imports

from utils.audio_processor import process_input
from core.transcriber import transcribe_all
from core.summarizer import analyze_transcript

if __name__ == "__main__":
    source = "https://www.youtube.com/watch?v=_Q-e_nczWqM&t=223s"
    language = "english"   # "english" → faster-whisper, "hinglish" → Sarvam

    audio_path = process_input(source)
    transcript = transcribe_all(audio_path, language=language)

print("\n" + "=" * 60)
print("📝 TRANSCRIPT")
print("=" * 60)
print(transcript[:500] + "..." if len(transcript) > 500 else transcript)

analysis = analyze_transcript(transcript)

print("\n" + "=" * 60)
print(f"📌 TITLE: {analysis['title']}")
print("=" * 60)
print("\n📋 SUMMARY")
print("-" * 60)
print(analysis['summary'])

print("\n" + "=" * 60)
print("✅ ACTION ITEMS")
print("=" * 60)
print(analysis['action_items'])

print("\n" + "=" * 60)
print("🔑 KEY DECISIONS")
print("=" * 60)
print(analysis['key_decisions'])

print("\n" + "=" * 60)
print("❓ OPEN QUESTIONS")
print("=" * 60)
print(analysis['open_questions'])