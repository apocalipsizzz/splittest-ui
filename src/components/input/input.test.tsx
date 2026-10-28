import { useState, type ChangeEvent } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Input } from './input';

describe('Input', () => {
  it('error ставит класс и aria-invalid', () => {
    render(<Input error placeholder="Имя" />);
    const input = screen.getByPlaceholderText('Имя');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveClass('input', 'input--error');
  });

  it('recommended ставит класс', () => {
    render(<Input recommended placeholder="Имя" />);
    expect(screen.getByPlaceholderText('Имя')).toHaveClass(
      'input',
      'input--recommended',
    );
  });

  it('clearable очищает controlled value', async () => {
    const Harness = () => {
      const [value, setValue] = useState('тест');

      return (
        <Input
          clearable
          value={value}
          placeholder="Имя"
          onChange={event => setValue(event.target.value)}
        />
      );
    };

    render(<Harness />);
    await userEvent.click(screen.getByRole('button', { name: 'Очистить' }));

    expect(screen.getByPlaceholderText('Имя')).toHaveValue('');
    expect(
      screen.queryByRole('button', { name: 'Очистить' }),
    ).not.toBeInTheDocument();
  });

  it('пустой и disabled не показывают очистку', () => {
    const { rerender } = render(<Input clearable placeholder="Имя" />);
    expect(
      screen.queryByRole('button', { name: 'Очистить' }),
    ).not.toBeInTheDocument();

    rerender(
      <Input clearable disabled defaultValue="тест" placeholder="Имя" />,
    );
    expect(
      screen.queryByRole('button', { name: 'Очистить' }),
    ).not.toBeInTheDocument();

    rerender(
      <Input clearable readOnly defaultValue="тест" placeholder="Имя" />,
    );
    expect(
      screen.queryByRole('button', { name: 'Очистить' }),
    ).not.toBeInTheDocument();
  });

  it('defaultValue чистится через DOM и возвращается по reset', async () => {
    const onChange = vi.fn<(event: ChangeEvent<HTMLInputElement>) => void>();
    const onClear = vi.fn<() => void>();

    render(
      <form>
        <Input
          clearable
          defaultValue="тест"
          placeholder="Имя"
          onChange={onChange}
          onClear={onClear}
        />
        <button type="reset">Сброс</button>
      </form>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Очистить' }));

    const input = screen.getByPlaceholderText('Имя');
    expect(input).toHaveValue('');
    expect(onClear).toHaveBeenCalledOnce();
    expect(onChange.mock.calls[0]?.[0].target.value).toBe('');
    expect(
      screen.queryByRole('button', { name: 'Очистить' }),
    ).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Сброс' }));

    expect(input).toHaveValue('тест');
    expect(
      screen.getByRole('button', { name: 'Очистить' }),
    ).toBeInTheDocument();
  });

  it('size ставит модификатор, md — без класса, нативный size не уезжает в DOM', () => {
    const { rerender } = render(<Input size="sm" placeholder="Имя" />);
    expect(screen.getByPlaceholderText('Имя')).toHaveClass(
      'input',
      'input--sm',
    );
    expect(screen.getByPlaceholderText('Имя')).not.toHaveAttribute('size');

    rerender(<Input size="md" placeholder="Имя" />);
    expect(screen.getByPlaceholderText('Имя')).not.toHaveClass('input--md');

    rerender(<Input size="lg" placeholder="Имя" />);
    expect(screen.getByPlaceholderText('Имя')).toHaveClass('input--lg');
  });
});
