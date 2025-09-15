// Cursor debugging utilities for development
// Only include this in development builds

export const debugCursor = (label = 'Cursor Position') => {
  if (process.env.NODE_ENV !== 'development') return;
  
  const selection = window.getSelection();
  if (!selection.rangeCount) {
    console.log(`${label}: No selection`);
    return;
  }
  
  const range = selection.getRangeAt(0);
  console.log(`${label}:`, {
    startContainer: range.startContainer,
    startOffset: range.startOffset,
    endContainer: range.endContainer,
    endOffset: range.endOffset,
    collapsed: range.collapsed,
    text: selection.toString()
  });
};

export const trackCursorChanges = (element, name = 'Element') => {
  if (process.env.NODE_ENV !== 'development') return;
  
  let lastPosition = null;
  
  const logPosition = () => {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    
    const range = selection.getRangeAt(0);
    const currentPosition = {
      startOffset: range.startOffset,
      endOffset: range.endOffset,
      collapsed: range.collapsed
    };
    
    if (JSON.stringify(currentPosition) !== JSON.stringify(lastPosition)) {
      console.log(`${name} cursor moved:`, currentPosition);
      lastPosition = currentPosition;
    }
  };
  
  element.addEventListener('selectionchange', logPosition);
  element.addEventListener('input', logPosition);
  element.addEventListener('keyup', logPosition);
  element.addEventListener('click', logPosition);
  
  return () => {
    element.removeEventListener('selectionchange', logPosition);
    element.removeEventListener('input', logPosition);
    element.removeEventListener('keyup', logPosition);
    element.removeEventListener('click', logPosition);
  };
};

export const validateCursorPosition = (element) => {
  if (process.env.NODE_ENV !== 'development') return true;
  
  const selection = window.getSelection();
  if (!selection.rangeCount) return false;
  
  const range = selection.getRangeAt(0);
  const isValid = element.contains(range.commonAncestorContainer);
  
  if (!isValid) {
    console.warn('Invalid cursor position detected - cursor is outside the target element');
  }
  
  return isValid;
};