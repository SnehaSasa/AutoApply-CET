# # embeddings.py - wrapper around sentence-transformers model, simple in-memory vector store
# from sentence_transformers import SentenceTransformer
# import numpy as np
# import os
# from sklearn.metrics.pairwise import cosine_similarity

# class EmbeddingService:
#     def __init__(self, model_name=None):
#         model_name = model_name or os.getenv('EMBEDDING_MODEL', 'sentence-transformers/all-MiniLM-L6-v2')
#         print(f'[EmbeddingService] loading model: {model_name}')
#         self.model = SentenceTransformer(model_name)
#         # seed KB labels (empty initially). Structure: { label_key: "label text", ... }
#         # For demo: include common mappings
#         self.label_texts = {
#             "first_name": "first name given name",
#             "last_name": "last name family name surname",
#             "full_name": "full name",
#             "email": "email address",
#             "phone": "phone number mobile",
#             "city": "city place of residence",
#             "country": "country nation",
#             "postal_code": "postal code zip code",
#             "address": "address residence street"
#         }
#         self._build_index()

#     def _build_index(self):
#         self.keys = list(self.label_texts.keys())
#         texts = [self.label_texts[k] for k in self.keys]
#         self.embeddings = self.model.encode(texts, convert_to_numpy=True)

#     def embed(self, texts):
#         return self.model.encode(texts, convert_to_numpy=True)

#     def most_similar(self, query, top_k=1):
#         q_emb = self.embed([query])[0].reshape(1, -1)
#         sims = cosine_similarity(q_emb, self.embeddings)[0]
#         # find top_k indices
#         idxs = np.argsort(-sims)[:top_k]
#         results = []
#         for i in idxs:
#             results.append({
#                 "best_label": self.keys[i],
#                 "label_text": self.label_texts[self.keys[i]],
#                 "score": float(sims[i])
#             })
#         return {"query": query, "results": results}















# backend/app/embeddings.py
# embeddings.py - backend/app/embeddings.py
# from sentence_transformers import SentenceTransformer, util
# import torch

# class EmbeddingService:
#     def __init__(self):
#         # lightweight, free, no GPU required
#         self.model = SentenceTransformer("all-MiniLM-L6-v2")
#         print("[EmbeddingService] Model loaded: all-MiniLM-L6-v2")

#         # pre-seed knowledge base keys (can be expanded later)
#         self.known_labels = [
#             "first_name",
#             "last_name",
#             "full_name",
#             "email",
#             "phone",
#             "city",
#             "country",
#             "postal_code",
#             "address_line_1",
#             "address_line_2",
#             "address_line_3"
#         ]

#         self.label_embeddings = self.model.encode(self.known_labels, convert_to_tensor=True, normalize_embeddings=True)

#     def embed(self, texts):
#         return self.model.encode(texts, convert_to_tensor=True, normalize_embeddings=True)

#     def most_similar(self, query, top_k=1):
#         query_emb = self.embed([query])
#         cosine_scores = util.cos_sim(query_emb, self.label_embeddings)[0]

#         top_results = torch.topk(cosine_scores, k=min(top_k, len(self.known_labels)))

#         results = []
#         for score, idx in zip(top_results.values, top_results.indices):
#             results.append({
#                 "best_label": self.known_labels[idx],
#                 "score": float(score),
#                 "label_text": query
#             })

#         return {"query": query, "results": results}













# embeddings.py - wrapper around sentence-transformers model, simple in-memory vector store
# from sentence_transformers import SentenceTransformer
# import numpy as np
# import os
# from sklearn.metrics.pairwise import cosine_similarity

# class EmbeddingService:
#     def __init__(self, model_name=None):
#         model_name = model_name or os.getenv('EMBEDDING_MODEL', 'sentence-transformers/all-MiniLM-L6-v2')
#         print(f'[EmbeddingService] loading model: {model_name}')
#         self.model = SentenceTransformer(model_name)
#         # seed KB labels (empty initially). Structure: { label_key: "label text", ... }
#         # For demo: include common mappings
#         self.label_texts = {
#             "first_name": "first name given name",
#             "last_name": "last name family name surname",
#             "full_name": "full name",
#             "email": "email address",
#             "phone": "phone number mobile",
#             "city": "city place of residence",
#             "country": "country nation",
#             "postal_code": "postal code zip code",
#             "address": "address residence street"
#         }
#         self._build_index()

#     def _build_index(self):
#         self.keys = list(self.label_texts.keys())
#         texts = [self.label_texts[k] for k in self.keys]
#         self.embeddings = self.model.encode(texts, convert_to_numpy=True)

#     def embed(self, texts):
#         return self.model.encode(texts, convert_to_numpy=True)

#     def most_similar(self, query, top_k=1):
#         q_emb = self.embed([query])[0].reshape(1, -1)
#         sims = cosine_similarity(q_emb, self.embeddings)[0]
#         # find top_k indices
#         idxs = np.argsort(-sims)[:top_k]
#         results = []
#         for i in idxs:
#             results.append({
#                 "best_label": self.keys[i],
#                 "label_text": self.label_texts[self.keys[i]],
#                 "score": float(sims[i])
#             })
#         return {"query": query, "results": results}











# embeddings.py
# from sentence_transformers import SentenceTransformer, util
# import torch
# import numpy as np
# from app.vector_store import VectorStore

# class EmbeddingService:
#     def __init__(self):
#         # load more accurate model
#         self.model = SentenceTransformer("all-mpnet-base-v2")
#         print("[EmbeddingService] Model loaded: all-mpnet-base-v2")

#         # correct embedding dimension for all-mpnet-base-v2
#         self.dim = 768

#         # initialize persistent FAISS store
#         self.vector_store = VectorStore(dim=self.dim)

#         # predefined knowledge base keys
#         self.known_labels = [
#             "first_name",
#             "last_name",
#             "full_name",
#             "email",
#             "phone",
#             "city",
#             "country",
#             "postal_code",
#             "address_line_1",
#             "address_line_2",
#             "address_line_3"
#         ]

#         # add default KB if store is empty
#         if len(self.vector_store.key_map) == 0:
#             print("[EmbeddingService] Preloading default knowledge base into FAISS store...")
#             embeddings = self.model.encode(self.known_labels, normalize_embeddings=True)
#             self.vector_store.add_embeddings(self.known_labels, embeddings)

#     def embed(self, texts):
#         """Encode text(s) into normalized embeddings."""
#         return self.model.encode(texts, normalize_embeddings=True)

#     def most_similar(self, query, top_k=1):
#         """Find the most semantically similar labels to a query."""
#         query_vec = self.embed([query])[0]
#         results = self.vector_store.search(query_vec, top_k)
#         if not results:
#             return {"query": query, "results": []}

#         formatted = [
#             {"best_label": res["key"], "score": float(res["score"]), "label_text": query}
#             for res in results
#         ]
#         return {"query": query, "results": formatted}

#     def add_new_label(self, new_label):
#         """Add a new label dynamically to the FAISS store."""
#         new_vec = self.embed([new_label])
#         self.vector_store.add_embeddings([new_label], new_vec)
#         print(f"[EmbeddingService] Added new label to FAISS store: {new_label}")








# embeddings.py
# from sentence_transformers import SentenceTransformer, util
# import numpy as np
# from app.vector_store import VectorStore

# class EmbeddingService:
#     def __init__(self):
#         # load a stronger model
#         self.model = SentenceTransformer("all-mpnet-base-v2")
#         print("[EmbeddingService] Model loaded: all-mpnet-base-v2")

#         # correct embedding dimension for all-mpnet-base-v2
#         self.dim = 768

#         # persistent FAISS store
#         self.vector_store = VectorStore(dim=self.dim)

#         # canonical keys (what frontend expects)
#         self.keys = [
#             "first_name",
#             "last_name",
#             "full_name",
#             "email",
#             "phone",
#             "city",
#             "country",
#             "postal_code",
#             "address_line_1",
#             "address_line_2",
#             "address_line_3"
#         ]

#         # alias text per key — *semantic enrichment*
#         # Add common paraphrases/variants so embeddings cover natural language forms.
#         self.aliases = {
#             "first_name": "first name given name forename",
#             "last_name": "last name family name surname",
#             "full_name": "full name complete name",
#             "email": "email e-mail email address contact email",
#             "phone": "phone phone number mobile mobile number contact number",
#             "city": "city town place of residence location",
#             "country": "country nation nationality",
#             "postal_code": "postal code postcode zip zip code pincode pin",
#             "address_line_1": "address line 1 address address line street",
#             "address_line_2": "address line 2 apartment suite",
#             "address_line_3": "address line 3"
#         }

#         # If store empty, preload embeddings computed from aliases (not from key tokens)
#         if len(self.vector_store.key_map) == 0:
#             print("[EmbeddingService] Preloading enriched KB into FAISS store...")
#             label_texts = [ self.aliases[k] if k in self.aliases else k for k in self.keys ]
#             # encode -> returns numpy array of shape (N, dim)
#             embeddings = self.model.encode(label_texts, normalize_embeddings=True, convert_to_numpy=True)
#             # add to vector store using canonical keys (so results return keys)
#             self.vector_store.add_embeddings(self.keys, embeddings)

#     def embed(self, texts):
#         """Return numpy embeddings (normalized)."""
#         return self.model.encode(texts, normalize_embeddings=True, convert_to_numpy=True)

#     def most_similar(self, query, top_k=1):
#         """Return best matching canonical key(s) for query."""
#         qvec = self.embed([query])[0]
#         results = self.vector_store.search(qvec, top_k)
#         # results are list of {"key":..., "score":...}
#         if not results:
#             return {"query": query, "results": []}
#         formatted = []
#         for r in results:
#             formatted.append({
#                 "best_label": r["key"],
#                 "score": float(r["score"]),
#                 "label_text": query
#             })
#         return {"query": query, "results": formatted}

#     # def add_new_label(self, new_label, canonical_key=None):
#     #     """
#     #     Add a new alias or new canonical key.
#     #     - If canonical_key is provided and exists, we embed the alias and add mapping to that key.
#     #     - If canonical_key is None, we create a synthetic key from new_label.
#     #     """
#     #     if canonical_key and canonical_key in self.keys:
#     #         key = canonical_key
#     #     else:
#     #         # create a safe key name from the text
#     #         key = new_label.strip().lower().replace(" ", "_")[:80]
#     #         if key not in self.keys:
#     #             self.keys.append(key)
#     #             # also set a reasonable alias
#     #             self.aliases[key] = new_label

#     #     emb = self.embed([new_label])
#     #     self.vector_store.add_embeddings([key], emb)
#     #     print(f"[EmbeddingService] Added alias for key={key}: '{new_label}'")


#     def add_new_label(self, new_label, canonical_key=None):
#         """
#         Add a new alias or canonical key dynamically to FAISS store.
#         Ensures permanent addition and avoids duplicates.
#         """
#         new_label = new_label.strip().lower()
#         canonical_key = canonical_key.strip().lower() if canonical_key else None

#         # ✅ Ensure key association
#         if canonical_key and canonical_key in self.keys:
#             key = canonical_key
#         else:
#             # Create synthetic new canonical key
#             key = canonical_key or new_label.replace(" ", "_")[:80]
#             if key not in self.keys:
#                 self.keys.append(key)
#                 self.aliases[key] = new_label

#         # Check if this label already exists in FAISS (avoid re-embedding)
#         existing_labels = list(self.vector_store.key_map.values())
#         if any(new_label in l for l in existing_labels):
#             print(f"[EmbeddingService] Label '{new_label}' already exists. Skipping re-add.")
#             return

#         # ✅ Add new embedding to FAISS
#         emb = self.embed([new_label])
#         self.vector_store.add_embeddings([key], emb)
#         print(f"[EmbeddingService] ✅ Learned new mapping: '{new_label}' → '{key}'")

















# from sentence_transformers import SentenceTransformer
# import numpy as np
# import json
# import os
# from app.vector_store import VectorStore

# class EmbeddingService:
#     def normalize_label(self, text):
#         """Normalize text for consistent matching: lowercase, remove smart quotes, strip spaces"""
#         return text.lower().replace("’", "'").strip()

#     def __init__(self):
#         import os

#         index_path = "vector_store.index"
#         map_path = "vector_store_map.pkl"

#         if os.path.exists(index_path):
#             os.remove(index_path)
#         if os.path.exists(map_path):
#             os.remove(map_path)

#         # ✅ Load strong embedding model
#         self.model = SentenceTransformer("all-mpnet-base-v2")
#         print("[EmbeddingService] Model loaded: all-mpnet-base-v2")
#         self.dim = 768

#         # ✅ Persistent FAISS store
#         self.vector_store = VectorStore(dim=self.dim)

#         # ✅ Load knowledge base JSON file
#         # kb_path = os.path.join("app", "data", "knowledge_base.json")
#         # if not os.path.exists(kb_path):
#         #     raise FileNotFoundError(f"Knowledge base file not found at: {kb_path}")
#         # with open(kb_path, "r", encoding="utf-8") as f:
#         #     self.kb = json.load(f)


#         self.kb = {}  # start empty; will be updated by API later
#         self.keys = []
#         self.aliases = {}

        # semantic_schema = {
        #     "address_line_1": {
        #         "description": "First line of the candidate’s residential address (part of full address).",
        #         "aliases": ["address line 1", "street address", "house number", "flat or building name"]
        #     },
        #     "address_line_2": {
        #         "description": "Second line of the residential address (area, locality, etc.).",
        #         "aliases": ["address line 2", "locality", "area", "neighborhood"]
        #     },
        #     "address_line_3": {
        #         "description": "Third line of the address containing city and postal code.",
        #         "aliases": ["address line 3", "city line", "pin code line"]
        #     },
        #     "full_address": {
        #         "description": "Complete residential address formed by concatenating address lines 1, 2, and 3.",
        #         "rule": "Used when the form requests a single address field instead of separate lines."
        #     },
        #     "age": {
        #         "description": "Age of the candidate, derived from the date of birth.",
        #         "aliases": ["age", "current age"]
        #     },
        #     "certifications": {
        #         "description": "List of professional certifications earned by the candidate.",
        #         "rule": "If form allows N certificates, include the first N from the knowledge base.",
        #         "subfields": {
        #             "certificate_name": "Name of the certification (e.g. Microsoft Certified: Azure Fundamentals).",
        #             "certification_number": "Unique ID of the certification, if applicable.",
        #             "earned_on": "Date when certification was earned.",
        #             "expires_on": "Date of expiry, if available."
        #         },
        #         "aliases": ["certifications", "certificates", "achievements", "training certificates"]
        #     },
        #     "city": {
        #         "description": "Current city of residence.",
        #         "aliases": ["city", "place of residence", "current city", "current location", "located at"]
        #     },
        #     "country": {
        #         "description": "Country where the candidate currently resides.",
        #         "aliases": ["country", "nation", "residing country"]
        #     },
        #     "date_of_birth": {
        #         "description": "Date of birth of the candidate in YYYY-MM-DD format.",
        #         "aliases": ["date of birth", "dob", "birth date"]
        #     },
        #     "education": {
        #         "description": "Educational qualification details.",
        #         "subfields": {
        #             "college_name": {
        #                 "description": "Name of the college from which the candidate graduated.",
        #                 "aliases": ["college name", "graduation college", "institution name"]
        #             },
        #             "course": {
        #                 "description": "Branch or specialization studied during the degree.",
        #                 "aliases": ["course", "branch", "specialization", "major"]
        #             },
        #             "degree": {
        #                 "description": "Name of the degree obtained (e.g., Bachelor of Engineering or B.E).",
        #                 "rule": "If B.E or B.E/B.Tech  is not available in dropdown, choose B.Tech.",
        #                 "aliases": ["degree", "qualification", "bachelor’s degree", "engineering degree"]
        #             },
        #             "graduation_year": {
        #                 "description": "Year of passing or graduation.",
        #                 "aliases": ["graduation year", "passed out year", "completion year"]
        #             }
        #         }
        #     },
        #     "email": {
        #         "description": "Candidate’s email address.",
        #         "aliases": ["email", "email address", "mail id"]
        #     },
        #     "family_name": {
        #         "description": "Candidate’s last name or surname.",
        #         "aliases": ["last name", "surname", "family name"]
        #     },
        #     "father_name": {
        #         "description": "Name of the candidate’s father.",
        #         "aliases": ["father’s name", "dad’s name"]
        #     },
        #     "first_name": {
        #         "description": "Candidate’s first name.",
        #         "aliases": ["first name", "given name"]
        #     },
        #     "full_name": {
        #         "description": "Candidate’s complete name (first + last name).",
        #         "aliases": ["full name", "complete name", "candidate name"]
        #     },
        #     "gender": {
        #         "description": "Gender of the candidate.",
        #         "aliases": ["gender", "sex"]
        #     },
        #     "github": {
        #         "description": "GitHub profile link.",
        #         "aliases": ["github", "github link", "github profile", "github url"]
        #     },
        #     "linkedin": {
        #         "description": "LinkedIn profile link.",
        #         "aliases": ["linkedin", "linkedin url", "linkedin profile"]
        #     },
            
        #     "work_experience": {
        #         "description": "Details about current or previous employment.",
        #         "rule": "If job form asks for current company or full-time role, pick this field, not internships.",
        #         "subfields": {
        #             "company_name": "Name of the company where the candidate is employed.",
        #             "position": "Job title or designation.",
        #             "start_date": "Employment start date.",
        #             "end_date": "Employment end date (or ‘Present’ if ongoing).",
        #             "location": "Workplace location.",
        #             "responsibilities": "Summary of roles and responsibilities."
        #         },
        #         "aliases": ["work experience", "professional experience", "organization name", "employer name", "employment history", "Full time employement", "current employment"]
        #     },
        #     "internships": {
        #         "description": (
        #             "List of internships (part-time or temporary roles) completed by the candidate. "
        #             "Used when job forms have fields such as 'internship experience', 'intern company', or 'past internship'. "
        #             "Should NOT be used for full-time or current employment fields."
        #         ),
        #         "rule": "If job form mentions internships or part-time projects, use this field; not work_experience.",
        #         "subfields": {
        #             "company_name": {
        #                 "description": "Name of the company where the internship was done.",
        #                 "aliases": ["intern company", "organization name"]
        #             },
        #             "position": {
        #                 "description": "Title or role during internship.",
        #                 "aliases": ["intern title", "intern role"]
        #             },
        #             "start_date": {
        #                 "description": "Internship start date.",
        #                 "aliases": ["internship start date", "start of internship"]
        #             },
        #             "end_date": {
        #                 "description": "Internship end date.",
        #                 "aliases": ["internship end date", "completion date"]
        #             },
        #             "location": {
        #                 "description": "Internship location.",
        #                 "aliases": ["internship location", "city of internship"]
        #             },
        #             "responsibilities": {
        #                 "description": "Description of work done during internship.",
        #                 "aliases": ["intern tasks", "intern duties", "intern responsibilities"]
        #             }
        #         },
        #         "aliases": ["internship experience", "past internships", "intern details"]
        #     },
        #     "mother_name": {
        #         "description": "Candidate’s mother’s name.",
        #         "aliases": ["mother’s name", "mom’s name", "parent name (mother)"]
        #     },

        #     "country_code": {
        #         "description": (
        #             "Country calling code prefix (e.g., +91 for India). "
        #             "Used before the phone number when required by job forms. "
        #             "Should not be confused with postal code or country name."
        #         ),
        #         "aliases": ["country code", "calling code", "dialing code"],
        #         "rule": "Ensure country_code is never used as postal code or country."
        #     },

        #     "phone": {
        #         "description": (
        #             "Candidate’s mobile phone number. "
        #             "Used when job forms request contact number, mobile number, or phone number. "
        #             "If there’s a telephone/mobile toggle, choose 'mobile'."
        #         ),
        #         "aliases": ["phone", "mobile number", "contact number", "mobile", "cell number"]
        #     },

        #     "postal_code": {
        #         "description": (
        #             "Postal code (PIN code / ZIP code) of the candidate’s address. "
        #             "Do not confuse with country code or country name."
        #         ),
        #         "aliases": ["postal code", "zip code", "pin code"],
        #         "rule": "Used for address-related fields only; avoid mixing with country or calling codes."
        #     },

        #     "publication_link": {
        #         "description": (
        #             "URL of the candidate’s published research paper or article. "
        #             "If job forms have fields like 'publication', 'research paper link', or 'publication URL', "
        #             "this value should be filled."
        #         ),
        #         "aliases": ["publication", "publication link", "research paper", "paper url", "publication url"]
        #     },

        #     "resumes": {
        #         "description": (
        #             "Dictionary of available resumes, each containing keywords and a URL to the file. "
        #             "Before uploading, analyze the job description to select the most relevant resume "
        #             "based on the keyword match."
        #         ),
        #         "rule": (
        #             "If job description contains keywords ['Data Scientist','Senior Data Scientist', 'AI Engineer', 'ML Engineer', 'Artificial Intelligence Engineer','Machine Learning Engineer','Deep Learning Engineer','Generative AI Engineer','Gen AI Engineer'], "
        #             "upload 'Resume_DS.pdf from the url given'. Otherwise, use 'Resume_Sneha.pdf'."
        #         ),
        #         "subfields": {
        #             "keywords": "List of keywords describing which roles the resume is tailored for.",
        #             "url": "URL path to the resume file to be uploaded."
        #         },
        #         "aliases": ["resume", "cv", "curriculum vitae", "resume upload", "upload cv"]}}
        
        # self.knowledge_base_semantics = {
        #     "skills": """
        #     Represents categorized technical and domain-specific skills to be filled in job applications.

        #     Rules:
        #     - Determine which category of skills to use by matching the current job title or target position against the 'applicable_roles'.
        #     - If the job title matches any role in 'data_science_ai.applicable_roles', include all skills listed under 'data_science_ai.skills'.
        #     - If the job title matches any role in 'software_engineering.applicable_roles', include all skills listed under 'software_engineering.skills'.
        #     - Each category’s skills list represents the relevant technical stack and tools the applicant is proficient in for that domain.
        #     - If multiple categories partially match, prioritize the one with the closest role title match.
        #     """,
        #     "default_behavior": (
        #         "If no job title matches any applicable role, include a combined set of general technical skills from all categories."
        #     ),
        # }

#         # Extra aliases to improve matching
#         semantic_schema["family_name"]["aliases"] += ["family name", "surname", "last name"]
#         semantic_schema["father_name"]["aliases"] += ["father name", "dad name"]
#         semantic_schema["postal_code"]["aliases"] += ["pin", "postal", "zip", "pincode", "pin code", "postal code", "postalcode", "zipcode", "zip code", "ZIP code", "ZIPcode"]
        








#         # ✅ Flatten nested dictionary keys (e.g., education.college_name)
#         self.keys = self.flatten_keys(self.kb)

#         # ✅ Generate aliases automatically
#         self.aliases = self.generate_aliases(self.keys)

        

#         # ✅ Preload semantic schema (family_name, father_name, etc.) into FAISS
#         if len(self.vector_store.key_map) == 0:
#             print("[EmbeddingService] Preloading full semantic schema into FAISS store...")

#             all_labels = []
#             all_keys = []


#             for canonical_key, info in semantic_schema.items():
#                 all_labels.append(canonical_key)
#                 all_keys.append(canonical_key)

#                 # add aliases
#                 for alias in info.get("aliases", []):
#                     all_labels.append(self.normalize_label(alias))
#                     all_keys.append(canonical_key)


#             # create embeddings
#             embeddings = self.model.encode(all_labels, normalize_embeddings=True, convert_to_numpy=True)
#             self.vector_store.add_embeddings(all_keys, embeddings)

#             print(f"[EmbeddingService] ✅ Preloaded {len(all_labels)} semantic labels into FAISS store.")

#     # --------------------------------------------------------
#     # 🔹 Helper: Flatten nested dict keys
#     # --------------------------------------------------------
#     def flatten_keys(self, d, parent_key="", sep="."):
#         items = []
#         for k, v in d.items():
#             new_key = f"{parent_key}{sep}{k}" if parent_key else k
#             if isinstance(v, dict):
#                 items.extend(self.flatten_keys(v, new_key, sep=sep))
#             elif isinstance(v, list):
#                 # For list of dicts, flatten each element
#                 for i, item in enumerate(v):
#                     if isinstance(item, dict):
#                         items.extend(self.flatten_keys(item, f"{new_key}[{i}]", sep=sep))
#                     else:
#                         items.append(new_key)
#             else:
#                 items.append(new_key)
#         return list(sorted(set(items)))

#     # --------------------------------------------------------
#     # 🔹 Helper: Generate readable aliases
#     # --------------------------------------------------------
#     def generate_aliases(self, keys):
#         aliases = {}
#         for k in keys:
#             readable = k.replace("_", " ").replace(".", " ").replace("[", " ").replace("]", "")
#             aliases[k] = readable
#         return aliases
    

#     def update_knowledge_base(self, new_kb: dict):
#         import numpy as np
#         from time import time

#         start = time()
#         self.kb = new_kb or {}

#         # Flatten keys and generate aliases
#         self.keys = self.flatten_keys(self.kb)
#         self.aliases = self.generate_aliases(self.keys)

#         # Generate embeddings for KB keys
#         label_texts = [self.aliases[k] for k in self.keys]
#         embeddings = self.model.encode(label_texts, normalize_embeddings=True, convert_to_numpy=True)

#         # Add new embeddings to vector store WITHOUT clearing existing semantic schema
#         self.vector_store.add_embeddings(self.keys, embeddings)

#         print(f"[EmbeddingService] 🔄 Knowledge base updated dynamically with {len(self.keys)} keys in {time() - start:.2f}s")

#     def embed(self, texts):
#         """Return normalized embeddings."""
#         return self.model.encode(texts, normalize_embeddings=True, convert_to_numpy=True)

#     # --------------------------------------------------------
#     # 🔹 Semantic search for best match
#     # --------------------------------------------------------
#     def most_similar(self, query, top_k=1):
#         """Return the best-matching canonical key(s) for query text."""
#         # qvec = self.embed([query])[0]
#         qvec = self.embed([self.normalize_label(query)])[0]

#         results = self.vector_store.search(qvec, top_k)
#         if not results:
#             return {"query": query, "results": []}

#         formatted = [
#             {"best_label": r["key"], "score": float(r["score"]), "label_text": query}
#             for r in results
#         ]
#         return {"query": query, "results": formatted}

#     # --------------------------------------------------------
#     # 🔹 Dynamically add new aliases
#     # --------------------------------------------------------
#     def add_new_label(self, new_label, canonical_key=None):
#         new_label = new_label.strip().lower()
#         canonical_key = canonical_key.strip().lower() if canonical_key else None

#         if canonical_key and canonical_key in self.keys:
#             key = canonical_key
#         else:
#             key = canonical_key or new_label.replace(" ", "_")[:80]
#             if key not in self.keys:
#                 self.keys.append(key)
#                 self.aliases[key] = new_label

#         existing_labels = list(self.vector_store.key_map.values())
#         if any(new_label in l for l in existing_labels):
#             print(f"[EmbeddingService] Label '{new_label}' already exists. Skipping.")
#             return

#         emb = self.embed([new_label])
#         self.vector_store.add_embeddings([key], emb)
#         print(f"[EmbeddingService] ✅ Added: '{new_label}' → '{key}'")


















from sentence_transformers import SentenceTransformer
import numpy as np
import os
from app.vector_store import VectorStore

# -----------------------------
# Knowledge base semantic definitions
# -----------------------------
knowledge_base_embeddings =[
    {"key": "address_line_1", "description": "First line of the candidate’s residential address (part of full address).",
     "aliases": ["address line 1", "street address", "house number", "flat or building name"]},
    {"key": "address_line_2", "description": "Second line of the residential address (area, locality, etc.).",
     "aliases": ["address line 2", "locality", "area", "neighborhood"]},
    {"key": "address_line_3", "description": "Third line of the address containing city and postal code.",
     "aliases": ["address line 3", "city line", "pin code line"]},
    {"key": "full_address", "description": "Complete residential address formed by concatenating address lines 1, 2, and 3.",
     "aliases": ["complete address", "current address", "full address", "address"]},
    {"key": "age", "description": "Age of the candidate, derived from the date of birth.",
     "aliases": ["age", "current age"]},
    {"key": "certifications", "description": "List of professional certifications earned by the candidate.",
     "aliases": ["certifications", "certificates", "achievements", "training certificates"]},
    {"key": "city", "description": "Current city of residence.",
     "aliases": ["city", "place of residence", "current city", "current location", "located at"]},
    {"key": "country", "description": "Country where the candidate currently resides.",
     "aliases": ["country", "nation", "residing country"]},
    {"key": "date_of_birth", "description": "Date of birth of the candidate in YYYY-MM-DD format.",
     "aliases": ["date of birth", "dob", "birth date"]},
    {"key": "education", "description": "Educational qualification details.", "aliases": []},
    {"key": "email", "description": "Candidate’s email address.",
     "aliases": ["email", "email address", "mail id"]},
    {"key": "family_name", "description": "Candidate’s last name or surname.",
     "aliases": ["last name", "surname", "family name"]},
    {"key": "father_name", "description": "Name of the candidate’s father.",
     "aliases": ["Father’s name", "dad’s name"]},
    {"key": "first_name", "description": "Candidate’s first name.",
     "aliases": ["first name", "given name"]},
    {"key": "full_name", "description": "Candidate’s complete name (first + last name).",
     "aliases": ["full name", "complete name", "candidate name"]},
    {"key": "gender", "description": "Gender of the candidate.",
     "aliases": ["gender", "sex"]},
    {"key": "github", "description": "GitHub profile link.",
     "aliases": ["github", "github link", "github profile", "github url"]},
    {"key": "linkedin", "description": "LinkedIn profile link.",
     "aliases": ["linkedin", "linkedin url", "linkedin profile"]},
    {"key": "mother_name", "description": "Candidate’s mother’s name.",
     "aliases": ["mother’s name", "mom’s name", "parent name (mother)"]},
    {"key": "country_code", "description": "Country calling code prefix (e.g., +91 for India).",
     "aliases": ["country code", "calling code", "dialing code"]},
    {"key": "phone", "description": "Candidate’s mobile phone number.",
     "aliases": ["phone", "mobile number", "contact number", "mobile", "cell number"]},
    {"key": "postal_code", "description": "Postal code (PIN code / ZIP code) of the candidate’s address.",
     "aliases": ["postal code", "zip code", "pin code", "pincode", "ZIPcode"]},
    {"key": "publication_link", "description": "URL of the candidate’s published research paper or article.",
     "aliases": ["publication", "publication link", "research paper", "paper url", "publication url"]},
    {"key": "resumes", "description": "Dictionary of available resumes, each containing keywords and a URL to the file.",
     "aliases": ["resume", "cv", "curriculum vitae", "resume upload", "upload cv"]},
    {"key": "college_name", "description": "Name of the candidate’s college or university where they studied.", 
     "aliases": ["college name","university name", "institute name", "alma mater", "college", "university", "institute"]},
    {"key": "degree", "description": "Academic degree obtained by the candidate.",
    "aliases": ["degree", "qualification", "academic degree", "bachelor degree", "engineering degree", "ug degree"]},
    {"key": "course", "description": "Specific program or course studied under the degree.",
    "aliases": ["course", "program", "specialization", "major", "field of study", "branch", "discipline", "subject stream"]},
    {"key": "graduation_year", "description": "Year in which the candidate completed or will complete the degree.",
    "aliases": ["passout year", "graduation year","passing year", "year of completion", "year graduated", "year of passing", "completion year", "graduated year"]},
    {"key": "current_org_name", "description": "Name of the company the candidate is currently working at.",
    "aliases": ["current organization", "current company", "employer", "place of work", "company name", "organization name","current employer"]},
    {"key": "current_org_start_date", "description": "Date when the candidate started working in the current organization.",
    "aliases": ["start date", "employment start date", "joining date", "date of joining", "start working from"]},
    {"key": "current_org_end_date", "description": "End date of employment for the current organization. If still working, value is 'Present'.",
    "aliases": ["end date", "employment end date", "last working day", "until", "worked till"]},
    {"key": "current_org_location", "description": "Location of the current organization where the candidate works.",
    "aliases": ["work location", "job location", "office location", "current job location", "company location"]},
    {"key": "current_org_position", "description": "Job title or role at the current organization.",
    "aliases": ["job title", "designation", "role", "position", "current job title", "current position"]},
    {"key": "current_org_responsibilities", "description": "Professional responsibilities and duties performed in the current role.",
    "aliases": ["responsibilities", "job responsibilities", "roles and responsibilities", "duties", "job description", "tasks performed"]},
    {"key": "internships", "description": "The internships taken up by the candidate",
     "aliases": ["internships", "internship", "internship experience", "internships experience"]}



    ]
    

# -----------------------------
# Embedding Service
# -----------------------------
class EmbeddingService:
    def normalize_label(self, text):
        """Normalize text for consistent matching: lowercase, remove smart quotes, strip spaces"""
        text = text.lower().strip()
        text = text.replace("’", "'").replace("‘", "'").replace("“", '"').replace("”", '"')
        text = text.replace(":", "").replace("-", " ")
        return " ".join(text.split())

    def __init__(self):
        # Clear old FAISS files
        index_path = "vector_store.index"
        map_path = "vector_store_map.pkl"
        if os.path.exists(index_path):
            os.remove(index_path)
        if os.path.exists(map_path):
            os.remove(map_path)

        # Load embedding model
        self.model = SentenceTransformer("all-mpnet-base-v2")
        print("[EmbeddingService] Model loaded: all-mpnet-base-v2")
        self.dim = 768

        # Initialize FAISS vector store
        self.vector_store = VectorStore(dim=self.dim)

        # In-memory knowledge base
        self.kb = {}
        self.keys = []
        self.aliases = {}

        # Flatten keys and generate readable aliases
        self.keys = self.flatten_keys(self.kb)
        self.aliases = self.generate_aliases(self.keys)

        # Preload knowledge base embeddings into FAISS
        print("[EmbeddingService] Preloading knowledge base into FAISS store...")
        all_labels = []
        all_keys = []

        for item in knowledge_base_embeddings:
            key = item["key"]
            description = item["description"]
            aliases = item.get("aliases", [])

            # Add normalized description
            all_labels.append(self.normalize_label(description))
            all_keys.append(key)

            # Add normalized aliases
            for alias in aliases:
                all_labels.append(self.normalize_label(alias))
                all_keys.append(key)

        embeddings = self.model.encode(all_labels, normalize_embeddings=True, convert_to_numpy=True)
        self.vector_store.add_embeddings(all_keys, embeddings)
        print(f"[EmbeddingService] ✅ Preloaded {len(all_labels)} semantic labels into FAISS store.")

    # -----------------------------
    # Flatten nested dict keys
    # -----------------------------
    def flatten_keys(self, d, parent_key="", sep="."):
        items = []
        for k, v in d.items():
            new_key = f"{parent_key}{sep}{k}" if parent_key else k
            if isinstance(v, dict):
                items.extend(self.flatten_keys(v, new_key, sep=sep))
            elif isinstance(v, list):
                for i, item in enumerate(v):
                    if isinstance(item, dict):
                        items.extend(self.flatten_keys(item, f"{new_key}[{i}]", sep=sep))
                    else:
                        items.append(new_key)
            else:
                items.append(new_key)
        return list(sorted(set(items)))

    # -----------------------------
    # Generate readable aliases
    # -----------------------------
    def generate_aliases(self, keys):
        aliases = {}
        for k in keys:
            readable = k.replace("_", " ").replace(".", " ").replace("[", " ").replace("]", "")
            aliases[k] = readable
        return aliases

    # -----------------------------
    # Update knowledge base dynamically
    # -----------------------------
    def update_knowledge_base(self, new_kb: dict):
        from time import time
        start = time()
        self.kb = new_kb or {}
        self.keys = self.flatten_keys(self.kb)
        self.aliases = self.generate_aliases(self.keys)
        label_texts = [self.aliases[k] for k in self.keys]
        embeddings = self.model.encode(label_texts, normalize_embeddings=True, convert_to_numpy=True)
        self.vector_store.add_embeddings(self.keys, embeddings)
        print(f"[EmbeddingService] 🔄 KB updated with {len(self.keys)} keys in {time()-start:.2f}s")

    # -----------------------------
    # Get embeddings
    # -----------------------------
    def embed(self, texts):
        return self.model.encode(texts, normalize_embeddings=True, convert_to_numpy=True)

    # -----------------------------
    # Semantic search
    # -----------------------------
    def most_similar(self, query, top_k=1):
        qvec = self.embed([self.normalize_label(query)])[0]
        results = self.vector_store.search(qvec, top_k)
        if not results:
            return {"query": query, "results": []}
        return {"query": query, "results": [{"best_label": r["key"], "score": float(r["score"]), "label_text": query} for r in results]}

    # -----------------------------
    # Add new alias dynamically
    # -----------------------------
    def add_new_label(self, new_label, canonical_key=None):
        new_label = new_label.strip().lower()
        canonical_key = canonical_key.strip().lower() if canonical_key else None
        key = canonical_key or new_label.replace(" ", "_")[:80]
        if key not in self.keys:
            self.keys.append(key)
            self.aliases[key] = new_label
        existing_labels = list(self.vector_store.key_map.values())
        if any(new_label in l for l in existing_labels):
            print(f"[EmbeddingService] Label '{new_label}' exists. Skipping.")
            return
        emb = self.embed([new_label])
        self.vector_store.add_embeddings([key], emb)
        print(f"[EmbeddingService] ✅ Added: '{new_label}' → '{key}'")
