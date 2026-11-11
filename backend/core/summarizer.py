import json
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate 
from langchain_core.output_parsers import StrOutputParser

load_dotenv()


def get_llm():
    return ChatGoogleGenerativeAI(model="gemini-3.8-flash", temperature=0.2)


def _calculate_depth_spec(word_count: int) -> dict:
    """Calculate depth specifications based on transcript length."""
    if word_count < 2000:
        # Short video (< 12-15 mins)
        return {
            "tier": "Concise",
            "categories": "3 to 5",
            "sub_bullets": "2 to 3",
            "instruction": "This is a short video. Provide focused, concise notes highlighting key takeaways without bloating.",
        }
    elif word_count < 7000:
        # Medium video (15 - 45 mins)
        return {
            "tier": "Standard In-Depth",
            "categories": "5 to 8",
            "sub_bullets": "3 to 4",
            "instruction": "This is a moderate-length video. Break it down chronologically into distinct themes or chapters, ensuring all practical steps and nuances are covered.",
        }
    elif word_count < 18000:
        # Long video (45 mins - 2 hours)
        return {
            "tier": "Comprehensive Modular Guide",
            "categories": "8 to 14",
            "sub_bullets": "3 to 5",
            "instruction": "This is an extensive video/lecture. Provide a deep, comprehensive chapter-by-chapter breakdown. Do NOT compress or skip modules. Cover definitions, code/technical concepts, arguments, examples, and distinctions thoroughly.",
        }
    else:
        # Multi-hour deep dive (2 to 4+ hours, like masterclasses or full courses)
        return {
            "tier": "Masterclass / Deep-Dive Textbook Style",
            "categories": "14 to 22",
            "sub_bullets": "4 to 6",
            "instruction": "This is a multi-hour masterclass or extensive deep dive. It is CRITICAL that you do NOT write a generic summary. Break down EVERY major topic, module, sub-concept, and code example chronologically. Cover all foundational explanations, syntax/design patterns, nuances, pitfalls, and takeaways so the reader misses nothing discussed in the video.",
        }


def get_analysis_prompt(word_count: int) -> str:
    spec = _calculate_depth_spec(word_count)
    return f"""You are an elite technical educator and executive analyst.
Analyze the transcript below and produce comprehensive, high-depth notes in English (regardless of the original language of the transcript).

TRANSCRIPT LENGTH CONTEXT:
- Word count: ~{word_count} words
- Depth tier: {spec['tier']}
- Target Major Categories/Modules: {spec['categories']} categories
- Target Sub-bullets per category: {spec['sub_bullets']} detailed sub-bullets
- Special Directive: {spec['instruction']}

Transcript:
\"\"\"{{transcript}}\"\"\"

Respond ONLY with a valid JSON object in this exact schema (no preamble, no markdown codeblocks, raw JSON only):
{{{{
  "title": "Sharp, descriptive title in Title Case (max 8 words)",
  "summary": "### **Executive & Technical Summary**\\n\\n## Key Discussion Points & Modules:\\n\\n* **[Module / Key Concept 1]**\\n    * [Core principle, exact definition, tools/technologies, or key context]\\n    * [In-depth technical explanation, code examples or architecture discussed]\\n    * [Nuances, why it matters, trade-offs, or real-world problem it solves]\\n\\n* **[Module / Key Concept 2]**\\n    * [Core principle, exact definition, tools/technologies, or key context]\\n    * [In-depth technical explanation, code examples or architecture discussed]\\n    * [Nuances, why it matters, trade-offs, or real-world problem it solves]\\n\\n(IMPORTANT: Provide {spec['categories']} major topic/chapter categories that systematically cover the entire video from start to finish without skipping any concepts. Under each category, provide {spec['sub_bullets']} rich, detailed sub-bullets using 4-space indentation with asterisks. Do NOT write high-level generic statements; extract concrete concepts, facts, syntax, and arguments.)\\n\\n## Action Items & Practical Exercises:\\n\\n* [Practical exercise, implementation step, or takeaway 1]\\n* [Practical exercise, implementation step, or takeaway 2]\\n* [Practical exercise, implementation step, or takeaway 3]\\n\\n*This comprehensive breakdown captures all major concepts, technical details, and core takeaways from the video.*",
  "action_items": "Numbered list of every practical exercise, action item, or recommended next step:\\n1. [Task or exercise description]\\n\\nIf none: 'No explicit action items found.'",
  "key_decisions": "Numbered list of key conclusions, architectural choices, or best practice rules:\\n1. [Rule/Decision and rationale]\\n\\nIf none: 'No key decisions noted.'",
  "open_questions": "Numbered list of questions raised, common misconceptions addressed, or areas left for exploration:\\n1. [Question or misconception]\\n\\nIf none: 'No open questions noted.'"
}}}}
"""


def analyze_transcript(transcript: str) -> dict:
    """Scalable Gemini call extracting detailed notes proportioned to transcript length."""
    word_count = len(transcript.split())
    prompt_template = get_analysis_prompt(word_count)

    llm = get_llm()
    prompt = ChatPromptTemplate.from_template(prompt_template)
    chain = prompt | llm | StrOutputParser()

    response_text = chain.invoke({"transcript": transcript}).strip()

    # Clean markdown codeblocks if model wraps output in ```json ... ```
    if response_text.startswith("```"):
        response_text = response_text.strip("`")
        if response_text.startswith("json"):
            response_text = response_text[4:]
    response_text = response_text.strip()

    try:
        return json.loads(response_text)
    except Exception:
        # Fallback in case of parsing edge cases
        return {
            "title": "Meeting Analysis",
            "summary": response_text,
            "action_items": "See summary",
            "key_decisions": "See summary",
            "open_questions": "None noted",
        }


# Backwards-compatible wrappers for app.py
def summarize(transcript: str) -> str:
    return analyze_transcript(transcript)["summary"]


def generate_title(transcript: str) -> str:
    return analyze_transcript(transcript)["title"]
