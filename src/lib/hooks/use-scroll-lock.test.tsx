import { render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useScrollLock } from './use-scroll-lock';

const Probe = ({ locked }: { locked: boolean }) => {
  useScrollLock(locked);
  return null;
};

const LockPair = ({ outer, inner }: { outer: boolean; inner: boolean }) => (
  <>
    <Probe locked={outer} />
    <Probe locked={inner} />
  </>
);

describe('useScrollLock', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('фиксирует body и возвращает прежние стили после снятия', () => {
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    Object.defineProperty(window, 'scrollY', {
      value: 80,
      configurable: true,
    });

    const { rerender } = render(<Probe locked />);

    expect(document.body.style.overflow).toBe('hidden');
    expect(document.body.style.position).toBe('fixed');
    expect(document.body.style.top).toBe('-80px');
    expect(document.body.style.width).toBe('100%');

    rerender(<Probe locked={false} />);

    expect(document.body.style.overflow).toBe('');
    expect(document.body.style.position).toBe('');
    expect(document.body.style.top).toBe('');
    expect(document.body.style.width).toBe('');
    expect(window.scrollTo).toHaveBeenCalledWith(0, 80);
  });

  it('держит лок, пока не закрылся последний потребитель', () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    const { rerender } = render(<LockPair outer inner />);

    rerender(<LockPair outer inner={false} />);

    expect(document.body.style.position).toBe('fixed');
    expect(document.body.style.overflow).toBe('hidden');
    expect(scrollTo).not.toHaveBeenCalled();

    rerender(<LockPair outer={false} inner={false} />);

    expect(document.body.style.position).toBe('');
    expect(document.body.style.overflow).toBe('');
    expect(scrollTo).toHaveBeenCalledOnce();
  });

  it('снятие внешнего лока не открывает скролл, пока внутренний открыт', () => {
    const { rerender } = render(<LockPair outer inner />);

    rerender(<LockPair outer={false} inner />);

    expect(document.body.style.position).toBe('fixed');
    expect(document.body.style.overflow).toBe('hidden');

    rerender(<LockPair outer={false} inner={false} />);
    expect(document.body.style.position).toBe('');
  });
});
