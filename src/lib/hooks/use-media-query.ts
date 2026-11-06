import { useCallback, useSyncExternalStore } from 'react';

const getServerSnapshot = () => false;

/**
 * matchMedia без рассинхрона гидрации.
 * Сервер и первый проход гидрации получают `false`.
 * В клиентском приложении без SSR первое значение сразу настоящее.
 */
export const useMediaQuery = (query: string) => {
  const subscribe = useCallback(
    (onChange: () => void) => {
      if (typeof window.matchMedia !== 'function') return () => {};

      const media = window.matchMedia(query);
      media.addEventListener('change', onChange);
      return () => media.removeEventListener('change', onChange);
    },
    [query],
  );

  const getSnapshot = useCallback(
    () =>
      typeof window.matchMedia === 'function' &&
      window.matchMedia(query).matches,
    [query],
  );

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
};
