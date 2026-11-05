import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Field } from '@/components/field';
import { Form, FormSubmit } from '@/components/form';
import { Popover } from '@/components/popover';
import { Select, type SelectOption } from './select';

const OPTIONS: SelectOption[] = [
  { value: 'msk', label: 'Москва' },
  { value: 'spb', label: 'Санкт-Петербург' },
  { value: 'kzn', label: 'Казань', disabled: true },
  { value: 'more', label: 'Ещё' },
];

const trigger = () => screen.getByRole('combobox');
const optionLabels = () =>
  screen.getAllByRole('option').map(node => node.textContent);

describe('Select', () => {
  it('кнопка показывает подпись и открывает список', async () => {
    render(
      <Select
        options={OPTIONS}
        placeholder="Город"
        value="msk"
        onChange={() => {}}
      />,
    );

    expect(trigger().tagName).toBe('BUTTON');
    expect(trigger()).toHaveTextContent('Москва');

    await userEvent.click(trigger());

    expect(optionLabels()).toEqual([
      'Москва',
      'Санкт-Петербург',
      'Казань',
      'Ещё',
    ]);
    expect(screen.getByRole('option', { name: 'Москва' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  it('клик и Enter отдают value, Escape закрывает без выбора', async () => {
    const onChange = vi.fn<(value: string) => void>();
    render(<Select options={OPTIONS} onChange={onChange} />);

    await userEvent.click(trigger());
    await userEvent.click(screen.getByRole('option', { name: 'Москва' }));

    expect(onChange).toHaveBeenCalledExactlyOnceWith('msk');
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(trigger()).toHaveTextContent('Москва');

    await userEvent.click(trigger());
    await userEvent.keyboard('{ArrowDown}{Enter}');

    expect(onChange).toHaveBeenLastCalledWith('spb');
    expect(trigger()).toHaveTextContent('Санкт-Петербург');

    await userEvent.click(trigger());
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it('не выбирает disabled и пропускает его стрелками', async () => {
    const onChange = vi.fn<(value: string) => void>();
    render(<Select options={OPTIONS} value="spb" onChange={onChange} />);

    await userEvent.click(trigger());
    await userEvent.click(screen.getByRole('option', { name: 'Казань' }));
    expect(onChange).not.toHaveBeenCalled();

    trigger().focus();
    await userEvent.keyboard('{ArrowDown}{Enter}');

    expect(onChange).toHaveBeenCalledExactlyOnceWith('more');
  });

  it('буква прыгает к пункту с этой буквы', async () => {
    render(<Select options={OPTIONS} placeholder="Город" />);

    trigger().focus();
    await userEvent.keyboard('е');

    expect(screen.getByRole('option', { name: 'Ещё' })).toHaveClass(
      'select__option--active',
    );
  });

  it('внутри Field пустой селект блокирует отправку', async () => {
    const onSubmit = vi.fn<(data: FormData) => void>();
    render(
      <Form onSubmit={onSubmit}>
        <Field label="Город" required>
          <Select name="city" options={OPTIONS} />
        </Field>
        <FormSubmit>Отправить</FormSubmit>
      </Form>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Отправить' }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Поле «Город» обязательно',
    );
  });

  it('внутри Field отдаёт value в FormData по name', async () => {
    const onSubmit = vi.fn<(data: FormData) => void>();
    const Harness = () => {
      const [city, setCity] = useState<string | null>(null);
      return (
        <Form onSubmit={onSubmit}>
          <Field label="Город" required>
            <Select
              name="city"
              options={OPTIONS}
              value={city}
              onChange={setCity}
            />
          </Field>
          <FormSubmit>Отправить</FormSubmit>
        </Form>
      );
    };
    render(<Harness />);

    await userEvent.click(screen.getByLabelText('Город'));
    await userEvent.click(screen.getByRole('option', { name: 'Москва' }));
    await userEvent.click(screen.getByRole('button', { name: 'Отправить' }));

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onSubmit.mock.calls[0]?.[0].get('city')).toBe('msk');
  });

  it('клик по списку не закрывает родительский Popover', async () => {
    const onClose = vi.fn<() => void>();
    render(
      <Popover
        open
        trigger={<button type="button">Якорь</button>}
        onClose={onClose}
      >
        <Select options={OPTIONS} />
      </Popover>,
    );

    await userEvent.click(trigger());
    await userEvent.click(screen.getByRole('option', { name: 'Москва' }));

    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
