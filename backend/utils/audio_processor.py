import os
import re
import subprocess
import requests
import yt_dlp
from youtube_transcript_api import YouTubeTranscriptApi

DOWNLOAD_DIR = "downloades"
os.makedirs(DOWNLOAD_DIR, exist_ok=True)


def download_youtube_audio(url: str) -> str:
    """Download audio from YouTube and downsample to 16kHz mono WAV."""
    output_template = os.path.join(DOWNLOAD_DIR, "%(id)s.%(ext)s")
    ydl_opts = {
        "format": "bestaudio/best",
        "outtmpl": output_template,
        # Avoid .part temp file rename collisions
        "nopart": True,
        # Try android first, fallback to ios
        "extractor_args": {"youtube": {"player_client": ["android", "ios"]}},
        "postprocessors": [
            {
                "key": "FFmpegExtractAudio",
                "preferredcodec": "wav",
            }
        ],
        "quiet": True,
        "no_warnings": True,
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=True)
        video_id = info.get("id", "audio")
        raw_wav = os.path.join(DOWNLOAD_DIR, f"{video_id}.wav")

    # Resample the downloaded WAV to 16kHz mono (required by Whisper / Sarvam)
    resampled_wav = os.path.join(DOWNLOAD_DIR, f"{video_id}_16k.wav")
    cmd = [
        "ffmpeg", "-y", "-i", raw_wav,
        "-ar", "16000", "-ac", "1",
        resampled_wav
    ]
    subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)

    # Clean up the raw (full-quality) WAV to save disk space
    if os.path.exists(raw_wav):
        os.remove(raw_wav)

    return resampled_wav



def convert_to_wav(input_path: str) -> str:
    """Downsample any local audio/video file to 16kHz mono WAV using ffmpeg CLI."""
    output_path = os.path.splitext(input_path)[0] + "_16k.wav"
    cmd = [
        "ffmpeg", "-y", "-i", input_path,
        "-ar", "16000", "-ac", "1",
        output_path
    ]
    subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
    return output_path

def extract_youtube_id(url: str) -> str | None:
    """Extract 11-character video ID from any YouTube URL."""
    patterns = [
        r"(?:v=|\/|vi=|youtu\.be\/|\/v\/|\/e\/|watch\?v=|\&v=)([a-zA-Z0-9_-]{11})",
    ]
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    return None


def _extract_text_from_items(data) -> str:
    """Helper to extract text from YouTubeTranscriptApi data items (supports FetchedTranscriptSnippet objects and dicts)."""
    texts = []
    for item in data:
        t = getattr(item, "text", None)
        if t is None and isinstance(item, dict):
            t = item.get("text", "")
        if t and t.strip():
            texts.append(t.strip())
    return " ".join(texts)


def _fetch_subs_via_ytdlp(url: str) -> str | None:
    """Fallback: Fetch YouTube subtitles directly using yt-dlp metadata without downloading media."""
    try:
        ydl_opts = {
            "skip_download": True,
            "quiet": True,
            "no_warnings": True,
            "extractor_args": {"youtube": {"player_client": ["android", "ios", "web"]}},
        }
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            subs = info.get("subtitles") or {}
            auto_subs = info.get("automatic_captions") or {}

            # Prioritize English, then Hindi
            selected_sub = (
                subs.get("en")
                or auto_subs.get("en")
                or subs.get("hi")
                or auto_subs.get("hi")
            )

            if not selected_sub:
                # Pick any available language
                for lang_subs in list(subs.values()) + list(auto_subs.values()):
                    if lang_subs:
                        selected_sub = lang_subs
                        break

            if selected_sub:
                # Find json3 format for cleanest parse, else fallback to first url
                sub_url = next((s["url"] for s in selected_sub if s.get("ext") == "json3"), selected_sub[0]["url"])
                try:
                    # Use ydl.urlopen to authenticate request with YouTube cookies/headers (avoids HTTP 429)
                    raw_bytes = ydl.urlopen(sub_url).read()
                    raw_text = raw_bytes.decode("utf-8", errors="ignore")
                except Exception:
                    res = requests.get(sub_url, timeout=10)
                    raw_text = res.text if res.status_code == 200 else ""

                if raw_text:
                    try:
                        import json
                        data = json.loads(raw_text)
                        text = " ".join(
                            seg.get("utf8", "").strip()
                            for event in data.get("events", [])
                            for seg in event.get("segs", [])
                            if seg.get("utf8", "").strip()
                        )
                        if text:
                            print("⚡ Direct transcript fetched in seconds via yt-dlp subtitles!")
                            return text
                    except Exception:
                        # If not JSON (e.g. vtt), strip basic tags
                        clean = re.sub(r"<[^>]+>", "", raw_text)
                        clean = re.sub(r"\d{2}:\d{2}:\d{2}\.\d{3}.*", "", clean)
                        result = " ".join(clean.split())
                        if result:
                            print("⚡ Direct transcript fetched in seconds via yt-dlp subtitles!")
                            return result
    except Exception as e:
        print(f"yt-dlp subtitle check failed: {e}")
    return None


def get_youtube_transcript_fast(url: str) -> str | None:
    """
    Attempts to fetch subtitles directly from YouTube in 1-2 seconds:
    1. First tries YouTubeTranscriptApi
    2. Fallback: Extracts subtitle streams directly via yt-dlp (bypasses YouTube IP blocks)
    3. Returns None if no captions exist, triggering full audio download fallback.
    """
    video_id = extract_youtube_id(url)
    if not video_id:
        return None

    # Method 1: Try YouTubeTranscriptApi instance
    try:
        api = YouTubeTranscriptApi()
        transcript_list = api.list(video_id)

        # Priority 1: Direct English transcript
        try:
            transcript = transcript_list.find_transcript(["en"])
            data = transcript.fetch()
            text = _extract_text_from_items(data)
            if text:
                print("⚡ Direct transcript fetched via YouTubeTranscriptApi!")
                return text
        except Exception:
            pass

        # Priority 2: Translate Hindi / other languages to English
        for t in transcript_list:
            if getattr(t, "is_translatable", False):
                try:
                    translated = t.translate("en").fetch()
                    text = _extract_text_from_items(translated)
                    if text:
                        print("⚡ Direct translated transcript fetched via YouTubeTranscriptApi!")
                        return text
                except Exception:
                    pass

        # Priority 3: Any raw transcript (e.g. Hindi, Spanish, etc.)
        for t in transcript_list:
            try:
                data = t.fetch()
                text = _extract_text_from_items(data)
                if text:
                    print(f"⚡ Direct transcript ({t.language_code}) fetched via YouTubeTranscriptApi!")
                    return text
            except Exception:
                pass
    except Exception:
        # Benign: YouTube blocks standard scraper IPs, will proceed to yt-dlp
        pass

    # Method 2: yt-dlp subtitle stream inspection (Zero download, bypasses IP bans)
    fast_text = _fetch_subs_via_ytdlp(url)
    if fast_text:
        return fast_text

    print("Direct subtitles not available. Falling back to audio download & AI transcription...")
    return None


def process_input(source: str) -> str:
    """Accepts URL or local file path and returns a lightweight 16kHz mono WAV path."""
    if source.startswith("http://") or source.startswith("https://"):
        print("Downloading & downsampling YouTube audio...")
        return download_youtube_audio(source)
    else:
        print("Converting local file to 16kHz mono WAV...")
        return convert_to_wav(source)
