import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export const generateTitleFromText = (text, maxLength = 50) => {
  if (!text || typeof text !== 'string') return "Untitled Infographic";
  const cleanedText = text.replace(/\s+/g, ' ').trim();
  if (cleanedText.length <= maxLength) return cleanedText;
  
  let truncated = cleanedText.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace > 0) {
    truncated = truncated.substring(0, lastSpace);
  }
  return truncated + "...";
};

export const loadGoogleFont = (fontFamily) => {
  if (!fontFamily || typeof document === 'undefined') return;

  const fontId = `google-font-${fontFamily.replace(/\s+/g, '-')}`;
  if (document.getElementById(fontId)) {
    return; // Font already loaded or requested
  }

  const link = document.createElement('link');
  link.id = fontId;
  link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/\s+/g, '+')}:wght@300;400;500;600;700&display=swap`;
  link.rel = 'stylesheet';
  
  document.head.appendChild(link);
};