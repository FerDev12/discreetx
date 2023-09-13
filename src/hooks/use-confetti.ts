import JSConfetti from 'js-confetti';
import { useEffect, useRef } from 'react';

export function useConfeti() {
  const confettiRef = useRef<JSConfetti | null>(null);
  useEffect(() => {
    if (confettiRef.current) return;
    const confetti = new JSConfetti();
    confettiRef.current = confetti;
  }, []);

  const play = () => confettiRef.current?.addConfetti();

  return {
    confetti: {
      play,
    },
  };
}
