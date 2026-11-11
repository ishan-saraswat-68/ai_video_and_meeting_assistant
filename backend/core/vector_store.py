import uuid
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter

CHROMA_DIR = "vector_db"
EMBED_MODEL = "all-MiniLM-L6-v2"

_embeddings = None


def get_embeddings():
    """Cached singleton embedding model."""
    global _embeddings
    if _embeddings is None:
        print("Loading HuggingFace embeddings model (all-MiniLM-L6-v2)...")
        _embeddings = HuggingFaceEmbeddings(
            model_name=EMBED_MODEL,
            model_kwargs={"trust_remote_code": True},
        )
        print("Embedding model ready.")
    return _embeddings


def build_vector_store(transcript: str, summary: str = None) -> Chroma:
    """Creates a fresh, isolated vector collection for the meeting."""
    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    chunks = splitter.split_text(transcript)

    docs = [
        Document(page_content=chunk, metadata={"chunk_index": i, "source": "transcript"})
        for i, chunk in enumerate(chunks)
    ]

    if summary:
        docs.append(Document(page_content=f"Meeting Summary:\n{summary}", metadata={"source": "summary"}))

    collection_name = f"meeting_{uuid.uuid4().hex[:8]}"

    vector_store = Chroma.from_documents(
        documents=docs,
        embedding=get_embeddings(),
        persist_directory=CHROMA_DIR,
        collection_name=collection_name,
    )
    return vector_store


def load_vector_store(collection_name: str = "meeting_transcript") -> Chroma:
    return Chroma(
        persist_directory=CHROMA_DIR,
        collection_name=collection_name,
        embedding_function=get_embeddings(),
    )


def get_retriever(vector_store: Chroma, k: int = 4):
    return vector_store.as_retriever(search_kwargs={"k": k})

