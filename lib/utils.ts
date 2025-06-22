import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { customAlphabet } from "nanoid";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Generate short CUID-like IDs
export const generateCuid = (length = 10) => {
  const alphabet = "0123456789abcdefghijklmnopqrstuvwxyz";
  const nanoid = customAlphabet(alphabet, length);
  return nanoid();
};

// Date formatting helper
export const cn2 = (...classes: string[]) => {
  return classes.filter(Boolean).join(" ");
};


export function generateGuestFingerprint(): string {
  // In a real implementation, you'd use a more sophisticated fingerprinting method
  // This is a simplified version for demonstration
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx!.textBaseline = 'top';
  ctx!.font = '14px Arial';
  ctx!.fillText('Guest fingerprint', 2, 2);
  
  const canvasData = canvas.toDataURL();
  const screenFingerprint = `${screen.width}x${screen.height}x${screen.colorDepth}`;
  const timezoneOffset = new Date().getTimezoneOffset();
  const language = navigator.language;
  
  // Simple hash function (use a proper hash in production)
  let hash = 0;
  const str = canvasData + screenFingerprint + timezoneOffset + language;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return Math.abs(hash).toString(36) + Date.now().toString(36);
}

export function isVotingActive(room: { isActive: boolean; votingDeadline: Date }): boolean {
  const now = new Date();
  return room.isActive && now < room.votingDeadline;
}

export function formatTimeRemaining(deadline: Date): string {
  const now = new Date();
  const diff = deadline.getTime() - now.getTime();
  
  if (diff <= 0) return "Voting closed";
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) return `${days}d ${hours}h remaining`;
  if (hours > 0) return `${hours}h ${minutes}m remaining`;
  return `${minutes}m remaining`;
}
