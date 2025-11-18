# # backend/app/vector_store.py
# import os
# import numpy as np
# import faiss
# from sentence_transformers import SentenceTransformer

# class VectorStore:
#     def __init__(self, model_name="all-MiniLM-L6-v2", db_path="vector_store.index"):
#         self.model = SentenceTransformer(model_name)
#         self.db_path = db_path
#         self.keys = []
#         self.texts = []
#         self.embeddings = None
#         self.index = None

#         if os.path.exists(db_path):
#             print(f"[VectorStore] Loading FAISS index from {db_path}")
#             self.load()
#         else:
#             print("[VectorStore] No existing FAISS index found — starting fresh.")

#     def encode(self, texts):
#         return self.model.encode(texts, normalize_embeddings=True)

#     def add_texts(self, keys, texts):
#         vectors = self.encode(texts)
#         if self.index is None:
#             dim = vectors.shape[1]
#             self.index = faiss.IndexFlatIP(dim)
#             self.embeddings = np.array(vectors)
#         else:
#             self.embeddings = np.vstack([self.embeddings, vectors])

#         for key, text in zip(keys, texts):
#             self.keys.append(key)
#             self.texts.append(text)

#         self.index.add(np.array(vectors, dtype=np.float32))
#         self.save()

#     def search(self, query, top_k=1):
#         if self.index is None or len(self.texts) == 0:
#             return None
#         q_vec = self.encode([query]).astype(np.float32)
#         scores, idxs = self.index.search(q_vec, top_k)
#         results = []
#         for i, score in zip(idxs[0], scores[0]):
#             results.append({
#                 "best_label": self.keys[i],
#                 "label_text": self.texts[i],
#                 "score": float(score),
#             })
#         return {"query": query, "results": results}

#     def save(self):
#         faiss.write_index(self.index, self.db_path)
#         np.savez("vector_meta.npz", keys=self.keys, texts=self.texts)
#         print(f"[VectorStore] Saved {len(self.keys)} vectors.")

#     def load(self):
#         self.index = faiss.read_index(self.db_path)
#         meta = np.load("vector_meta.npz", allow_pickle=True)
#         self.keys = list(meta["keys"])
#         self.texts = list(meta["texts"])
#         print(f"[VectorStore] Loaded {len(self.keys)} vectors from disk.")





# backend/app/vector_store.py
# import os
# import numpy as np
# import faiss
# from sentence_transformers import SentenceTransformer

# class VectorStore:
#     def __init__(self, model_name="all-MiniLM-L6-v2", db_path="app/vector_store.index"):
#         self.model = SentenceTransformer(model_name)
#         self.db_path = db_path
#         self.meta_path = "app/vector_meta.npz"
#         self.keys = []
#         self.texts = []
#         self.embeddings = None
#         self.index = None

#         if os.path.exists(self.db_path) and os.path.exists(self.meta_path):
#             print(f"[VectorStore] Loading FAISS index and metadata from disk")
#             self.load()
#         else:
#             print("[VectorStore] No existing index found — starting fresh.")

#     # ---------------------------------------------------------
#     def encode(self, texts):
#         return self.model.encode(texts, normalize_embeddings=True)

#     # ---------------------------------------------------------
    # def add_texts(self, keys, texts):
    #     vectors = self.encode(texts).astype(np.float32)
    #     if self.index is None:
    #         dim = vectors.shape[1]
    #         self.index = faiss.IndexFlatIP(dim)
    #         self.embeddings = vectors
    #     else:
    #         self.embeddings = np.vstack([self.embeddings, vectors])
    #     self.index.add(vectors)

    #     for key, text in zip(keys, texts):
    #         self.keys.append(key)
    #         self.texts.append(text)

    #     self.save()

    # def add_texts(self, keys, texts):
    #     vectors = self.encode(texts).astype(np.float32)

    #     if self.index is None:
    #         dim = vectors.shape[1]
    #         self.index = faiss.IndexFlatIP(dim)
    #         self.embeddings = vectors
    #     else:
    #         # Ensure embeddings array exists and has proper shape
    #         if self.embeddings is None or len(self.embeddings.shape) != 2:
    #             self.embeddings = vectors
    #         else:
    #             self.embeddings = np.vstack([self.embeddings, vectors])

    #     # Add to FAISS
    #     self.index.add(vectors)

    #     # Store metadata
    #     for key, text in zip(keys, texts):
    #         self.keys.append(key)
    #         self.texts.append(text)

    #     self.save()


    # # ---------------------------------------------------------
    # def search(self, query, top_k=1):
    #     if self.index is None or len(self.texts) == 0:
    #         return []
    #     q_vec = self.encode([query]).astype(np.float32)
    #     scores, idxs = self.index.search(q_vec, top_k)
    #     results = []
    #     for i, score in zip(idxs[0], scores[0]):
    #         results.append({
    #             "best_label": self.keys[i],
    #             "label_text": self.texts[i],
    #             "score": float(score),
    #         })
    #     return {"query": query, "results": results}

    # # ---------------------------------------------------------
    # def save(self):
    #     os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
    #     faiss.write_index(self.index, self.db_path)
    #     np.savez(self.meta_path, keys=self.keys, texts=self.texts)
    #     print(f"[VectorStore] Saved {len(self.keys)} fields to disk.")

    # # ---------------------------------------------------------
    # # def load(self):
    # #     self.index = faiss.read_index(self.db_path)
    # #     meta = np.load(self.meta_path, allow_pickle=True)
    # #     self.keys = list(meta["keys"])
    # #     self.texts = list(meta["texts"])
    # #     print(f"[VectorStore] Loaded {len(self.keys)} fields from disk.")

    # def load(self):
    #     if not os.path.exists(self.db_path):
    #         print("[VectorStore] No FAISS index found — starting empty store.")
    #         self.index = None
    #         self.keys = []
    #         self.texts = []
    #         self.embeddings = None
    #         return

    #     self.index = faiss.read_index(self.db_path)

    #     if os.path.exists("vector_meta.npz"):
    #         meta = np.load("vector_meta.npz", allow_pickle=True)
    #         self.keys = list(meta["keys"])
    #         self.texts = list(meta["texts"])
    #         self.embeddings = self.encode(self.texts).astype(np.float32)
    #         print(f"[VectorStore] Loaded {len(self.keys)} vectors from disk.")
    #     else:
    #         print("[VectorStore] FAISS index found but no metadata file — starting with empty keys.")
    #         self.keys = []
    #         self.texts = []
    #         self.embeddings = None


# vector_store.py
# vector_store.py
import faiss
import numpy as np
import os
import pickle

class VectorStore:
    def __init__(self, dim=384, index_file="vector_store.index", map_file="vector_store_map.pkl"):
        self.dim = dim
        self.index_file = index_file
        self.map_file = map_file

        # try loading existing index
        if os.path.exists(index_file) and os.path.exists(map_file):
            self.index = faiss.read_index(index_file)
            with open(map_file, "rb") as f:
                self.key_map = pickle.load(f)
            print(f"[VectorStore] Loaded {len(self.key_map)} vectors from {index_file}")
        else:
            self.index = faiss.IndexFlatIP(dim)
            self.key_map = {}
            print("[VectorStore] New FAISS index created")

    # def add_embeddings(self, keys, embeddings):
    #     if len(embeddings) == 0:
    #         return
    #     if isinstance(embeddings, list):
    #         embeddings = np.array(embeddings)
    #     self.index.add(embeddings.astype(np.float32))
    #     start_id = len(self.key_map)
    #     for i, key in enumerate(keys):
    #         self.key_map[start_id + i] = key
    #     self.save()
    #     print(f"[VectorStore] Added {len(keys)} new embeddings")

    def add_embeddings(self, keys, embeddings):
        if len(embeddings) == 0:
            return
        if isinstance(embeddings, list):
            embeddings = np.array(embeddings)

        # ✅ Prevent duplicates (same key re-added)
        existing_keys = set(self.key_map.values())
        new_keys = [k for k in keys if k not in existing_keys]
        if not new_keys:
            print("[VectorStore] No new keys to add (all exist).")
            return

        embeddings = embeddings[:len(new_keys)]
        self.index.add(embeddings.astype(np.float32))
        start_id = len(self.key_map)
        for i, key in enumerate(new_keys):
            self.key_map[start_id + i] = key
        self.save()
        print(f"[VectorStore] Added {len(new_keys)} new embeddings")


    def search(self, query_vec, top_k=1):
        if len(self.key_map) == 0:
            return []
        query_vec = np.array([query_vec]).astype(np.float32)
        scores, ids = self.index.search(query_vec, top_k)
        results = []
        for score, idx in zip(scores[0], ids[0]):
            if idx == -1:
                continue
            results.append({"key": self.key_map[idx], "score": float(score)})
        return results

    def save(self):
        faiss.write_index(self.index, self.index_file)
        with open(self.map_file, "wb") as f:
            pickle.dump(self.key_map, f)

    def clear(self):
        self.key_map.clear()
        self.index.reset()

