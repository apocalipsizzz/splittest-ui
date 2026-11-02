import { useEffect, useState } from 'react';

/**
 * Подписка на matchMedia. Первое значение берётся сразу, без `undefined`:
 * иначе первый рендер уходит с другим вариантом (например, rows у TextArea).
 */
export const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches,
  );

  useEffect(() => {
    const media = window.matchMedia(query);
    const handleChange = () => setMatches(media.matches);

    handleChange();
    media.addEventListener('change', handleChange);

    return () => media.removeEventListener('change', handleChange);
  }, [query]);

  return matches;
};
