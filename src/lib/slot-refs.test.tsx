import { render } from '@testing-library/react';
import { createRef, type ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Slot } from './slot';

describe('Slot: слияние рефов', () => {
  it('отдаёт узел и рефу слота, и рефу ребёнка', () => {
    const slotRef = createRef<HTMLButtonElement>();
    const childRef = createRef<HTMLButtonElement>();
    render(
      <Slot ref={slotRef}>
        <button type="button" ref={childRef}>
          Кнопка
        </button>
      </Slot>,
    );

    expect(slotRef.current).toBe(childRef.current);
    expect(childRef.current?.tagName).toBe('BUTTON');
  });

  it('вызывает callback-рефы и их cleanup при размонтировании', () => {
    const cleanup = vi.fn<() => void>();
    const slotCallback = vi.fn<() => () => void>(() => cleanup);
    const childCallback = vi.fn<(node: HTMLElement | null) => void>();

    const { unmount } = render(
      <Slot ref={slotCallback}>
        <button type="button" ref={childCallback}>
          Кнопка
        </button>
      </Slot>,
    );

    expect(slotCallback).toHaveBeenCalledWith(expect.any(HTMLButtonElement));
    expect(childCallback).toHaveBeenCalledWith(expect.any(HTMLButtonElement));

    unmount();
    expect(cleanup).toHaveBeenCalled();
    expect(childCallback).toHaveBeenLastCalledWith(null);
  });

  it('без cleanup в callback-рефе обнуляет ref при размонтировании', () => {
    const slotCallback = vi.fn<(node: HTMLElement | null) => void>();
    const { unmount } = render(
      <Slot ref={slotCallback}>
        <button type="button">Кнопка</button>
      </Slot>,
    );

    unmount();
    expect(slotCallback).toHaveBeenLastCalledWith(null);
  });

  it('бросает ошибку, если ребёнок не один React-элемент', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const bad = (
      <Slot>{'текст' as unknown as ReactNode as React.ReactElement}</Slot>
    );

    expect(() => render(bad)).toThrow('Slot ждёт ровно один React-элемент.');
    spy.mockRestore();
  });
});
