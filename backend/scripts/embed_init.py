# embed_init.py - optional script to precompute embeddings for custom labels or resume keywords
# from app.embeddings import EmbeddingService

# if __name__ == "__main__":
#     svc = EmbeddingService()
#     print("Available labels:", svc.keys)


# import requests
# import json

# # URL of your running FastAPI backend
# BACKEND_URL = "http://127.0.0.1:8000"

# # --------------------------------------------------------
# # 1️⃣  Define the same data that exists in your Chrome KB
# # --------------------------------------------------------
# knowledge_base = {
#   "address_line_1": "Flat 2, XYZ Residency, MG Road",
#   "address_line_2": "Block A",
#   "address_line_3": "Thriuvanmiyur, Chennai",
#   "age_age_age": "22",
#   "agree_to_terms_agree": "yes",
#   "are_you_willing_to_relocate_select_yes_no_relocate": "yes",
#   "city": "Chennai",
#   "country": "India",
#   "email": "snehachennai2003.com",
#   "first_name": "Sneha",
#   "full_name": "Sneha A",
#   "graduation_year_graduation_year_gradyear": "2024",
#   "last_name": "A",
#   "new_field_fieldd_fieldd": "FIELDDDDD",
#   "phone": "9999900000",
#   "postal_code": "560001",
#   "resumes": {
#     "Resume.pdf": [
#       "backend developer",
#       "java",
#       "node",
#       "Software developer",
#       "Software Engineer"
#     ],
#     "Resume_DS.pdf": [
#       "data scientist",
#       "machine learning",
#       "nlp",
#       "Artficial Intelligence",
#       "AI"
#     ]
#   },
#   "upload_resume_resumeupload": "yes"
# }

# # --------------------------------------------------------
# # 2️⃣  Send these key–value pairs to FastAPI
# # --------------------------------------------------------
# for key, value in knowledge_base.items():
#     payload = {"key": key, "value": value}
#     try:
#         r = requests.post(f"{BACKEND_URL}/add_field", json=payload)
#         print(f"📤 Added {key}: {r.status_code}")
#     except Exception as e:
#         print(f"❌ Error adding {key}: {e}")

# # --------------------------------------------------------
# # 3️⃣  Verify stored keys
# # --------------------------------------------------------
# try:
#     r = requests.get(f"{BACKEND_URL}/list_fields")
#     print("\n✅ Stored keys:", r.json())
# except Exception as e:
#     print(f"❌ Could not fetch list_fields: {e}")




# embed_init.py - optional script to precompute embeddings for custom labels or resume keywords
# from app.embeddings import EmbeddingService

# if __name__ == "__main__":
#     svc = EmbeddingService()
#     print("Available labels:", svc.keys)
