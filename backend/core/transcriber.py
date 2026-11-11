import os
import requests
from concurrent.futures import ThreadPoolExecutor, as_completed
from pydub import AudioSegment
from dotenv import load_dotenv
from faster_whisper import WhisperModel

load_dotenv()

SARVAM_PIECE_SECONDS = 25
SARVAM_STT_TRANSLATE_URL = "https://api.sarvam.ai/speech-to-text-translate"

_whisper_model = None


def get_sarvam_api_key():
    return os.getenv("SARVAM_API_KEY")


def get_sarvam_model():
    return os.getenv("SARVAM_STT_MODEL", "saaras:v2.5")


def get_whisper_model_name():
    return os.getenv("WHISPER_MODEL", "small")


def load_model():
    """Load and cache the faster-whisper CTranslate2 model in RAM."""
    global _whisper_model
    if _whisper_model is None:
        model_name = get_whisper_model_name()
        print(f"Loading faster-whisper model: {model_name} (int8 on CPU)...")
        _whisper_model = WhisperModel(model_name, device="cpu", compute_type="int8")
        print("faster-whisper model ready.")
    return _whisper_model


def transcribe_whisper(audio_path: str) -> str:
    """Transcribe entire audio file with faster-whisper + Silero VAD (skips silence)."""
    model = load_model()
    segments, _ = model.transcribe(
        audio_path,
        beam_size=5,
        vad_filter=True, # Skips silence / background noise automatically
    )
    return " ".join(seg.text.strip() for seg in segments).strip()


def _send_piece_to_sarvam(piece_data: tuple) -> tuple:
    """Worker function for concurrent Sarvam requests."""
    idx, piece_path = piece_data
    api_key = get_sarvam_api_key()
    headers = {"api-subscription-key": api_key}

    try:
        with open(piece_path, "rb") as f:
            files = {"file": (os.path.basename(piece_path), f, "audio/wav")}
            data = {"model": get_sarvam_model(), "with_diarization": "false"}
            res = requests.post(SARVAM_STT_TRANSLATE_URL, headers=headers, files=files, data=data, timeout=60)
            res.raise_for_status()
            text = res.json().get("transcript", "")
            return idx, text
    finally:
        if os.path.exists(piece_path):
            os.remove(piece_path)


def transcribe_sarvam_concurrent(audio_path: str, max_workers: int = 5) -> str:
    """Slice audio into 25s pieces and process concurrently across a worker pool."""
    api_key = get_sarvam_api_key()
    if not api_key:
        raise RuntimeError("SARVAM_API_KEY is not set in environment / .env")

    audio = AudioSegment.from_wav(audio_path)
    piece_ms = SARVAM_PIECE_SECONDS * 1000
    piece_tasks = []

    for i, start in enumerate(range(0, len(audio), piece_ms)):
        piece = audio[start : start + piece_ms]
        piece_path = f"{audio_path}_piece_{i}.wav"
        piece.export(piece_path, format="wav")
        piece_tasks.append((i, piece_path))

    results = {}
    print(f"Dispatching {len(piece_tasks)} pieces to Sarvam across {max_workers} concurrent workers...")
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = [executor.submit(_send_piece_to_sarvam, task) for task in piece_tasks]
        for future in as_completed(futures):
            idx, text = future.result()
            results[idx] = text

    # Assemble transcripts in original order
    ordered_text = [results[i] for i in range(len(piece_tasks)) if results.get(i)]
    return " ".join(ordered_text).strip()


def transcribe_all(audio_input, language: str = "english") -> str:
    """
    Accepts either an audio path (str) or a list of chunks for backwards compatibility.
    """
    audio_path = audio_input[0] if isinstance(audio_input, list) else audio_input

    if language.lower() == "hinglish":
        return transcribe_sarvam_concurrent(audio_path)
    return transcribe_whisper(audio_path)
