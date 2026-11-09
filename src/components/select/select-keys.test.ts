import type { KeyboardEvent } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { handleListKeyDown, type SelectOption } from './select-option';

const OPTIONS: SelectOption[] = [
  { value: 'a', label: 'А' },
  { value: 'b', label: 'Б', disabled: true },
  { value: 'c', label: 'В' },
  { value: 'd', label: 'Г' },
  { value: 'e', label: 'Д' },
];

const press = (key: string) =>
  new KeyboardEvent('keydown', { key, cancelable: true });

const run = (key: string, highlighted: number) => {
  const onHighlight = vi.fn<(index: number) => void>();
  const onSelect = vi.fn<(option: SelectOption) => void>();
  const onClose = vi.fn<() => void>();
  const event = press(key);
  const handled = handleListKeyDown(
    event as unknown as KeyboardEvent<Element>,
    OPTIONS,
    highlighted,
    onHighlight,
    onSelect,
    onClose,
  );
  return { handled, event, onHighlight, onSelect, onClose };
};

describe('handleListKeyDown', () => {
  it('стрелки двигают подсветку мимо отключённых пунктов', () => {
    const down = run('ArrowDown', 0);
    expect(down.handled).toBe(true);
    expect(down.event.defaultPrevented).toBe(true);
    expect(down.onHighlight).toHaveBeenCalledWith(2);

    expect(run('ArrowUp', 2).onHighlight).toHaveBeenCalledWith(0);
  });

  it('Home и End прыгают к первому и последнему доступному пункту', () => {
    expect(run('Home', 4).onHighlight).toHaveBeenCalledWith(0);
    expect(run('End', 0).onHighlight).toHaveBeenCalledWith(4);
  });

  it('PageDown и PageUp сдвигают подсветку на шаг страницы', () => {
    expect(run('PageDown', 0).onHighlight).toHaveBeenCalledWith(4);
    expect(run('PageUp', 4).onHighlight).toHaveBeenCalledWith(0);
  });

  it('Enter выбирает подсвеченный пункт и закрывает список', () => {
    const { handled, onSelect, onClose } = run('Enter', 2);
    expect(handled).toBe(true);
    expect(onSelect).toHaveBeenCalledWith(OPTIONS[2]);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('Escape закрывает список', () => {
    const { handled, onClose, onSelect } = run('Escape', 0);
    expect(handled).toBe(true);
    expect(onClose).toHaveBeenCalledOnce();
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('остальные клавиши не обрабатывает', () => {
    const { handled, onHighlight } = run('q', 0);
    expect(handled).toBe(false);
    expect(onHighlight).not.toHaveBeenCalled();
  });
});
