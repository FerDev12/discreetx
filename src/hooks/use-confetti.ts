import JSConfetti from 'js-confetti';
import { useEffect, useState } from 'react';

export function useConfeti() {
  const [confetti, setConfetti] = useState<JSConfetti | null>(null);

  useEffect(() => {
    if (confetti) return;
    setConfetti(new JSConfetti());
  }, [confetti]);

  return { confetti };
}
