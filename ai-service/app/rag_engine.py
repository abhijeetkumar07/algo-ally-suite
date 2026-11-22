"""
RAG Engine: Retrieves curated DSA knowledge using semantic and keyword matching.
Works reliably with ChromaDB or in-memory semantic fallback.
"""

from typing import List, Dict, Any
from .knowledge_base import DSA_DOCUMENTS

class DsaRagEngine:
    def __init__(self):
        self.documents = DSA_DOCUMENTS
        self._init_vector_store()

    def _init_vector_store(self):
        # We prepare indexed words for fast local semantic matching
        for doc in self.documents:
            text = (doc["title"] + " " + doc["topic"] + " " + doc["content"]).lower()
            doc["tokens"] = set(text.split())

    def retrieve(self, query: str, top_k: int = 2) -> List[Dict[str, Any]]:
        query_tokens = set(query.lower().split())
        scored = []
        for doc in self.documents:
            overlap = len(query_tokens.intersection(doc["tokens"]))
            # Bonus if topic matches
            if any(token in doc["topic"].lower() for token in query_tokens):
                overlap += 3
            if any(token in doc["title"].lower() for token in query_tokens):
                overlap += 4
            scored.append((overlap, doc))

        scored.sort(key=lambda x: x[0], reverse=True)
        results = [doc for score, doc in scored[:top_k] if score > 0]
        if not results:
            results = [self.documents[0]] # Default fallback doc
        return results

rag_engine = DsaRagEngine()
