
# from fastapi import FastAPI
# from pydantic import BaseModel
# from sentence_transformers import SentenceTransformer, util
# from fastapi.middleware.cors import CORSMiddleware

# from app.embeddings import EmbeddingService
# from app.vector_store import VectorStore

# # -------------------------------------------------------------------
# # APP INITIALIZATION
# # -------------------------------------------------------------------
# app = FastAPI(title="AutoApply Semantic API")

# # Enable CORS for all origins (frontend/extension will call it)
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # Initialize services
# embed_svc = EmbeddingService()
# store = VectorStore()
# model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

# # -------------------------------------------------------------------
# # REQUEST MODELS
# # -------------------------------------------------------------------
# class QueryRequest(BaseModel):
#     query: str
#     top_k: int = 1

# class MatchRequest(BaseModel):
#     field_text: str
#     keys: list[str]

# class AddFieldRequest(BaseModel):
#     label: str
#     value: str

# # -------------------------------------------------------------------
# # ENDPOINTS
# # -------------------------------------------------------------------

# @app.post("/embed")
# def embed_text(req: QueryRequest):
#     """
#     Return embedding vector length for a given query text.
#     Used for quick backend verification.
#     """
#     emb = embed_svc.embed([req.query])
#     return {"embedding_length": len(emb[0])}


# @app.post("/similar")
# def similar(req: QueryRequest):
#     """
#     Search the vector store for similar labels.
#     Falls back to embedding service if the store is empty.
#     """
#     result = store.search(req.query, top_k=req.top_k)
#     if not result:
#         result = embed_svc.most_similar(req.query, top_k=req.top_k)
#     return result


# @app.post("/match")
# def semantic_match(req: MatchRequest):
#     """
#     Compare a field text against a list of possible keys
#     and return the most semantically similar one.
#     """
#     field_emb = model.encode(req.field_text, convert_to_tensor=True)
#     key_embs = model.encode(req.keys, convert_to_tensor=True)
#     scores = util.cos_sim(field_emb, key_embs)[0]
#     best_idx = int(scores.argmax())
#     best_key = req.keys[best_idx]
#     return {"best_key": best_key, "score": float(scores[best_idx])}



# @app.post("/add_field")
# def add_field(req: AddFieldRequest):
#     """
#     Add a new field (label + value) to the vector store dynamically.
#     """
#     key = req.label.lower().strip()
#     combined_text = f"{req.label.strip()} {req.value.strip()}"
#     store.add_texts([key], [combined_text])
#     return {"status": "added", "field": req.label, "value": req.value}


# @app.get("/list_fields")
# def list_fields():
#     """
#     Return all stored field keys in the vector store.
#     """
#     return {"stored_keys": store.keys}

# backend/app/main.py














# from fastapi import FastAPI
# from pydantic import BaseModel
# from sentence_transformers import SentenceTransformer, util
# from fastapi.middleware.cors import CORSMiddleware

# from app.embeddings import EmbeddingService
# from app.vector_store import VectorStore

# # -------------------------------------------------------------------
# # APP INITIALIZATION
# # -------------------------------------------------------------------
# app = FastAPI(title="AutoApply Semantic API")

# # Enable CORS for all origins (frontend/extension will call it)
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # Initialize services
# embed_svc = EmbeddingService()
# store = VectorStore()
# model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

# # -------------------------------------------------------------------
# # REQUEST MODELS
# # -------------------------------------------------------------------
# class QueryRequest(BaseModel):
#     query: str
#     top_k: int = 1


# class MatchRequest(BaseModel):
#     field_text: str
#     keys: list[str]


# # ✅ unified model for add_field — supports both "key" and "label"
# class AddFieldRequest(BaseModel):
#     key: str | None = None
#     label: str | None = None
#     value: str


# # -------------------------------------------------------------------
# # ENDPOINTS
# # -------------------------------------------------------------------
# @app.post("/embed")
# def embed_text(req: QueryRequest):
#     """Return embedding vector length for a given query text."""
#     emb = embed_svc.embed([req.query])
#     return {"embedding_length": len(emb[0])}


# @app.post("/similar")
# def similar(req: QueryRequest):
#     """
#     Search the vector store for similar labels.
#     Falls back to embedding service if the store is empty.
#     """
#     result = store.search(req.query, top_k=req.top_k)
#     if not result:
#         result = embed_svc.most_similar(req.query, top_k=req.top_k)
#     return result


# @app.post("/match")
# def semantic_match(req: MatchRequest):
#     """
#     Compare a field text against a list of possible keys
#     and return the most semantically similar one (with debug logs).
#     """
#     print("\n[DEBUG] Incoming field_text:", req.field_text)
#     print("[DEBUG] Available keys:", req.keys)

#     # Encode
#     field_emb = model.encode(req.field_text, convert_to_tensor=True)
#     key_embs = model.encode(req.keys, convert_to_tensor=True)

#     # Compute cosine similarity
#     scores = util.cos_sim(field_emb, key_embs)[0]
#     best_idx = int(scores.argmax())
#     best_key = req.keys[best_idx]
#     score = float(scores[best_idx])

#     print(f"[DEBUG] Matched → {best_key}  |  Score: {score}\n")
#     return {"best_key": best_key, "score": score}



# @app.post("/add_field")
# def add_field(req: AddFieldRequest):
#     """
#     Add a new field (key/label + value) to the vector store dynamically.
#     Compatible with both 'key' and 'label' formats.
#     """
#     key = (req.key or req.label or "").lower().strip()
#     if not key:
#         return {"error": "Missing 'key' or 'label' in request."}

#     combined_text = f"{key} {req.value.strip()}"
#     store.add_texts([key], [combined_text])
#     store.save()

#     print(f"[AutoApply Backend] Added field → {key}: {req.value}")
#     return {"status": "added", "field": key, "value": req.value}


# @app.get("/list_fields")
# def list_fields():
#     """Return all stored field keys in the vector store."""
#     return {"stored_keys": store.keys}








# from fastapi import FastAPI
# from pydantic import BaseModel
# from sentence_transformers import SentenceTransformer, util
# from fastapi.middleware.cors import CORSMiddleware

# from app.embeddings import EmbeddingService
# # from app.vector_store import VectorStore

# # -------------------------------------------------------------------
# # APP INITIALIZATION
# # -------------------------------------------------------------------
# app = FastAPI(title="AutoApply Semantic API")

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# embed_svc = EmbeddingService()
# # store = VectorStore()
# model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

# # -------------------------------------------------------------------
# # REQUEST MODELS
# # -------------------------------------------------------------------
# class QueryRequest(BaseModel):
#     query: str
#     top_k: int = 1


# class MatchRequest(BaseModel):
#     field_text: str
#     keys: list[str]


# class AddFieldRequest(BaseModel):
#     label: str
#     value: str


# # -------------------------------------------------------------------
# # ENDPOINTS
# # -------------------------------------------------------------------
# @app.post("/embed")
# def embed_text(req: QueryRequest):
#     """Return embedding vector length for a given query text."""
#     emb = embed_svc.embed([req.query])
#     return {"embedding_length": len(emb[0])}


# @app.post("/similar")
# def similar(req: QueryRequest):
#     """Search the vector store for similar labels."""
#     result = store.search(req.query, top_k=req.top_k)
#     if not result:
#         result = embed_svc.most_similar(req.query, top_k=req.top_k)
#     return result


# @app.post("/match")
# def semantic_match(req: MatchRequest):
#     if not req.keys:
#         raise HTTPException(status_code=400, detail="No keys provided for matching.")
    
#     # continue only if keys are non-empty
#     field_emb = model.encode(req.field_text, convert_to_tensor=True)
#     key_embs = model.encode(req.keys, convert_to_tensor=True)
#     """
#     Compare a field text against a list of possible keys
#     and return the most semantically similar one.
#     """

#     scores = util.cos_sim(field_emb, key_embs)[0]
#     best_idx = int(scores.argmax())
#     best_key = req.keys[best_idx]
#     return {"best_key": best_key, "score": float(scores[best_idx])}


# @app.post("/add_field")
# def add_field(req: AddFieldRequest):
#     """Add a new field (label + value) to the vector store dynamically."""
#     key = req.label.lower().strip()
#     combined_text = f"{req.label.strip()} {req.value.strip()}"
#     store.add_texts([key], [combined_text])
#     return {"status": "added", "field": req.label, "value": req.value}


# @app.get("/list_fields")
# def list_fields():
#     """Return all stored field keys in the vector store."""
#     return {"stored_keys": store.keys}





# main.py - FastAPI app exposing embeddings and similarity endpoints
# from fastapi import FastAPI
# from pydantic import BaseModel
# from sentence_transformers import SentenceTransformer, util
# from app.embeddings import EmbeddingService
# from fastapi.middleware.cors import CORSMiddleware




# app = FastAPI(title="AutoApply Embeddings API")
# embed_svc = EmbeddingService()  # loads model

# app.add_middleware(
#     CORSMiddleware,
#     # allow_origins=["chrome-extension://<YOUR_EXTENSION_ID>"],  # or "*" for testing
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )


# class QueryRequest(BaseModel):
#     query: str
#     top_k: int = 1

# @app.post("/embed")
# def embed_text(req: QueryRequest):
#     emb = embed_svc.embed([req.query])
#     return {"embedding_length": len(emb[0])}

# @app.post("/similar")
# def similar(req: QueryRequest):
#     # returns best matching key from knowledge base (if any)
#     result = embed_svc.most_similar(req.query, top_k=req.top_k)
#     return result


# # -------------------------------------------------------------------
# # NEW SECTION: semantic field matching endpoint
# # -------------------------------------------------------------------

# class MatchRequest(BaseModel):
#     field_text: str
#     keys: list[str]

# # use same model or load lightweight one
# model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

# @app.post("/match")
# def semantic_match(req: MatchRequest):
#     field_emb = model.encode(req.field_text, convert_to_tensor=True)
#     key_embs = model.encode(req.keys, convert_to_tensor=True)
#     scores = util.cos_sim(field_emb, key_embs)[0]
#     best_idx = int(scores.argmax())
#     best_key = req.keys[best_idx]
#     return {"best_key": best_key, "score": float(scores[best_idx])}






# from fastapi import FastAPI, UploadFile, File, HTTPException
# from pydantic import BaseModel
# from fastapi.middleware.cors import CORSMiddleware
# from fastapi.staticfiles import StaticFiles
# from app.embeddings import EmbeddingService
# from sentence_transformers import SentenceTransformer, util
# import os
# # from app.sample_kb import knowledge_base
# import json
# import ast
# from fastapi import Request



# from fastapi import FastAPI, Request
# import faiss, pickle, json
# import numpy as np
# from sentence_transformers import SentenceTransformer
# from app.vector_store import VectorStore






# vector_store = VectorStore()

# # --- Load the model and FAISS index at startup ---
# model = SentenceTransformer("all-MiniLM-L6-v2")
# index = faiss.read_index("vector_store.index")
# with open("vector_store_map.pkl", "rb") as f:
#     vector_keys = pickle.load(f)
# # with open("knowledge_base.json", "r", encoding="utf-8") as f:
# #     KB = json.load(f)


# app = FastAPI(title="AutoApply Embeddings API")

# # ---------- RESUME STORAGE SETUP ----------
# BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# RESUME_DIR = os.path.join(BASE_DIR, "..", "resumes")
# os.makedirs(RESUME_DIR, exist_ok=True)

# # Serve resume files at http://127.0.0.1:8000/resumes/<filename>
# app.mount("/resumes", StaticFiles(directory=RESUME_DIR), name="resumes")

# # Upload endpoint (POST multipart/form-data)
# @app.post("/upload_resume")
# async def upload_resume(file: UploadFile = File(...)):
#     filename = os.path.basename(file.filename)
#     filename = filename.replace("/", "_").replace("\\", "_")

#     dest_path = os.path.join(RESUME_DIR, filename)
#     try:
#         with open(dest_path, "wb") as f:
#             contents = await file.read()
#             f.write(contents)
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Failed to save file: {e}")

#     url = f"http://127.0.0.1:8000/resumes/{filename}"
#     return {"filename": filename, "url": url}


# # ---------- MODEL INITIALIZATION ----------
# embed_svc = EmbeddingService()

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],  # allow all during local testing
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # ---------- REQUEST SCHEMAS ----------
# class QueryRequest(BaseModel):
#     query: str
#     top_k: int = 1

# class MatchRequest(BaseModel):
#     field_text: str
#     keys: list[str]

# class NewLabel(BaseModel):
#     label: str
#     canonical_key: str | None = None


# # ---------- EMBEDDING ROUTES ----------
# @app.post("/embed")
# def embed_text(req: QueryRequest):
#     emb = embed_svc.embed([req.query])
#     return {"embedding_length": len(emb[0])}


# # @app.post("/similar")
# # def similar(req: QueryRequest):
# #     result = embed_svc.most_similar(req.query, top_k=req.top_k)
# #     return result

# @app.post("/update_kb")
# async def update_kb(request: Request):
#     """
#     Receives updated knowledge base (KB) from Chrome extension and rebuilds vector store.
#     """
#     kb = await request.json()
#     if not isinstance(kb, dict):
#         return {"error": "Invalid KB format"}

#     vector_store.build_from_dict(kb)
#     return {"status": "Vector store rebuilt from Chrome KB"}


# @app.post("/similar")
# async def semantic_similarity(request: Request):
#     """
#     Receives:
#       {
#         "field_text": "father's name",
#         "knowledgeBase": {"first_name": "Sneha", "last_name": "A", "fathers_name": "Anand"}
#       }
#     Returns:
#       {"best_key": "fathers_name", "best_value": "Anand", "score": 0.92}
#     """
#     data = await request.json()
#     field_text = data.get("field_text", "").strip()
#     kb = data.get("knowledgeBase", {})

#     if not field_text or not kb:
#         return {"best_key": None, "best_value": None, "score": 0.0}

#     # Prepare texts for semantic comparison
#     texts = [f"{k} - {k.replace('_', ' ')}" for k in kb.keys()]
#     keys = list(kb.keys())

#     # Embed all keys and query field text
#     kb_embeddings = model.encode(texts, normalize_embeddings=True)
#     field_emb = model.encode([field_text], normalize_embeddings=True)

#     # Compute cosine similarity using FAISS
#     dim = kb_embeddings.shape[1]
#     index = faiss.IndexFlatIP(dim)
#     index.add(np.array(kb_embeddings, dtype=np.float32))
#     D, I = index.search(np.array(field_emb, dtype=np.float32), k=1)

#     score, idx = float(D[0][0]), int(I[0][0])
#     best_key = keys[idx]
#     best_value = kb.get(best_key)

#     return {"best_key": best_key, "best_value": best_value, "score": score}

# @app.post("/match")
# def semantic_match(req: MatchRequest):
#     model = SentenceTransformer("all-mpnet-base-v2")
#     field_emb = model.encode(req.field_text, convert_to_tensor=True)
#     key_embs = model.encode(req.keys, convert_to_tensor=True)
#     scores = util.cos_sim(field_emb, key_embs)[0]
#     best_idx = int(scores.argmax())
#     best_key = req.keys[best_idx]
#     return {"best_key": best_key, "score": float(scores[best_idx])}


# # ---------- KNOWLEDGE BASE UPDATE ----------
# # ---------- KNOWLEDGE BASE ENDPOINT ----------
# # @app.get("/getKnowledgeBase")
# # def get_knowledge_base():
# #     """Return the static knowledge base to frontend."""
# #     return knowledge_base





# @app.post("/sync_kb")
# async def sync_kb(request: Request):
#     """
#     Receives nested knowledge base JSON from Chrome extension.
#     Recursively flattens nested fields and stores them in the vector store.
#     """
#     data = await request.json()

#     def flatten_dict(d, parent_key="", sep="."):
#         items = []
#         for k, v in d.items():
#             new_key = f"{parent_key}{sep}{k}" if parent_key else k
#             if isinstance(v, dict):
#                 items.extend(flatten_dict(v, new_key, sep=sep))
#             elif isinstance(v, list):
#                 for i, item in enumerate(v):
#                     if isinstance(item, dict):
#                         items.extend(flatten_dict(item, f"{new_key}[{i}]", sep=sep))
#                     else:
#                         items.append((f"{new_key}[{i}]", str(item)))
#             else:
#                 items.append((new_key, str(v)))
#         return items

#     try:
#         flat_data = flatten_dict(data)
#         embed_svc.vector_store.clear()

#         for key, value in flat_data:
#             embed_svc.add_new_label(key, value)  # flipped order for correct meaning

#         embed_svc.vector_store.save()
#         print(f"[Sync] ✅ Flattened {len(flat_data)} entries added to vector store")
#         return {"status": "success", "flattened_count": len(flat_data)}
#     except Exception as e:
#         print(f"[Sync] ❌ Error: {e}")
#         return {"status": "error", "msg": str(e)}




# # @app.post("/update_kb")
# # def update_kb(data: NewLabel):
# #     label = data.label.strip().lower()
# #     canonical_key = data.canonical_key.strip().lower() if data.canonical_key else None

# #     if not label:
# #         return {"status": "error", "msg": "Label cannot be empty"}

# #     # ✅ Update the in-memory vector store
# #     embed_svc.add_new_label(label, canonical_key)
# #     embed_svc.vector_store.save()

# #     # ✅ Persist to sample_kb.py file
# #     kb_path = os.path.join(BASE_DIR, "sample_kb.py")

# #     try:
# #         # 1️⃣ Read the existing file content
# #         with open(kb_path, "r", encoding="utf-8") as f:
# #             content = f.read()

# #         # 2️⃣ Parse out the dictionary safely
# #         start = content.find("{")
# #         end = content.rfind("}")
# #         kb_dict = ast.literal_eval(content[start:end+1])

# #         # 3️⃣ Add new label to dictionary
# #         kb_dict[label] = canonical_key or label

# #         # 4️⃣ Rewrite the file cleanly
# #         new_content = f"knowledge_base = {json.dumps(kb_dict, indent=4)}\n"
# #         with open(kb_path, "w", encoding="utf-8") as f:
# #             f.write(new_content)

# #     except Exception as e:
# #         print(f"[KB Update Error] Failed to update sample_kb.py: {e}")
# #         return {"status": "error", "msg": str(e)}

# #     return {
# #         "status": "success",
# #         "added_label": label,
# #         "canonical_key": canonical_key,
# #         "persisted_to_file": True
# #     }



# # @app.post("/update_kb")
# # def update_kb(data: NewLabel):
# #     label = data.label.strip().lower()
# #     canonical_key = data.canonical_key.strip().lower() if data.canonical_key else None

# #     if not label:
# #         return {"status": "error", "msg": "Label cannot be empty"}

# #     # ✅ Update the in-memory FAISS vector store
# #     embed_svc.add_new_label(label, canonical_key)
# #     embed_svc.vector_store.save()

# #     # ✅ Path to sample_kb.py
# #     kb_path = os.path.join(BASE_DIR, "sample_kb.py")

# #     try:
# #         # 1️⃣ Read existing content
# #         with open(kb_path, "r", encoding="utf-8") as f:
# #             content = f.read()

# #         # 2️⃣ Extract dictionary safely
# #         start = content.find("{")
# #         end = content.rfind("}")
# #         kb_dict = ast.literal_eval(content[start:end + 1])

# #         # 3️⃣ Check for duplicates
# #         if label in kb_dict:
# #             return {
# #                 "status": "warning",
# #                 "msg": f"Label '{label}' already exists in KB. Skipped updating.",
# #                 "existing_value": kb_dict[label],
# #             }

# #         # 4️⃣ Add new label
# #         kb_dict[label] = canonical_key or label

# #         # 5️⃣ Write updated content back
# #         new_content = f"knowledge_base = {json.dumps(kb_dict, indent=4)}\n"
# #         with open(kb_path, "w", encoding="utf-8") as f:
# #             f.write(new_content)

# #         print(f"✅ [KB Update] Added '{label}' → '{canonical_key or label}' to sample_kb.py")

# #         return {
# #             "status": "success",
# #             "added_label": label,
# #             "canonical_key": canonical_key,
# #             "persisted_to_file": True,
# #         }

# #     except Exception as e:
# #         print(f"❌ [KB Update Error] {e}")
# #         return {"status": "error", "msg": str(e)}


# # @app.post("/update_kb")
# # def update_kb(data: NewLabel):
# #     label = data.label.strip().lower()
# #     canonical_key = data.canonical_key.strip().lower() if data.canonical_key else None

# #     if not label:
# #         return {"status": "error", "msg": "Label cannot be empty"}

# #     kb_path = os.path.join(BASE_DIR, "sample_kb.py")

# #     try:
# #         # 1️⃣ Read existing content
# #         with open(kb_path, "r", encoding="utf-8") as f:
# #             content = f.read()

# #         # 2️⃣ Extract dictionary safely
# #         start = content.find("{")
# #         end = content.rfind("}")
# #         kb_dict = ast.literal_eval(content[start:end + 1])

# #         # 3️⃣ Check for duplicates
# #         if label in kb_dict:
# #             return {
# #                 "status": "warning",
# #                 "msg": f"Label '{label}' already exists in KB. Skipped updating.",
# #                 "existing_value": kb_dict[label],
# #             }

# #         # 4️⃣ Add new label
# #         kb_dict[label] = canonical_key or label

# #         # 5️⃣ Write updated content back
# #         new_content = f"knowledge_base = {json.dumps(kb_dict, indent=4)}\n"
# #         with open(kb_path, "w", encoding="utf-8") as f:
# #             f.write(new_content)

# #         print(f"✅ [KB Update] Added '{label}' → '{canonical_key or label}' to sample_kb.py")

# #         # 6️⃣ Reload and flatten KB for embedding refresh
# #         flat_kb = flatten_dict(kb_dict)

# #         # 7️⃣ Refresh vector store embeddings for better semantic matches
# #         text_entries = [f"{key}: {value}" for key, value in flat_kb.items()]
# #         embed_svc.vector_store.add_texts(texts=text_entries)
# #         embed_svc.vector_store.save()

# #         print(f"✅ [KB Embedding Refresh] Rebuilt with {len(flat_kb)} flattened entries.")

# #         return {
# #             "status": "success",
# #             "added_label": label,
# #             "canonical_key": canonical_key,
# #             "flattened_entries": len(flat_kb),
# #             "persisted_to_file": True,
# #         }

# #     except Exception as e:
# #         print(f"❌ [KB Update Error] {e}")
# #         return {"status": "error", "msg": str(e)}



# @app.get("/dump_kb")
# def dump_kb():
#     """Return all keys currently known to FAISS (semantic store)."""
#     return {"labels": list(embed_svc.vector_store.key_map.values())}


















# main.py

from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
import numpy as np
from app.vector_store import VectorStore
from app.embeddings import EmbeddingService
from fastapi import UploadFile, File
from fastapi.responses import FileResponse
import os


from fastapi.middleware.cors import CORSMiddleware

RESUME_DIR = "uploaded_resumes"
os.makedirs(RESUME_DIR, exist_ok=True)


# ---------------- FastAPI app ----------------
app = FastAPI(title="AutoApply Backend")

origins = ["*"] 

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or ["http://localhost:5500"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------- Initialize services ----------------
embedding_model_name = "sentence-transformers/all-MiniLM-L6-v2"
embed_service = EmbeddingService()
# vector_store = VectorStore(dim=embed_service.dim)
vector_store = embed_service.vector_store

# ---------------- Request models ----------------
class SimilarRequest(BaseModel):
    query: str
    top_k: Optional[int] = 1

class MatchRequest(BaseModel):
    field_text: str
    keys: List[str]

# ---------------- Helper ----------------
def cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    if np.linalg.norm(a) == 0 or np.linalg.norm(b) == 0:
        return 0.0
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))

# ---------------- Routes ----------------
@app.post("/similar")
async def similar(req: SimilarRequest):
    # Embed the query
    q_vec = embed_service.embed(req.query)
    
    # Search vector store
    results = vector_store.search(q_vec, top_k=req.top_k)
    
    # Return semantic match
    return {"results": results}


# @app.post("/match")
# async def match(req: MatchRequest):
#     """
#     Given a field_text and candidate keys, return the key with the highest semantic similarity.
#     """
#     if not req.keys or len(req.keys) == 0:
#         return {"best_key": None, "score": 0.0}

#     q_vec = embed_service.embed_text(req.field_text)
#     best_score = -1.0
#     best_key = None

#     for key in req.keys:
#         # Retrieve key vector from vector store
#         key_vecs = vector_store.search(key, top_k=1)
#         if key_vecs and len(key_vecs) > 0:
#             key_vec = embed_service.embed_text(key)
#             score = cosine_similarity(q_vec, key_vec)
#             if score > best_score:
#                 best_score = score
#                 best_key = key

#     return {"best_key": best_key, "score": best_score}





@app.post("/match")
async def match(req: MatchRequest):
    if not req.keys:
        return {"best_key": None, "score": 0.0}

    q_vec = embed_service.embed(req.field_text)
    best_score = -1.0
    best_key = None

    for key in req.keys:
        key_vec = embed_service.embed(key)  # embed the key, not vector store search
        score = cosine_similarity(q_vec, key_vec)
        if score > best_score:
            best_score = score
            best_key = key

    return {"best_key": best_key, "score": best_score}


# ---------------- Health check ----------------
@app.get("/health")
async def health():
    return {"status": "ok"}

@app.post("/sync_kb")
async def sync_kb(kb: dict):
    embed_service.update_knowledge_base(kb)
    return {"ok": True, "keys": len(kb)}

@app.post("/upload_resume")
async def upload_resume(file: UploadFile = File(...)):
    file_path = os.path.join(RESUME_DIR, file.filename)
    
    # Save the file
    with open(file_path, "wb") as f:
        f.write(await file.read())
    
    return {"filename": file.filename}

@app.get("/resume/{filename}")
async def get_resume(filename: str):
    file_path = os.path.join(RESUME_DIR, filename)
    
    if not os.path.exists(file_path):
        return {"error": "Resume not found"}
    
    return FileResponse(file_path, media_type="application/pdf")




# ---------------- Run app ----------------
if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
