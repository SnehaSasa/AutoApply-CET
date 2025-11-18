// // semanticClient.js - lightweight client to contact the backend /similar endpoint
// export async function getSemanticMapping(labelText) {
//   try {
//     const res = await fetch('http://127.0.0.1:8000/similar', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ query: labelText })
//     });
//     if (!res.ok) return null;
//     const data = await res.json();
//     return data;
//   } catch (e) {
//     console.warn('[semanticClient] network error', e);
//     return null;
//   }
// }


// semanticClient.js — connects to FastAPI semantic match endpoint






// export async function semanticMatch(fieldText, keys) {
//   try {
//     const response = await fetch("http://127.0.0.1:8000/match", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ field_text: fieldText, keys }),
//     });
//     const data = await response.json();
//     return data.best_key || null;
//   } catch (err) {
//     console.error("Semantic match error:", err);
//     return null;
//   }
// }















// semanticClient.js — connects to FastAPI semantic match endpoint
// export async function semanticMatch(fieldText, keys) {
//   try {
//     const response = await fetch("http://127.0.0.1:8000/match", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ field_text: fieldText, keys }),
//     });
//     const data = await response.json();
//     return data.best_key || null;
//   } catch (err) {
//     console.error("Semantic match error:", err);
//     return null;
//   }
// }






// src/ai/semanticClient.js
export async function semanticMatch(query, knowledgeKeys) {
  try {
    const response = await fetch("http://127.0.0.1:8000/similar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, top_k: 3 })
    });

    const data = await response.json();

    // find the best label and check score threshold
    if (!data.results || data.results.length === 0) return null;

    const best = data.results[0];
    const bestLabel = best.best_label;
    const score = best.score;

    // 🔥 Lower threshold so similar terms (like "family name") also match
    const threshold = 0.35; // try between 0.30 - 0.40 for best semantic matches

    if (score >= threshold) {
      console.log(`✅ Semantic match: "${query}" → "${bestLabel}" (score: ${score})`);
      return bestLabel;
    } else {
      console.log(`⚠️ Low semantic score (${score}) for "${query}"`);
      return null;
    }
  } catch (err) {
    console.error("Semantic match error:", err);
    return null;
  }
}
