import confetti from 'canvas-confetti';

export function triggerConfetti() {
  try {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6']
    });
  } catch (e) {
    console.log('Confetti not available:', e);
  }
}

export default function Confetti() {
  return null;
}
