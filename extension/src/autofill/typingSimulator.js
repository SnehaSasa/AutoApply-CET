// typingSimulator.js
export async function typeLikeHuman(el, text, charDelay = 20) {
  el.focus();
  if (el.tagName.toLowerCase() === 'select') {
    for (const opt of Array.from(el.options)) {
      if (opt.value === text || opt.text === text) {
        el.value = opt.value;
        el.dispatchEvent(new Event('change', { bubbles: true }));
        return;
      }
    }
    return;
  }
  el.value = '';
  for (let i = 0; i < text.length; i++) {
    el.value += text[i];
    el.dispatchEvent(new Event('input', { bubbles: true }));
    await new Promise((r) => setTimeout(r, charDelay));
  }
  el.dispatchEvent(new Event('change', { bubbles: true }));
}
