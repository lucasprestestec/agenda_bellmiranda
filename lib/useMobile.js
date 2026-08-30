'use client';

import { useEffect, useState } from 'react';

export function useMobile(bp = 860) {
  const query = `(max-width:${bp}px)`;
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatches(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}
