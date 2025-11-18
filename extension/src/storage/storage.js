// storage.js - wrapper around chrome.storage.local with Promise API

export function getKB() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['knowledgeBase'], (res) => {
      resolve(res.knowledgeBase || {});
    });
  });
}

export function setKB(kb) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ knowledgeBase: kb }, () => {
      resolve(true);
    });
  });
}

export function updateKB(key, value) {
  return new Promise((resolve) => {
    chrome.storage.local.get(['knowledgeBase'], (res) => {
      const existing = res.knowledgeBase || {};
      existing[key] = value;
      chrome.storage.local.set({ knowledgeBase: existing }, () => resolve(true));
    });
  });
}
