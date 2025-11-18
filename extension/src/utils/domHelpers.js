// domHelpers.js - small DOM utils used by contentScript (if needed)
export function visibleInputs() {
  const selectors = 'input:not([type=hidden]), textarea, select';
  return Array.from(document.querySelectorAll(selectors)).filter(el => {
    const style = window.getComputedStyle(el);
    return style && style.display !== 'none' && style.visibility !== 'hidden';
  });
}

export function scrollToElement(el) {
  if (el && el.scrollIntoView) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}
