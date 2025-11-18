
// import { semanticMatch } from "../ai/semanticClient.js";

// /**
//  * Fill all fields on the current page using the knowledge base
//  * @param {Object} knowledgeBase - chrome.storage KB
//  */
// export async function autoFillPage(knowledgeBase) {
//   const SEMANTIC_CONFIDENCE_THRESHOLD = 0.5; // adjust if needed

//   const inputs = Array.from(document.querySelectorAll("input:not([type=hidden]), select, textarea"))
//     .filter(el => {
//       const style = window.getComputedStyle(el);
//       return style && style.display !== "none" && style.visibility !== "hidden" && el.offsetParent !== null;
//     });

//   for (const input of inputs) {
//     input.scrollIntoView({ behavior: "smooth", block: "center" });
//     highlight(input);

//     const labelText = extractLabel(input);
//     let matchedKey = null;

//     // 1) Direct KB match
//     for (const key of Object.keys(knowledgeBase)) {
//       if (!knowledgeBase[key]) continue;
//       const normalized = key.replace(/_/g, " ").toLowerCase();
//       if (labelText.includes(normalized)) {
//         matchedKey = key;
//         break;
//       }
//     }

//     // 2) Semantic match if no direct match
//     if (!matchedKey) {
//       const sem = await semanticMatch(labelText);
//       if (sem && sem.best_label && sem.score >= SEMANTIC_CONFIDENCE_THRESHOLD) {
//         matchedKey = sem.best_label;
//       }
//     }

//     // 3) Fill field if value exists
//     if (matchedKey && knowledgeBase[matchedKey] !== undefined && knowledgeBase[matchedKey] !== null && String(knowledgeBase[matchedKey]).length > 0) {
//       fillInput(input, knowledgeBase[matchedKey]);
//       console.log(`✅ Filled ${matchedKey} → ${knowledgeBase[matchedKey]}`);
//     } else {
//       // 4) Unknown field -> prompt user & save to KB
//       const userVal = prompt(`AutoApply needs a value for: "${labelText}". Enter value or leave blank to skip.`);
//       if (userVal && userVal.trim() !== "") {
//         fillInput(input, userVal);

//         // sanitize key and save
//         const sanitizedKey = labelText.replace(/[^a-z0-9]+/gi, "_").replace(/^_+|_+$/g, "").slice(0, 80);
//         await saveKbKey(sanitizedKey, userVal);
//         knowledgeBase[sanitizedKey] = userVal;
//       }
//     }

//     await new Promise(r => setTimeout(r, 250));
//   }

//   // Handle file inputs (resume)
//   const resumeInputs = document.querySelectorAll('input[type="file"]');
//   for (const fileInput of resumeInputs) {
//     const position = (document.querySelector('h1,h2,h3')?.innerText || "").toLowerCase();
//     let bestResume = null;
//     for (const [name, keywords] of Object.entries(knowledgeBase.resumes || {})) {
//       if (keywords.some(k => position.includes(k.toLowerCase()))) {
//         bestResume = name;
//         break;
//       }
//     }
//     if (bestResume) alert(`📄 Please upload the resume: ${bestResume}`);
//   }

//   console.log("[AutoApply] Autofill complete.");
// }

// // ---------------- Helper functions ----------------
// function highlight(el) {
//   const prev = el.style.boxShadow;
//   el.style.boxShadow = "0 0 0 3px rgba(255,200,0,0.6)";
//   setTimeout(() => { el.style.boxShadow = prev; }, 1600);
// }

// function extractLabel(el) {
//   const placeholder = (el.getAttribute("placeholder") || "").trim();
//   let label = "";
//   const id = el.id;

//   if (id) {
//     const lab = document.querySelector(`label[for="${CSS.escape(id)}"]`);
//     if (lab) label = lab.innerText || lab.textContent || "";
//   }

//   if (!label) {
//     const parentLabel = el.closest("label");
//     if (parentLabel) label = parentLabel.innerText || parentLabel.textContent || "";
//   }

//   if (!label) label += " " + (el.getAttribute("aria-label") || "") + " " + (el.title || "");
//   const name = el.name || "";
//   return `${label} ${placeholder} ${name}`.trim().toLowerCase();
// }

// function fillInput(input, value) {
//   const tag = input.tagName.toLowerCase();
//   const type = (input.type || "").toLowerCase();

//   if (type === "checkbox") {
//     input.checked = ["yes", "true", "1"].includes(String(value).trim().toLowerCase());
//     input.dispatchEvent(new Event("change", { bubbles: true }));
//   } else if (type === "radio") {
//     const group = document.getElementsByName(input.name);
//     const val = String(value).trim().toLowerCase();
//     for (const r of group) {
//       const rVal = (r.value || "").toLowerCase();
//       const rLabel = r.closest("label") ? r.closest("label").innerText.toLowerCase() : "";
//       if (rVal === val || rLabel.includes(val)) {
//         r.checked = true;
//         r.dispatchEvent(new Event("change", { bubbles: true }));
//         break;
//       }
//     }
//   } else if (tag === "select") {
//     const options = Array.from(input.options);
//     const match = options.find(o => (o.value || "").toLowerCase() === value.toLowerCase() || (o.text || "").toLowerCase().includes(value.toLowerCase()));
//     if (match) {
//       input.value = match.value;
//       input.dispatchEvent(new Event("change", { bubbles: true }));
//     }
//   } else {
//     input.value = value;
//     input.dispatchEvent(new Event("input", { bubbles: true }));
//     input.dispatchEvent(new Event("change", { bubbles: true }));
//   }
// }

// async function saveKbKey(key, value) {
//   return new Promise(resolve => {
//     chrome.storage.local.get(["knowledgeBase"], res => {
//       const kb = res.knowledgeBase || {};
//       kb[key] = value;
//       chrome.storage.local.set({ knowledgeBase: kb }, () => resolve(true));
//     });
//   });
// }




/**
 * Fill all fields on the current page using the knowledge base
 
 */
/* @param {Object} knowledgeBase - chrome.storage KB*/
// export async function autoFillPage(knowledgeBase) {
//   const SEMANTIC_CONFIDENCE_THRESHOLD = 0.5;

//   const inputs = Array.from(document.querySelectorAll("input:not([type=hidden]), select, textarea"))
//     .filter(el => {
//       const style = window.getComputedStyle(el);
//       return style && style.display !== "none" && style.visibility !== "hidden" && el.offsetParent !== null;
//     });

//   for (const input of inputs) {
//     input.scrollIntoView({ behavior: "smooth", block: "center" });
//     highlight(input);

//     const labelText = extractLabel(input);
//     let matchedKey = null;

//     // 1️⃣ Direct KB match
//     for (const key of Object.keys(knowledgeBase)) {
//       if (!knowledgeBase[key]) continue;
//       const normalized = key.replace(/_/g, " ").toLowerCase();
//       if (labelText.includes(normalized)) {
//         matchedKey = key;
//         break;
//       }
//     }

//     // 2️⃣ Semantic match
//     if (!matchedKey) {
//       const sem = await semanticMatch(labelText);
//       if (sem && sem.best_label && sem.score >= SEMANTIC_CONFIDENCE_THRESHOLD) {
//         matchedKey = sem.best_label;
//       }
//     }

//     // 3️⃣ Fill field if match found
//     if (matchedKey && knowledgeBase[matchedKey]) {
//       fillInput(input, knowledgeBase[matchedKey]);
//       console.log(`✅ Filled ${matchedKey} → ${knowledgeBase[matchedKey]}`);
//     } else {
//       // 4️⃣ Ask user & save new key both locally + backend
//       const userVal = prompt(`AutoApply needs a value for: "${labelText}". Enter value or leave blank to skip.`);
//       if (userVal && userVal.trim() !== "") {
//         fillInput(input, userVal);

//         const sanitizedKey = labelText
//           .replace(/[^a-z0-9]+/gi, "_")
//           .replace(/^_+|_+$/g, "")
//           .slice(0, 80);

//         await saveKbKey(sanitizedKey, userVal);
//         knowledgeBase[sanitizedKey] = userVal;

//         // 🧠 Add new field to backend vector store
//         await fetch("http://127.0.0.1:8000/add_field", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             label: labelText,
//             value: userVal
//           })
//         })
//           .then(res => res.json())
//           .then(data => console.log("🧩 Backend learned new field:", data))
//           .catch(err => console.error("❌ Failed to add field to backend:", err));
//       }
//     }

//     await new Promise(r => setTimeout(r, 250));
//   }

//   // Handle file inputs (resume)
//   const resumeInputs = document.querySelectorAll('input[type="file"]');
//   for (const fileInput of resumeInputs) {
//     const position = (document.querySelector('h1,h2,h3')?.innerText || "").toLowerCase();
//     let bestResume = null;
//     for (const [name, keywords] of Object.entries(knowledgeBase.resumes || {})) {
//       if (keywords.some(k => position.includes(k.toLowerCase()))) {
//         bestResume = name;
//         break;
//       }
//     }
//     if (bestResume) alert(`📄 Please upload the resume: ${bestResume}`);
//   }

//   console.log("[AutoApply] Autofill complete.");
// }

// // ---------------- Helper functions ----------------
// function highlight(el) {
//   const prev = el.style.boxShadow;
//   el.style.boxShadow = "0 0 0 3px rgba(255,200,0,0.6)";
//   setTimeout(() => { el.style.boxShadow = prev; }, 1600);
// }

// function extractLabel(el) {
//   const placeholder = (el.getAttribute("placeholder") || "").trim();
//   let label = "";
//   const id = el.id;

//   if (id) {
//     const lab = document.querySelector(`label[for='${CSS.escape(id)}']`);
//     if (lab) label = lab.innerText || lab.textContent || "";
//   }

//   if (!label) {
//     const parentLabel = el.closest("label");
//     if (parentLabel) label = parentLabel.innerText || parentLabel.textContent || "";
//   }

//   if (!label) label += " " + (el.getAttribute("aria-label") || "") + " " + (el.title || "");
//   const name = el.name || "";
//   return `${label} ${placeholder} ${name}`.trim().toLowerCase();
// }

// function fillInput(input, value) {
//   const tag = input.tagName.toLowerCase();
//   const type = (input.type || "").toLowerCase();

//   if (type === "checkbox") {
//     input.checked = ["yes", "true", "1"].includes(String(value).trim().toLowerCase());
//     input.dispatchEvent(new Event("change", { bubbles: true }));
//   } else if (type === "radio") {
//     const group = document.getElementsByName(input.name);
//     const val = String(value).trim().toLowerCase();
//     for (const r of group) {
//       const rVal = (r.value || "").toLowerCase();
//       const rLabel = r.closest("label") ? r.closest("label").innerText.toLowerCase() : "";
//       if (rVal === val || rLabel.includes(val)) {
//         r.checked = true;
//         r.dispatchEvent(new Event("change", { bubbles: true }));
//         break;
//       }
//     }
//   } else if (tag === "select") {
//     const options = Array.from(input.options);
//     const match = options.find(o =>
//       (o.value || "").toLowerCase() === value.toLowerCase() ||
//       (o.text || "").toLowerCase().includes(value.toLowerCase())
//     );
//     if (match) {
//       input.value = match.value;
//       input.dispatchEvent(new Event("change", { bubbles: true }));
//     }
//   } else {
//     input.value = value;
//     input.dispatchEvent(new Event("input", { bubbles: true }));
//     input.dispatchEvent(new Event("change", { bubbles: true }));
//   }
// }

// async function saveKbKey(key, value) {
//   return new Promise(resolve => {
//     chrome.storage.local.get(["knowledgeBase"], res => {
//       const kb = res.knowledgeBase || {};
//       kb[key] = value;
//       chrome.storage.local.set({ knowledgeBase: kb }, () => resolve(true));
//     });
//   });
// }



/**
 * AutoApply – Unified Autofill Engine (Frontend + Backend Integrated)
 * ---------------------------------------------------------------
 * This version ensures that:
 *   ✅ Backend vector store is used for field matching
 *   ✅ Local knowledge base stores actual values
 *   ✅ Newly entered values sync automatically to backend
 */

// import { semanticMatch } from "../ai/semanticClient.js";

// export async function autoFillPage(knowledgeBase) {
//   const SEMANTIC_CONFIDENCE_THRESHOLD = 0.5;
//   const backendBaseUrl = "http://127.0.0.1:8000";

//   // Step 1️⃣: Get all stored field labels from backend
//   let storedKeys = [];
//   try {
//     const res = await fetch(`${backendBaseUrl}/list_fields`);
//     const data = await res.json();
//     storedKeys = data.stored_keys || [];
//     console.log("🧠 Loaded stored field keys:", storedKeys);
//   } catch (err) {
//     console.error("❌ Failed to fetch stored keys from backend:", err);
//   }

//   // Step 2️⃣: Collect form fields
//   const inputs = Array.from(document.querySelectorAll("input:not([type=hidden]), select, textarea"))
//     .filter(el => {
//       const style = window.getComputedStyle(el);
//       return (
//         style &&
//         style.display !== "none" &&
//         style.visibility !== "hidden" &&
//         el.offsetParent !== null
//       );
//     });

//   for (const input of inputs) {
//     input.scrollIntoView({ behavior: "smooth", block: "center" });
//     highlight(input);

//     const labelText = extractLabel(input);
//     if (!labelText) continue;

//     // Step 3️⃣: Find the best matching field key from backend
//     let bestKey = null;
//     try {
//       const matchRes = await fetch(`${backendBaseUrl}/match`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ field_text: labelText, keys: storedKeys }),
//       });
//       const matchData = await matchRes.json();
//       bestKey = matchData.best_key?.toLowerCase().trim();
//       console.log(`🔍 Matched "${labelText}" → "${bestKey}" (score: ${matchData.score})`);
//     } catch (err) {
//       console.error("❌ Error during semantic match:", err);
//     }

//     // Step 4️⃣: Normalize key and get value from local knowledge base
//     const normalizedKey = bestKey ? bestKey.replace(/\s+/g, "_") : null;
//     const storedValue = normalizedKey ? knowledgeBase[normalizedKey] : null;

//     if (storedValue) {
//       // ✅ Found locally – fill the field
//       fillInput(input, storedValue);
//       console.log(`✅ Filled "${labelText}" with "${storedValue}"`);
//     } else {
//       // ❓ Missing locally – ask user once and sync both ends
//       const userVal = prompt(`Enter value for "${labelText}"`);
//       if (userVal && userVal.trim() !== "") {
//         fillInput(input, userVal);

//         const safeKey =
//           normalizedKey ||
//           labelText
//             .toLowerCase()
//             .replace(/[^a-z0-9]+/gi, "_")
//             .replace(/^_+|_+$/g, "")
//             .slice(0, 80);

//         // 🧩 Save locally
//         await saveKbKey(safeKey, userVal);
//         knowledgeBase[safeKey] = userVal;

//         // 🧠 Sync to backend vector store
//         try {
//           const res = await fetch(`${backendBaseUrl}/add_field`, {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({
//               label: labelText,
//               value: userVal,
//             }),
//           });
//           const data = await res.json();
//           console.log(`🆕 Backend learned field "${safeKey}"`, data);
//         } catch (err) {
//           console.error("❌ Failed to add field to backend:", err);
//         }
//       }
//     }

//     await new Promise(r => setTimeout(r, 250));
//   }

//   // Step 5️⃣: Handle file uploads (optional)
//   const resumeInputs = document.querySelectorAll('input[type="file"]');
//   for (const fileInput of resumeInputs) {
//     const position = (document.querySelector("h1,h2,h3")?.innerText || "").toLowerCase();
//     let bestResume = null;
//     for (const [name, keywords] of Object.entries(knowledgeBase.resumes || {})) {
//       if (keywords.some(k => position.includes(k.toLowerCase()))) {
//         bestResume = name;
//         break;
//       }
//     }
//     if (bestResume) alert(`📄 Please upload the resume: ${bestResume}`);
//   }

//   console.log("[AutoApply] ✅ Autofill complete.");
// }

// // ---------------------------------------------------------
// // Helper Functions
// // ---------------------------------------------------------

// function highlight(el) {
//   const prev = el.style.boxShadow;
//   el.style.boxShadow = "0 0 0 3px rgba(255,200,0,0.6)";
//   setTimeout(() => {
//     el.style.boxShadow = prev;
//   }, 1600);
// }

// function extractLabel(el) {
//   const placeholder = (el.getAttribute("placeholder") || "").trim();
//   let label = "";
//   const id = el.id;

//   if (id) {
//     const lab = document.querySelector(`label[for='${CSS.escape(id)}']`);
//     if (lab) label = lab.innerText || lab.textContent || "";
//   }

//   if (!label) {
//     const parentLabel = el.closest("label");
//     if (parentLabel) label = parentLabel.innerText || parentLabel.textContent || "";
//   }

//   if (!label)
//     label += " " + (el.getAttribute("aria-label") || "") + " " + (el.title || "");
//   const name = el.name || "";
//   return `${label} ${placeholder} ${name}`.trim().toLowerCase();
// }

// function fillInput(input, value) {
//   const tag = input.tagName.toLowerCase();
//   const type = (input.type || "").toLowerCase();

//   if (type === "checkbox") {
//     input.checked = ["yes", "true", "1"].includes(String(value).trim().toLowerCase());
//     input.dispatchEvent(new Event("change", { bubbles: true }));
//   } else if (type === "radio") {
//     const group = document.getElementsByName(input.name);
//     const val = String(value).trim().toLowerCase();
//     for (const r of group) {
//       const rVal = (r.value || "").toLowerCase();
//       const rLabel = r.closest("label") ? r.closest("label").innerText.toLowerCase() : "";
//       if (rVal === val || rLabel.includes(val)) {
//         r.checked = true;
//         r.dispatchEvent(new Event("change", { bubbles: true }));
//         break;
//       }
//     }
//   } else if (tag === "select") {
//     const options = Array.from(input.options);
//     const match = options.find(
//       o =>
//         (o.value || "").toLowerCase() === value.toLowerCase() ||
//         (o.text || "").toLowerCase().includes(value.toLowerCase())
//     );
//     if (match) {
//       input.value = match.value;
//       input.dispatchEvent(new Event("change", { bubbles: true }));
//     }
//   } else {
//     input.value = value;
//     input.dispatchEvent(new Event("input", { bubbles: true }));
//     input.dispatchEvent(new Event("change", { bubbles: true }));
//   }
// }

// async function saveKbKey(key, value) {
//   return new Promise(resolve => {
//     chrome.storage.local.get(["knowledgeBase"], res => {
//       const kb = res.knowledgeBase || {};
//       kb[key] = value;
//       chrome.storage.local.set({ knowledgeBase: kb }, () => resolve(true));
//     });
//   });
// }















// import { semanticMatch } from "../ai/semanticClient.js";

// export async function autoFillPage(knowledgeBase) {
//   const SEMANTIC_CONFIDENCE_THRESHOLD = 0.5;
//   const backendBaseUrl = "http://127.0.0.1:8000";

//   // Step 1️⃣: Get all stored field labels from backend
//   let storedKeys = [];
//   try {
//     const res = await fetch(`${backendBaseUrl}/list_fields`);
//     const data = await res.json();
//     storedKeys = data.stored_keys || [];
//     console.log("🧠 Loaded stored field keys:", storedKeys);
//   } catch (err) {
//     console.error("❌ Failed to fetch stored keys from backend:", err);
//   }

//   // Step 2️⃣: Collect visible form fields
//   const inputs = Array.from(document.querySelectorAll("input:not([type=hidden]), select, textarea"))
//     .filter(el => {
//       const style = window.getComputedStyle(el);
//       return (
//         style &&
//         style.display !== "none" &&
//         style.visibility !== "hidden" &&
//         el.offsetParent !== null
//       );
//     });

//   for (const input of inputs) {
//     input.scrollIntoView({ behavior: "smooth", block: "center" });
//     highlight(input);

//     const labelText = extractLabel(input);
//     if (!labelText) continue;

//     console.log("🪶 Field detected:", labelText);

//     // Step 3️⃣: Find best matching field key
//     let bestKey = null;
//     let confidence = 0;

//     try {
//       const matchRes = await fetch(`${backendBaseUrl}/match`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ field_text: labelText, keys: storedKeys }),
//       });
//       const matchData = await matchRes.json();
//       bestKey = matchData.best_key?.toLowerCase().trim();
//       confidence = matchData.score || 0;
//       console.log(`🔍 Backend match: "${labelText}" → "${bestKey}" (score: ${confidence})`);
//     } catch (err) {
//       console.error("❌ Error during backend semantic match:", err);
//     }

//     // 🧠 Fallback: use local semanticMatch if backend result is weak
//     if ((!bestKey || confidence < SEMANTIC_CONFIDENCE_THRESHOLD) && typeof semanticMatch === "function") {
//       try {
//         const localSem = await semanticMatch(labelText, storedKeys);
//         if (localSem?.bestKey && localSem.score > confidence) {
//           console.log(
//             `🧩 Local semanticMatch override: "${labelText}" → "${localSem.bestKey}" (score: ${localSem.score})`
//           );
//           bestKey = localSem.bestKey.toLowerCase().trim();
//           confidence = localSem.score;
//         }
//       } catch (err) {
//         console.error("⚠️ Local semanticMatch failed:", err);
//       }
//     }

//     // Step 4️⃣: Normalize and fill
//     const normalizedKey = bestKey ? bestKey.replace(/\s+/g, "_") : null;
//     const storedValue = normalizedKey ? knowledgeBase[normalizedKey] : null;

//     if (storedValue) {
//       fillInput(input, storedValue);
//       console.log(`✅ Filled "${labelText}" with "${storedValue}"`);
//     } else {
//       // Ask user and learn
//       const userVal = prompt(`Enter value for "${labelText}"`);
//       if (userVal && userVal.trim() !== "") {
//         fillInput(input, userVal);

//         const safeKey =
//           normalizedKey ||
//           labelText
//             .toLowerCase()
//             .replace(/[^a-z0-9]+/gi, "_")
//             .replace(/^_+|_+$/g, "")
//             .slice(0, 80);

//         // 🧩 Save locally
//         await saveKbKey(safeKey, userVal);
//         knowledgeBase[safeKey] = userVal;

//         // 🧠 Sync to backend
//         try {
//           const res = await fetch(`${backendBaseUrl}/add_field`, {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({
//               label: labelText,
//               value: userVal,
//             }),
//           });
//           const data = await res.json();
//           console.log(`🆕 Backend learned field "${safeKey}"`, data);
//         } catch (err) {
//           console.error("❌ Failed to add field to backend:", err);
//         }
//       }
//     }

//     await new Promise(r => setTimeout(r, 250)); // small delay for UX
//   }

//   // Step 5️⃣: Handle file uploads
//   const resumeInputs = document.querySelectorAll('input[type="file"]');
//   for (const fileInput of resumeInputs) {
//     const position = (document.querySelector("h1,h2,h3")?.innerText || "").toLowerCase();
//     let bestResume = null;
//     for (const [name, keywords] of Object.entries(knowledgeBase.resumes || {})) {
//       if (keywords.some(k => position.includes(k.toLowerCase()))) {
//         bestResume = name;
//         break;
//       }
//     }
//     if (bestResume) alert(`📄 Please upload the resume: ${bestResume}`);
//   }

//   console.log("[AutoApply] ✅ Autofill complete.");
// }

// // ---------------------------------------------------------
// // Helper Functions
// // ---------------------------------------------------------

// function highlight(el) {
//   const prev = el.style.boxShadow;
//   el.style.boxShadow = "0 0 0 3px rgba(255,200,0,0.6)";
//   setTimeout(() => {
//     el.style.boxShadow = prev;
//   }, 1600);
// }

// function extractLabel(el) {
//   const placeholder = (el.getAttribute("placeholder") || "").trim();
//   let label = "";
//   const id = el.id;

//   if (id) {
//     const lab = document.querySelector(`label[for='${CSS.escape(id)}']`);
//     if (lab) label = lab.innerText || lab.textContent || "";
//   }

//   if (!label) {
//     const parentLabel = el.closest("label");
//     if (parentLabel) label = parentLabel.innerText || parentLabel.textContent || "";
//   }

//   if (!label)
//     label += " " + (el.getAttribute("aria-label") || "") + " " + (el.title || "");
//   const name = el.name || "";
//   return `${label} ${placeholder} ${name}`.trim().toLowerCase();
// }

// function fillInput(input, value) {
//   const tag = input.tagName.toLowerCase();
//   const type = (input.type || "").toLowerCase();

//   if (type === "checkbox") {
//     input.checked = ["yes", "true", "1"].includes(String(value).trim().toLowerCase());
//     input.dispatchEvent(new Event("change", { bubbles: true }));
//   } else if (type === "radio") {
//     const group = document.getElementsByName(input.name);
//     const val = String(value).trim().toLowerCase();
//     for (const r of group) {
//       const rVal = (r.value || "").toLowerCase();
//       const rLabel = r.closest("label") ? r.closest("label").innerText.toLowerCase() : "";
//       if (rVal === val || rLabel.includes(val)) {
//         r.checked = true;
//         r.dispatchEvent(new Event("change", { bubbles: true }));
//         break;
//       }
//     }
//   } else if (tag === "select") {
//     const options = Array.from(input.options);
//     const match = options.find(
//       o =>
//         (o.value || "").toLowerCase() === value.toLowerCase() ||
//         (o.text || "").toLowerCase().includes(value.toLowerCase())
//     );
//     if (match) {
//       input.value = match.value;
//       input.dispatchEvent(new Event("change", { bubbles: true }));
//     }
//   } else {
//     input.value = value;
//     input.dispatchEvent(new Event("input", { bubbles: true }));
//     input.dispatchEvent(new Event("change", { bubbles: true }));
//   }
// }

// async function saveKbKey(key, value) {
//   return new Promise(resolve => {
//     chrome.storage.local.get(["knowledgeBase"], res => {
//       const kb = res.knowledgeBase || {};
//       kb[key] = value;
//       chrome.storage.local.set({ knowledgeBase: kb }, () => resolve(true));
//     });
//   });
// }












// extension/src/autofill/autofillEngine.js

// import { semanticMatch } from "../ai/semanticClient.js";

// /**
//  * Automatically fills all input fields in the current page
//  * using values from the provided knowledge base.
//  *
//  * @param {Object} knowledgeBase - Key-value pairs (like first_name, email, etc.)
//  */
// export async function autoFillPage(knowledgeBase) {
//   const inputs = document.querySelectorAll("input, select, textarea");

//   console.log(`[AutoApply] Found ${inputs.length} fields to analyze.`);

//   for (const input of inputs) {
//     const label = getLabelFor(input);
//     const placeholder = input.getAttribute("placeholder") || "";
//     const nameAttr = input.getAttribute("name") || "";
//     const idAttr = input.getAttribute("id") || "";

//     const fieldText = `${label} ${placeholder} ${nameAttr} ${idAttr}`.toLowerCase().trim();

//     // 1️⃣ Try semantic match using backend
//     const bestKey = await semanticMatch(fieldText, Object.keys(knowledgeBase));

//     // 2️⃣ If no semantic match, try direct keyword matching
//     const finalKey =
//       bestKey ||
//       Object.keys(knowledgeBase).find((key) =>
//         fieldText.includes(key.replace(/_/g, " ").toLowerCase())
//       );

//     if (finalKey && knowledgeBase[finalKey]) {
//       const value = knowledgeBase[finalKey];
//       fillInput(input, value);
//       console.log(`✅ Filled ${finalKey} → ${value}`);
//     } else {
//       console.log(`⚠️ No match for field: "${fieldText}"`);
//     }

//     await delay(150); // small pause between fills
//   }

//   console.log("[AutoApply] Autofill complete.");
// }

// /**
//  * Finds a label text associated with an input field.
//  */
// function getLabelFor(input) {
//   const id = input.id;
//   if (id) {
//     const label = document.querySelector(`label[for="${id}"]`);
//     if (label) return label.innerText.trim();
//   }

//   const parentLabel = input.closest("label");
//   if (parentLabel) return parentLabel.innerText.trim();

//   return "";
// }

// /**
//  * Simulates typing or selection in an input element.
//  */
// function fillInput(input, value) {
//   const tag = input.tagName.toLowerCase();
//   const type = (input.type || "").toLowerCase();

//   if (type === "checkbox" || type === "radio") {
//     input.checked = ["yes", "true", "1"].includes(String(value).toLowerCase());
//     input.dispatchEvent(new Event("change", { bubbles: true }));
//     return;
//   }

//   if (tag === "select") {
//     const options = Array.from(input.options);
//     const match =
//       options.find((o) => o.value.toLowerCase() === value.toLowerCase()) ||
//       options.find((o) => o.textContent.toLowerCase().includes(value.toLowerCase()));

//     if (match) {
//       input.value = match.value;
//       input.dispatchEvent(new Event("change", { bubbles: true }));
//     }
//     return;
//   }

//   // Default: simulate human typing for text fields
//   input.focus();
//   input.value = "";
//   for (const char of String(value)) {
//     input.value += char;
//     input.dispatchEvent(new Event("input", { bubbles: true }));
//   }
//   input.dispatchEvent(new Event("change", { bubbles: true }));
// }

// /**
//  * Adds a small delay (ms).
//  */
// function delay(ms) {
//   return new Promise((res) => setTimeout(res, ms));
// }


// import { semanticMatch } from "../ai/semanticClient.js";

// /**
//  * Automatically fills form fields based on a local knowledge base.
//  * Uses semantic similarity to map labels/placeholders to KB keys.
//  */
// export async function autoFillPage(knowledgeBase) {
//   console.log("[AutoApply] Starting autofill...");
//   const elements = document.querySelectorAll("input, select, textarea");
//   let filledCount = 0;

//   for (const el of elements) {
//     try {
//       // Skip hidden, disabled, or invisible elements
//       if (!el.offsetParent || el.disabled) continue;

//       // Skip file inputs (security restriction)
//       if (el.type === "file") {
//         console.warn("[AutoApply] Skipping file input:", el.name || el.id);
//         alert("📁 Please manually upload your resume for this file field.");
//         continue;
//       }

//       const label = getLabelText(el);
//       const placeholder = el.getAttribute("placeholder") || "";
//       const nameAttr = el.getAttribute("name") || "";
//       const idAttr = el.getAttribute("id") || "";
//       const ariaLabel = el.getAttribute("aria-label") || "";

//       const fieldText = `${label} ${placeholder} ${nameAttr} ${idAttr} ${ariaLabel}`
//         .toLowerCase()
//         .trim();

//       console.log(`[AutoApply] Matching field: "${fieldText}"`);

//       // Call backend semantic matcher
//       const bestKey = await semanticMatch(fieldText, Object.keys(knowledgeBase));

//       if (bestKey && knowledgeBase[bestKey]) {
//         const value = knowledgeBase[bestKey];
//         fillInput(el, value);
//         console.log(`✅ Filled [${bestKey}] → "${value}"`);
//         filledCount++;
//       } else {
//         console.warn(`⚠️ No semantic match for field: "${fieldText}"`);
//       }
//     } catch (err) {
//       console.error("[AutoApply] Error processing field:", err);
//     }
//   }

//   console.log(`[AutoApply] Autofill complete. Total fields filled: ${filledCount}`);
// }

// /** Utility — Get text from <label for=""> or nearby label */
// function getLabelText(input) {
//   let label = "";
//   if (input.id) {
//     const labelEl = document.querySelector(`label[for="${input.id}"]`);
//     if (labelEl) label = labelEl.innerText;
//   }
//   if (!label) {
//     const parentLabel = input.closest("label");
//     if (parentLabel) label = parentLabel.innerText;
//   }
//   return label || "";
// }

// /** Fill text, select, checkbox, etc. safely */
// function fillInput(el, value) {
//   if (!el) return;

//   if (el.tagName === "SELECT") {
//     const options = Array.from(el.options);
//     const match = options.find(o =>
//       o.textContent.toLowerCase().includes(value.toLowerCase())
//     );
//     if (match) {
//       el.value = match.value;
//       el.dispatchEvent(new Event("change", { bubbles: true }));
//     }
//   } else if (el.type === "checkbox" || el.type === "radio") {
//     el.checked = value.toString().toLowerCase() === "yes";
//     el.dispatchEvent(new Event("change", { bubbles: true }));
//   } else if (el.type === "date") {
//     el.value = value;
//   } else if (el.type === "file") {
//     // blocked by browser – skip safely
//     console.warn("[AutoApply] Skipping file input:", el.name || el.id);
//     return;
//   } else {
//     el.value = value;
//     el.dispatchEvent(new Event("input", { bubbles: true }));
//     el.dispatchEvent(new Event("change", { bubbles: true }));
//   }
// }



// autofillEngine.js - exported functions to start autofill programmatically.
// For now contentScript contains main working logic. This module is prepared for reuse.

// Improved autofillEngine.js
// import { semanticMatch } from "../ai/semanticClient.js";

// export async function autoFillPage(knowledgeBase) {
//   const inputs = document.querySelectorAll("input, select, textarea");

//   for (const input of inputs) {
//     const label = getLabelFor(input);
//     const placeholder = input.getAttribute("placeholder") || "";
//     const nameAttr = input.getAttribute("name") || "";
//     const idAttr = input.getAttribute("id") || "";

//     const fieldText = `${label} ${placeholder} ${nameAttr} ${idAttr}`.toLowerCase().trim();

//     // Get best match from knowledge base using semantic match API
//     const bestKey = await semanticMatch(fieldText, Object.keys(knowledgeBase));

//     if (bestKey && knowledgeBase[bestKey]) {
//       const value = knowledgeBase[bestKey];
//       fillInput(input, value);
//       console.log(`✅ Filled ${bestKey} → ${value}`);
//     } else {
//       console.log(`⚠️ No match for field: "${fieldText}"`);
//     }
//   }
// }

// function getLabelFor(input) {
//   const label = document.querySelector(`label[for="${input.id}"]`);
//   return label ? label.innerText : "";
// }

// function fillInput(input, value) {
//   if (input.type === "checkbox" || input.type === "radio") {
//     input.checked = value.toString().toLowerCase() === "yes";
//   } else if (input.tagName === "SELECT") {
//     const options = Array.from(input.options);
//     const match = options.find(o =>
//       o.textContent.toLowerCase().includes(value.toLowerCase())
//     );
//     if (match) input.value = match.value;
//   } else {
//     input.value = value;
//     input.dispatchEvent(new Event("input", { bubbles: true }));
//     input.dispatchEvent(new Event("change", { bubbles: true }));
//   }
// }







// autofillEngine.js
// import { semanticMatch } from "../ai/semanticClient.js";

// /**
//  * Fill all fields on the current page using the knowledge base
//  * @param {Object} knowledgeBase - chrome.storage KB
//  */
// export async function autoFillPage(knowledgeBase) {
//   const SEMANTIC_CONFIDENCE_THRESHOLD = 0.5; // adjust if needed

//   const inputs = Array.from(document.querySelectorAll("input:not([type=hidden]), select, textarea"))
//     .filter(el => {
//       const style = window.getComputedStyle(el);
//       return style && style.display !== "none" && style.visibility !== "hidden" && el.offsetParent !== null;
//     });

//   for (const input of inputs) {
//     input.scrollIntoView({ behavior: "smooth", block: "center" });
//     highlight(input);

//     const labelText = extractLabel(input);
//     let matchedKey = null;

//     // 1) Direct KB match
//     for (const key of Object.keys(knowledgeBase)) {
//       if (!knowledgeBase[key]) continue;
//       const normalized = key.replace(/_/g, " ").toLowerCase();
//       if (labelText.includes(normalized)) {
//         matchedKey = key;
//         break;
//       }
//     }

//     // 2) Semantic match if no direct match
//     if (!matchedKey) {
//       const sem = await semanticMatch(labelText);
//       if (sem && sem.best_label && sem.score >= SEMANTIC_CONFIDENCE_THRESHOLD) {
//         matchedKey = sem.best_label;
//       }
//     }

//     // 3) Fill field if value exists
//     if (matchedKey && knowledgeBase[matchedKey] !== undefined && knowledgeBase[matchedKey] !== null && String(knowledgeBase[matchedKey]).length > 0) {
//       fillInput(input, knowledgeBase[matchedKey]);
//       console.log(`✅ Filled ${matchedKey} → ${knowledgeBase[matchedKey]}`);
//     } else {
//       // 4) Unknown field -> prompt user & save to KB
//       const userVal = prompt(`AutoApply needs a value for: "${labelText}". Enter value or leave blank to skip.`);
//       if (userVal && userVal.trim() !== "") {
//         fillInput(input, userVal);

//         // sanitize key and save
//         const sanitizedKey = labelText.replace(/[^a-z0-9]+/gi, "_").replace(/^_+|_+$/g, "").slice(0, 80);
//         await saveKbKey(sanitizedKey, userVal);
//         knowledgeBase[sanitizedKey] = userVal;
//       }
//     }

//     await new Promise(r => setTimeout(r, 250));
//   }

//   // Handle file inputs (resume)
//   const resumeInputs = document.querySelectorAll('input[type="file"]');
//   for (const fileInput of resumeInputs) {
//     const position = (document.querySelector('h1,h2,h3')?.innerText || "").toLowerCase();
//     let bestResume = null;
//     for (const [name, keywords] of Object.entries(knowledgeBase.resumes || {})) {
//       if (keywords.some(k => position.includes(k.toLowerCase()))) {
//         bestResume = name;
//         break;
//       }
//     }
//     if (bestResume) alert(`📄 Please upload the resume: ${bestResume}`);
//   }

//   console.log("[AutoApply] Autofill complete.");
// }

// // ---------------- Helper functions ----------------
// function highlight(el) {
//   const prev = el.style.boxShadow;
//   el.style.boxShadow = "0 0 0 3px rgba(255,200,0,0.6)";
//   setTimeout(() => { el.style.boxShadow = prev; }, 1600);
// }

// function extractLabel(el) {
//   const placeholder = (el.getAttribute("placeholder") || "").trim();
//   let label = "";
//   const id = el.id;

//   if (id) {
//     const lab = document.querySelector(`label[for="${CSS.escape(id)}"]`);
//     if (lab) label = lab.innerText || lab.textContent || "";
//   }

//   if (!label) {
//     const parentLabel = el.closest("label");
//     if (parentLabel) label = parentLabel.innerText || parentLabel.textContent || "";
//   }

//   if (!label) label += " " + (el.getAttribute("aria-label") || "") + " " + (el.title || "");
//   const name = el.name || "";
//   return `${label} ${placeholder} ${name}`.trim().toLowerCase();
// }

// function fillInput(input, value) {
//   const tag = input.tagName.toLowerCase();
//   const type = (input.type || "").toLowerCase();

//   if (type === "checkbox") {
//     input.checked = ["yes", "true", "1"].includes(String(value).trim().toLowerCase());
//     input.dispatchEvent(new Event("change", { bubbles: true }));
//   } else if (type === "radio") {
//     const group = document.getElementsByName(input.name);
//     const val = String(value).trim().toLowerCase();
//     for (const r of group) {
//       const rVal = (r.value || "").toLowerCase();
//       const rLabel = r.closest("label") ? r.closest("label").innerText.toLowerCase() : "";
//       if (rVal === val || rLabel.includes(val)) {
//         r.checked = true;
//         r.dispatchEvent(new Event("change", { bubbles: true }));
//         break;
//       }
//     }
//   } else if (tag === "select") {
//     const options = Array.from(input.options);
//     const match = options.find(o => (o.value || "").toLowerCase() === value.toLowerCase() || (o.text || "").toLowerCase().includes(value.toLowerCase()));
//     if (match) {
//       input.value = match.value;
//       input.dispatchEvent(new Event("change", { bubbles: true }));
//     }
//   } else {
//     input.value = value;
//     input.dispatchEvent(new Event("input", { bubbles: true }));
//     input.dispatchEvent(new Event("change", { bubbles: true }));
//   }
// }

// async function saveKbKey(key, value) {
//   return new Promise(resolve => {
//     chrome.storage.local.get(["knowledgeBase"], res => {
//       const kb = res.knowledgeBase || {};
//       kb[key] = value;
//       chrome.storage.local.set({ knowledgeBase: kb }, () => resolve(true));
//     });
//   });
// }
