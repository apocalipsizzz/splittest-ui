import { useEffect } from 'react';

interface ScrollSnapshot {
  overflow: string;
  position: string;
  top: string;
  width: string;
  scrollY: number;
}

// Один владелец на document.body. Вложенные листы только увеличивают счётчик:
// стили снимаются, когда закрылся последний. Иначе внутренний восстановит
// инлайн, записанный внешним, и страница поедет под ещё открытым листом.
let locks = 0;
let snapshot: ScrollSnapshot | null = null;

const lockBodyScroll = () => {
  if (locks === 0) {
    const { style } = document.body;
    const scrollY = window.scrollY;

    snapshot = {
      overflow: style.overflow,
      position: style.position,
      top: style.top,
      width: style.width,
      scrollY,
    };

    // overflow прячет скролл на десктопе. position: fixed держит фон на iOS,
    // где overflow: hidden страницу не останавливает.
    style.overflow = 'hidden';
    style.position = 'fixed';
    style.top = `-${scrollY}px`;
    style.width = '100%';
  }

  locks += 1;

  return () => {
    locks -= 1;
    if (locks > 0 || !snapshot) return;

    const previous = snapshot;
    snapshot = null;
    const { style } = document.body;
    style.overflow = previous.overflow;
    style.position = previous.position;
    style.top = previous.top;
    style.width = previous.width;
    window.scrollTo(0, previous.scrollY);
  };
};

/** Блокирует скролл страницы, пока `locked`. Вложенные вызовы делят один лок. */
export const useScrollLock = (locked: boolean) => {
  useEffect(() => {
    if (!locked) return;
    return lockBodyScroll();
  }, [locked]);
};
