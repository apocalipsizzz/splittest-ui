import { useCallback, useSyncExternalStore } from 'react';

const getServerSnapshot = () => false;

const mediaLists = new Map<string, MediaQueryList>();
let activeMatchMedia: typeof window.matchMedia | undefined;

/**
 * Один MediaQueryList на строку запроса, без вытеснения.
 * `.matches` читается на каждом снимке.
 * `query` обязан быть статическим: шаблон от значения из state
 * оставит живой список на каждую строку.
 */
const getMediaList = (query: string) => {
  if (typeof window.matchMedia !== 'function') return null;

  // Тесты подменяют window.matchMedia целиком. Списки прошлой реализации мертвы.
  if (activeMatchMedia !== window.matchMedia) {
    mediaLists.clear();
    activeMatchMedia = window.matchMedia;
  }

  const cached = mediaLists.get(query);
  if (cached) return cached;

  const list = window.matchMedia(query);
  mediaLists.set(query, list);
  return list;
};

/**
 * matchMedia без рассинхрона гидрации.
 * Сервер и первый проход гидрации получают `false`.
 * В клиентском приложении без SSR первое значение сразу настоящее.
 * `query` обязан быть статическим: кеш `MediaQueryList` не вытесняется.
 */
export const useMediaQuery = (query: string) => {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const media = getMediaList(query);
      if (!media) return () => {};

      media.addEventListener('change', onChange);
      return () => media.removeEventListener('change', onChange);
    },
    [query],
  );

  const getSnapshot = useCallback(
    () => getMediaList(query)?.matches ?? false,
    [query],
  );

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
};
