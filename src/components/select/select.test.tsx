import { createRef, useState } from 'react';
import { act, render, screen } from '@testing-library/react';
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

  it('подряд идущие буквы ищут префикс', async () => {
    render(
      <Select
        options={[
          { value: 'msk', label: 'Москва' },
          { value: 'muc', label: 'Мюнхен' },
          { value: 'spb', label: 'Санкт-Петербург' },
        ]}
      />,
    );

    trigger().focus();
    await userEvent.keyboard('мю');

    expect(screen.getByRole('option', { name: 'Мюнхен' })).toHaveClass(
      'select__option--active',
    );
  });

  it('PageDown и PageUp ходят по странице включённых пунктов', async () => {
    const many = Array.from({ length: 25 }, (_, index) => ({
      value: String(index),
      label: `Пункт ${index + 1}`,
    }));
    render(<Select options={many} />);

    trigger().focus();
    await userEvent.keyboard('{ArrowDown}{PageDown}');

    expect(screen.getByRole('option', { name: 'Пункт 11' })).toHaveClass(
      'select__option--active',
    );

    await userEvent.keyboard('{PageUp}');

    expect(screen.getByRole('option', { name: 'Пункт 1' })).toHaveClass(
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

  it('пустой список показывает emptyText', async () => {
    const { rerender } = render(<Select options={[]} />);
    await userEvent.click(trigger());
    expect(screen.getByText('Нет вариантов')).toBeInTheDocument();

    rerender(<Select options={[]} emptyText="Пусто" />);
    expect(screen.getByText('Пусто')).toBeInTheDocument();
  });

  it('отдаёт ref и атрибуты корня, id остаётся на кнопке', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Select
        ref={ref}
        id="city"
        options={OPTIONS}
        data-testid="select"
        aria-label="Город"
      />,
    );

    const root = screen.getByTestId('select');
    expect(root).toHaveClass('select');
    expect(root).toHaveAttribute('aria-label', 'Город');
    expect(root).not.toHaveAttribute('id');
    expect(screen.getByRole('combobox')).toHaveAttribute('id', 'city');
    expect(ref.current).toBe(root);
  });

  it('onOpenChange сообщает про открытие и закрытие', async () => {
    const onOpenChange = vi.fn<(open: boolean) => void>();
    const user = userEvent.setup();
    render(<Select options={OPTIONS} onOpenChange={onOpenChange} />);

    await user.click(screen.getByRole('combobox'));
    expect(onOpenChange).toHaveBeenLastCalledWith(true);

    await user.click(await screen.findByRole('option', { name: /Москва/ }));
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it('renderValue рисует выбранное значение на кнопке, список остаётся по label', async () => {
    const user = userEvent.setup();
    render(
      <Select
        options={OPTIONS}
        value="msk"
        renderValue={option => <span>город: {option.label}</span>}
      />,
    );

    expect(trigger()).toHaveTextContent('город: Москва');

    await user.click(trigger());

    expect(
      await screen.findByRole('option', { name: 'Москва' }),
    ).toBeInTheDocument();
  });

  it('renderOption рисует свою разметку, поиск остаётся по label', async () => {
    const user = userEvent.setup();
    render(
      <Select
        options={OPTIONS}
        renderOption={option => (
          <span>
            {option.label} <small>({option.value})</small>
          </span>
        )}
      />,
    );

    await user.click(screen.getByRole('combobox'));

    expect(
      await screen.findByRole('option', { name: 'Москва (msk)' }),
    ).toBeInTheDocument();
  });

  it('data-state и data-* пунктов видны снаружи', async () => {
    const user = userEvent.setup();
    const { container } = render(<Select options={OPTIONS} />);

    const combobox = screen.getByRole('combobox');
    expect(container.firstElementChild).toHaveAttribute('data-state', 'closed');

    await user.click(combobox);

    expect(container.firstElementChild).toHaveAttribute('data-state', 'open');
    expect(combobox).toHaveAttribute('data-state', 'open');

    const options = await screen.findAllByRole('option');
    expect(options[0]).toHaveAttribute('data-highlighted', 'true');
    expect(options[2]).toHaveAttribute('data-disabled', 'true');
  });

  it('синтетический click выбирает пункт: mousedown не единственный путь', async () => {
    const onChange = vi.fn<(value: string) => void>();
    const user = userEvent.setup();
    render(<Select options={OPTIONS} onChange={onChange} />);

    await user.click(screen.getByRole('combobox'));
    const option = await screen.findByRole('option', {
      name: /Санкт-Петербург/,
    });

    // Так активируют элемент скринридеры на телефоне и программный .click()
    act(() => {
      (option as HTMLElement).click();
    });

    expect(onChange).toHaveBeenCalledWith('spb');
  });

  it('свой id важнее id поля', () => {
    render(
      <Field label="Город">
        <Select id="city" options={OPTIONS} />
      </Field>,
    );

    expect(screen.getByRole('combobox')).toHaveAttribute('id', 'city');
  });
});
