import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { WheelColumn, type WheelItem } from './wheel-column';

const ITEMS: WheelItem[] = Array.from({ length: 30 }, (_, i) => ({
  value: i + 1,
  label: String(i + 1).padStart(2, '0'),
}));

const wheel = () => screen.getByRole('spinbutton', { name: 'День' });

describe('WheelColumn', () => {
  it('описывает текущее значение для скринридера', () => {
    render(
      <WheelColumn label="День" items={ITEMS} value={7} onChange={() => {}} />,
    );

    expect(wheel()).toHaveAttribute('aria-valuemin', '1');
    expect(wheel()).toHaveAttribute('aria-valuemax', '30');
    expect(wheel()).toHaveAttribute('aria-valuenow', '7');
    expect(wheel()).toHaveAttribute('aria-valuetext', '07');
  });

  it('стрелки сдвигают значение на один пункт', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<(value: number) => void>();
    render(
      <WheelColumn label="День" items={ITEMS} value={7} onChange={onChange} />,
    );

    wheel().focus();
    await user.keyboard('{ArrowDown}');
    expect(onChange).toHaveBeenLastCalledWith(8);

    await user.keyboard('{ArrowUp}');
    expect(onChange).toHaveBeenLastCalledWith(6);
  });

  it('PageUp, PageDown, Home и End прыгают и не выходят за границы', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<(value: number) => void>();
    render(
      <WheelColumn label="День" items={ITEMS} value={7} onChange={onChange} />,
    );

    wheel().focus();
    await user.keyboard('{PageDown}');
    expect(onChange).toHaveBeenLastCalledWith(12);

    await user.keyboard('{PageUp}');
    expect(onChange).toHaveBeenLastCalledWith(2);

    await user.keyboard('{End}');
    expect(onChange).toHaveBeenLastCalledWith(30);

    await user.keyboard('{Home}');
    expect(onChange).toHaveBeenLastCalledWith(1);
  });

  it('не вызывает onChange, если граница уже достигнута или клавиша чужая', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<(value: number) => void>();
    render(
      <WheelColumn label="День" items={ITEMS} value={1} onChange={onChange} />,
    );

    wheel().focus();
    await user.keyboard('{ArrowUp}');
    await user.keyboard('a');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('клик по пункту выбирает его', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<(value: number) => void>();
    render(
      <WheelColumn label="День" items={ITEMS} value={7} onChange={onChange} />,
    );

    await user.click(screen.getByRole('button', { name: '15' }));
    expect(onChange).toHaveBeenCalledWith(15);
  });

  it('клик по уже выбранному пункту не эмитит change', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<(value: number) => void>();
    render(
      <WheelColumn label="День" items={ITEMS} value={7} onChange={onChange} />,
    );

    await user.click(screen.getByRole('button', { name: '07' }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('прокрутка выбирает пункт посередине окна после остановки', async () => {
    vi.useFakeTimers();
    try {
      const onChange = vi.fn<(value: number) => void>();
      render(
        <WheelColumn
          label="День"
          items={ITEMS}
          value={1}
          onChange={onChange}
        />,
      );

      const list = wheel();
      list.scrollTop = 40 * 4;
      fireEvent.scroll(list);
      await vi.runOnlyPendingTimersAsync();

      expect(onChange).toHaveBeenLastCalledWith(5);
    } finally {
      vi.useRealTimers();
    }
  });

  it('докручивает колесо при внешнем изменении value', () => {
    const Controlled = () => {
      const [value, setValue] = useState(1);
      return (
        <>
          <WheelColumn
            label="День"
            items={ITEMS}
            value={value}
            onChange={setValue}
          />
          <button type="button" onClick={() => setValue(20)}>
            Двадцатое
          </button>
        </>
      );
    };
    render(<Controlled />);

    fireEvent.click(screen.getByRole('button', { name: 'Двадцатое' }));
    expect(wheel()).toHaveAttribute('aria-valuenow', '20');
  });
});
