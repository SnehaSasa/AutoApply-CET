# AutoApply-CET


📌 **AutoApply AI – Intelligent Job Application Autofill Chrome Extension**

AutoApply AI is a GenAI-driven Chrome extension that automatically fills job application forms using smart semantic matching, a knowledge base, and an intelligent resume selector powered by embeddings.

It reads any job application page, understands field labels using machine learning, picks the correct data from a stored knowledge base, simulates human typing, and even auto-attaches the correct resume for the role.

---

## ⭐ Features

1. **AI-based field understanding** using embeddings (SentenceTransformers / HuggingFace).  
2. **Semantic matching engine** to map label → value with 92% accuracy.  
3. Handles **text fields, dropdowns, radio buttons, and file uploads**.  
4. **Role-aware resume selector** (semantic matching of role → resume file).  
5. Built-in **preview button** to view the actual uploaded resume.  
6. **Human-like typing simulation** to avoid bot detection.  
7. Fully **self-learning Knowledge Base** stored in Chrome.

---

## 🏗️ Tech Stack

### **Frontend / Chrome Extension**
- JavaScript (ES6+)
- React + Vite for popup UI
- Chrome Extension Manifest V3
- TailwindCSS
- DOM Automation APIs
- Chrome Storage API

### **Backend**
- Python  
- FastAPI  
- Uvicorn  
- SentenceTransformers (Hugging Face)  
- FAISS vector store  
- PDF serving & blob handling  

---

## 📁 Project Structure

autoApplyChromeextension/
├── backend/
│ ├── app/
│ │ ├── embeddings.py
│ │ ├── main.py
│ │ └── vector_store.py
│ ├── myvenv/
│ ├── scripts/
│ │ └── embed_init.py
│ ├── readme.md
│ └── requirements.txt
├── docs/
│ └── architecture.md
├── extension/
│ ├── dist/
│ │ ├── index.html
│ │ └── assets/
│ │ └── main-Bi0hC8od.js
│ ├── node-modules/
│ ├── src/
│ │ ├── ai/
│ │ │ └── semanticClient.js
│ │ ├── autofill/
│ │ │ ├── autofillEngine.js
│ │ │ └── typingSimulator.js
│ │ ├── popup/
│ │ │ ├── App.jsx
│ │ │ ├── index.html
│ │ │ └── main.jsx
│ │ ├── storage/
│ │ │ └── storage.js
│ │ ├── ui/
│ │ ├── utils/
│ │ │ └── domHelpers.js
│ ├── background.js
│ ├── contentScript.js
│ ├── icon16.png
│ ├── icon48.png
│ ├── icon128.png
│ ├── manifest.json
│ ├── package-lock.json
│ ├── package.json
│ ├── sample_form.html
│ ├── tailwind.config.cjs
│ └── vite.config.mjs
├── tests/
│ ├── demo_pages/
│ │ └── sample_form.html
│ ├── selenium/
│ │ └── test_form_fill.py
│ └── sample_form.html
├── tools/
│ └── helper_scripts.sh
├── .env
├── .gitignore
└── readme.md



autoApplyChromeextension/
├── backend/
│   ├── app/
│   │   ├── embeddings.py
│   │   ├── main.py
│   │   └── vector_store.py
│   ├── myvenv/
│   ├── scripts/
│   │   └── embed_init.py
│   ├── readme.md
│   └── requirements.txt
├── docs/
│   └── architecture.md
├── extension/
│   ├── dist/
│   │   ├── index.html
│   │   └── assets/
│   │       └── main-Bi0hC8od.js
│   ├── node-modules/
│   ├── src/
│   │   ├── ai/
│   │   │   └── semanticClient.js
│   │   ├── autofill/
│   │   │   ├── autofillEngine.js
│   │   │   └── typingSimulator.js
│   │   ├── popup/
│   │   │   ├── App.jsx
│   │   │   ├── index.html
│   │   │   └── main.jsx
│   │   ├── storage/
│   │   │   └── storage.js
│   │   ├── ui/
│   │   ├── utils/
│   │   │   └── domHelpers.js
│   ├── background.js
│   ├── contentScript.js
│   ├── icon16.png
│   ├── icon48.png
│   ├── icon128.png
│   ├── manifest.json
│   ├── package-lock.json
│   ├── package.json
│   ├── sample_form.html
│   ├── tailwind.config.cjs
│   └── vite.config.mjs
├── tests/
│   ├── demo_pages/
│   │   └── sample_form.html
│   ├── selenium/
│   │   └── test_form_fill.py
│   └── sample_form.html
├── tools/
│   └── helper_scripts.sh
├── .env
├── .gitignore
└── readme.md

---


## ⚙️ Installation & Setup Guide

### **Create a virtual environment inside backend and install all the requirements

cd backend
python -m venv myvenv
pip install -r requirements.txt

### **Start the Backend (FastAPI)**

1. Open Terminal 1:
   
cd D:\autoApplyChromeextension\backend
myvenv\Scripts\activate
uvicorn app.main:app --reload


Backend is now running at:

http://127.0.0.1:8000

### **Build the Chrome Extension**

1. Open Terminal 2:
   
cd D:\autoApplyChromeextension\extension
npm run build

This creates the compiled extension in:
extension/dist/


### **Load Extension in Chrome**

1. Open:
chrome://extensions

3. Enable Developer Mode
4. Click Load unpacked
5. Select the extension/ folder
6. Click Reload on your extension

###  **Initialize Knowledge Base in Chrome Storage**

1. Open this:
chrome://extensions → Your Extension → Details → Service Worker

2. Paste this in console to set empty KB:
chrome.storage.local.set(
  { knowledgeBase:{ } },
  () => console.log("✅ Knowledge base successfully stored in Chrome!")
);

3. Verify:
chrome.storage.local.get("knowledgeBase", data => console.log(data));

4. Clear KB:
chrome.storage.local.remove(["knowledgeBase"], () => {
  console.log("Knowledge base fully removed.");
});

### **Run Local Demo Form**

1. Open:
tests/demo_pages/sample_form.html

2. Click the extension icon → Start Autofill.
3. Everything should auto-fill using AI matching + KB + resume selection.

---

## 🧠 How It Works (AI Architecture)

1. Label Extraction (Content Script)
- Reads DOM elements
- Extracts visible labels, placeholders

2. Semantic Matching (Backend)
We use:
- SentenceTransformer('all-MiniLM-L6-v2')
- FAISS vector index for fast similarity search

Workflow:
label → embedding → FAISS search → best KB match → return value

3. Autofill Engine
Handles:
- Text fields
- Textareas
- Dropdowns (semantic option selection)
- Radio buttons
- Date inputs
- File uploads

4. Resume Selector

- Detects job role selected earlier
- Matches role → resume.keywords list
- Fetches PDF from backend

5. Knowledge Base (self-learning)
- If a field is not recognized:
- User enters value
- User gives canonical key
- KB updates
- Future forms autofill automatically

