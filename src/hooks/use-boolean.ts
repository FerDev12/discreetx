import { useState } from 'react';

type setBool = {
  on: () => void;
  off: () => void;
  toggle: () => void;
};

type Bool = [boolean, setBool];

export function useBoolean(): Bool {
  const [isTrue, setIsTrue] = useState(false);

  const on = () => setIsTrue(true);
  const off = () => setIsTrue(false);
  const toggle = () => setIsTrue((isTrue) => !isTrue);

  const set = {
    on,
    off,
    toggle,
  };

  return [isTrue, set];
}
