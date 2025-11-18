// // background.js (service worker)
// // Handles messages from popup to content scripts

// chrome.runtime.onInstalled.addListener(() => {
//   console.log('[AutoApply] extension installed');
// });

// // When popup sends start, relay to active tab
// chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
//   if (msg && msg.type === 'POPUP_START_AUTOFILL') {
//     chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//       if (!tabs || !tabs[0]) {
//         sendResponse({ ok: false, err: 'No active tab' });
//         return;
//       }
//       chrome.tabs.sendMessage(tabs[0].id, { type: 'START_AUTOFILL' }, (resp) => {
//         sendResponse({ ok: true, resp });
//       });
//     });
//     return true; // keep sendResponse
//   }
// });














// background.js (service worker)

// chrome.runtime.onInstalled.addListener(() => {
//   console.log('[AutoApply] Extension installed');
// });

// // Listen for popup messages
// chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
//   if (!msg) return;

//   // When popup triggers autofill
//   if (msg.type === 'POPUP_START_AUTOFILL') {
//     chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//       if (!tabs || !tabs[0]) {
//         sendResponse({ ok: false, err: 'No active tab' });
//         return;
//       }

//       // Relay to the content script
//       chrome.tabs.sendMessage(tabs[0].id, { type: 'START_AUTOFILL' }, (resp) => {
//         sendResponse({ ok: true, resp });
//       });
//     });
//     return true; // keep sendResponse alive
//   }

//   // When popup asks to store knowledgeBase manually
//   if (msg.type === 'POPUP_SAVE_KB' && msg.data) {
//     chrome.storage.local.set({ knowledgeBase: msg.data }, () => {
//       console.log('[AutoApply] Knowledge base saved');
//       sendResponse({ ok: true });
//     });
//     return true;
//   }

//   // When popup asks to read knowledgeBase
//   if (msg.type === 'POPUP_GET_KB') {
//     chrome.storage.local.get(['knowledgeBase'], (res) => {
//       sendResponse({ ok: true, data: res.knowledgeBase || {} });
//     });
//     return true;
//   }
// });
















chrome.runtime.onInstalled.addListener(() => {
  console.log('[AutoApply] Extension installed');
});

// Listen for popup messages
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (!msg) return;

  // When popup triggers autofill
  if (msg.type === 'POPUP_START_AUTOFILL') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs || !tabs[0]) {
        sendResponse({ ok: false, err: 'No active tab' });
        return;
      }

      // Relay to the content script
      chrome.tabs.sendMessage(tabs[0].id, { type: 'START_AUTOFILL' }, (resp) => {
        sendResponse({ ok: true, resp });
      });
    });
    return true;
  }

  // When popup asks to store knowledgeBase manually
  if (msg.type === 'POPUP_SAVE_KB' && msg.data) {
    chrome.storage.local.set({ knowledgeBase: msg.data }, () => {
      console.log('[AutoApply] Knowledge base saved');
      sendResponse({ ok: true });
    });
    return true;
  }

  // When popup asks to read knowledgeBase
  if (msg.type === 'POPUP_GET_KB') {
    chrome.storage.local.get(['knowledgeBase'], (res) => {
      sendResponse({ ok: true, data: res.knowledgeBase || {} });
    });
    return true;
  }
});


// 🧠 Auto-sync knowledge base to FastAPI backend
function syncKnowledgeBase() {
  chrome.storage.local.get("knowledgeBase", (data) => {
    if (!data.knowledgeBase) {
      console.warn("[AutoApply] ⚠️ No knowledge base found in chrome.storage.local");
      return;
    }

    fetch("http://127.0.0.1:8000/sync_kb", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data.knowledgeBase)
    })
      .then((res) => res.json())
      .then((response) => {
        console.log("[AutoApply] ✅ KB synced with FastAPI:", response);
      })
      .catch((err) => console.error("[AutoApply] ❌ Sync failed:", err));
  });
}

// 🔁 Sync automatically on these events
chrome.runtime.onStartup.addListener(syncKnowledgeBase);
chrome.runtime.onInstalled.addListener(syncKnowledgeBase);

// Optional: live sync whenever the KB changes
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "local" && changes.knowledgeBase) {
    console.log("[AutoApply] 🔄 Detected KB update — syncing...");
    syncKnowledgeBase();
  }
});
