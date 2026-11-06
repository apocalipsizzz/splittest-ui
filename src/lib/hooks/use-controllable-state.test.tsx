import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { useControllableState } from './use-controllable-state';

const Probe = ({
  value,
  onChange,
}: {
  value?: string;
  onChange?: (next: string) => void;
}) => {
  const [current, setCurrent] = useControllableState(value, 'a', onChange);

  return (
    <button type="button" onClick={() => setCurrent('b')}>
      {current}
    </button>
  );
};

describe('useControllableState', () => {
  it('без value держит состояние сам и зовёт onChange', async () => {
    const onChange = vi.fn<(next: string) => void>();
    const user = userEvent.setup();
    render(<Probe onChange={onChange} />);

    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('a');

    await user.click(button);

    expect(button).toHaveTextContent('b');
    expect(onChange).toHaveBeenCalledWith('b');
  });

  it('с value состояние снаружи: сам не меняется, но сообщает', async () => {
    const onChange = vi.fn<(next: string) => void>();
    const user = userEvent.setup();
    render(<Probe value="a" onChange={onChange} />);

    const button = screen.getByRole('button');
    await user.click(button);

    expect(button).toHaveTextContent('a');
    expect(onChange).toHaveBeenCalledWith('b');
  });

  it('зовёт последний onChange, не тот, что был на первом рендере', async () => {
    const first = vi.fn<(next: string) => void>();
    const second = vi.fn<(next: string) => void>();
    const user = userEvent.setup();
    const { rerender } = render(<Probe onChange={first} />);

    rerender(<Probe onChange={second} />);
    await user.click(screen.getByRole('button'));

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledWith('b');
  });
});
