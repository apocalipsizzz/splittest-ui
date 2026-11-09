import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';

import { Field } from '@/components/field';

import { SelectSearch } from './select-search';

const CITIES = [
  { value: 'msk', label: 'Москва' },
  { value: 'spb', label: 'Санкт-Петербург' },
  { value: 'kzn', label: 'Казань' },
];

const Controlled = ({ initial = null as string | null }) => {
  const [value, setValue] = useState<string | null>(initial);
  return (
    <Field label="Город">
      <SelectSearch options={CITIES} value={value} onChange={setValue} />
    </Field>
  );
};

const input = () => screen.getByRole('combobox', { name: 'Город' });

describe('SelectSearch: открытие с клавиатуры в закрытом состоянии', () => {
  it('стрелка вниз открывает список', async () => {
    const user = userEvent.setup();
    render(<Controlled />);

    input().focus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('печатная буква открывает список с этим фильтром', async () => {
    const user = userEvent.setup();
    render(<Controlled />);

    input().focus();
    await user.keyboard('з');
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Казань' })).toBeInTheDocument();
    expect(
      screen.queryByRole('option', { name: 'Москва' }),
    ).not.toBeInTheDocument();
  });

  it('вставка текста открывает список с этим фильтром', () => {
    render(<Controlled />);

    fireEvent.paste(input(), {
      clipboardData: { getData: () => 'санкт' },
    });
    expect(
      screen.getByRole('option', { name: 'Санкт-Петербург' }),
    ).toBeInTheDocument();
  });

  it('Backspace открывает список без фильтра', async () => {
    const user = userEvent.setup();
    render(<Controlled />);

    input().focus();
    await user.keyboard('{Backspace}');
    expect(screen.getAllByRole('option')).toHaveLength(CITIES.length);
  });
});

describe('SelectSearch: выбранное значение в поле', () => {
  it('Escape на закрытом списке оставляет выбранную подпись в поле', async () => {
    const user = userEvent.setup();
    render(<Controlled initial="msk" />);

    expect(input()).toHaveValue('Москва');
    await user.click(input());
    await user.keyboard('{Escape}');
    expect(input()).toHaveValue('Москва');
  });
});
