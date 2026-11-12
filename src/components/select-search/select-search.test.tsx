import { createRef, useState } from 'react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Field } from '@/components/field';
import { Form, FormSubmit } from '@/components/form';
import { Popover } from '@/components/popover';
import { SelectSearch, type SelectSearchOption } from './select-search';

const OPTIONS: SelectSearchOption[] = [
  { value: 'msk', label: 'Москва' },
  { value: 'spb', label: 'Санкт-Петербург' },
  { value: 'kzn', label: 'Казань', disabled: true },
  { value: 'more', label: 'Ещё' },
  { value: 'tbank', label: 'Т-Банк', keywords: ['Тинькофф'] },
];

const combobox = () => screen.getByRole('combobox');
const optionLabels = () =>
  screen.getAllByRole('option').map(node => node.textContent);

describe('SelectSearch', () => {
  it('закрытым показывает подпись и открывает список по клику', async () => {
    render(<SelectSearch options={OPTIONS} value="msk" onChange={() => {}} />);

    expect(combobox()).toHaveValue('Москва');
    expect(screen.queryByRole('listbox')).toBeNull();

    await userEvent.click(combobox());

    expect(combobox()).toHaveValue('');
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(optionLabels()).toEqual([
      'Москва',
      'Санкт-Петербург',
      'Казань',
      'Ещё',
      'Т-Банк',
    ]);
  });

  it('фильтрует по подстроке, ё и keywords', async () => {
    render(<SelectSearch options={OPTIONS} />);

    await userEvent.click(combobox());
    await userEvent.type(combobox(), 'петер');
    expect(optionLabels()).toEqual(['Санкт-Петербург']);

    await userEvent.clear(combobox());
    await userEvent.type(combobox(), 'еще');
    expect(optionLabels()).toEqual(['Ещё']);

    await userEvent.clear(combobox());
    await userEvent.type(combobox(), 'тинь');
    expect(optionLabels()).toEqual(['Т-Банк']);
  });

  it('находит пункт, набранный в английской раскладке', async () => {
    render(<SelectSearch options={OPTIONS} />);

    await userEvent.click(combobox());
    await userEvent.type(combobox(), 'Vjcr');

    expect(optionLabels()).toEqual(['Москва']);
  });

  it('клик и Enter отдают value, Escape закрывает без выбора', async () => {
    const onChange = vi.fn<(value: string) => void>();
    render(<SelectSearch options={OPTIONS} onChange={onChange} />);

    await userEvent.click(combobox());
    await userEvent.click(screen.getByRole('option', { name: 'Москва' }));

    expect(onChange).toHaveBeenCalledExactlyOnceWith('msk');
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(combobox()).toHaveValue('Москва');

    await userEvent.click(combobox());
    await userEvent.type(combobox(), 'петер');
    await userEvent.keyboard('{Enter}');

    expect(onChange).toHaveBeenLastCalledWith('spb');
    expect(combobox()).toHaveValue('Санкт-Петербург');

    await userEvent.click(combobox());
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it('не выбирает disabled и пропускает его стрелками', async () => {
    const onChange = vi.fn<(value: string) => void>();
    render(<SelectSearch options={OPTIONS} value="spb" onChange={onChange} />);

    await userEvent.click(combobox());
    await userEvent.click(screen.getByRole('option', { name: 'Казань' }));
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    combobox().focus();
    await userEvent.keyboard('{ArrowDown}{Enter}');

    expect(onChange).toHaveBeenCalledExactlyOnceWith('more');
  });

  it('печатает с закрытого поля и сразу фильтрует', async () => {
    render(<SelectSearch options={OPTIONS} placeholder="Город" />);

    combobox().focus();
    await userEvent.keyboard('м');

    expect(combobox()).toHaveValue('м');
    expect(optionLabels()).toEqual(['Москва']);
  });

  it('сообщает число найденных вариантов', async () => {
    render(<SelectSearch options={OPTIONS} />);

    await userEvent.click(combobox());
    expect(screen.queryByText(/Найдено/)).not.toBeInTheDocument();

    await userEvent.type(combobox(), 'петер');
    expect(screen.getByText('Найдено 1 вариант')).toBeInTheDocument();

    await userEvent.clear(combobox());
    await userEvent.type(combobox(), 'рим');
    expect(screen.getByText('Найдено 0 вариантов')).toBeInTheDocument();
  });

  it('required при открытом списке не пускает requestSubmit', async () => {
    const onSubmit = vi.fn<(data: FormData) => void>();
    render(
      <Form onSubmit={onSubmit}>
        <Field label="Город" required>
          <SelectSearch name="city" options={OPTIONS} />
        </Field>
        <FormSubmit>Отправить</FormSubmit>
      </Form>,
    );

    const box = screen.getByLabelText('Город');
    await userEvent.click(box);
    await userEvent.type(box, 'мос');

    // Клик по кнопке сначала блюрит поле и закрывает список. Дырка — только
    // requestSubmit, пока в поиске ещё текст запроса, а выбор пустой.
    expect(box).toHaveValue('мос');
    expect(box).not.toHaveAttribute('required');
    expect(box).toHaveAttribute('aria-required', 'true');
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    const valueInput = document.querySelector('input[name="city"]');
    expect(valueInput).toHaveValue('');
    expect(valueInput).toBeRequired();
    expect(valueInput).not.toHaveAttribute('type', 'hidden');

    const form = document.querySelector('form');
    expect(form?.checkValidity()).toBe(false);

    act(() => {
      form?.requestSubmit();
    });

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Поле «Город» обязательно',
    );
  });

  it('requestSubmit при открытом поиске отправляет выбранное, не запрос', async () => {
    const onSubmit = vi.fn<(data: FormData) => void>();
    render(
      <Form onSubmit={onSubmit}>
        <Field label="Город" required>
          <SelectSearch name="city" options={OPTIONS} defaultValue="msk" />
        </Field>
        <FormSubmit>Отправить</FormSubmit>
      </Form>,
    );

    const box = screen.getByLabelText('Город');
    await userEvent.click(box);
    await userEvent.type(box, 'петер');
    expect(box).toHaveValue('петер');
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    act(() => {
      document.querySelector('form')?.requestSubmit();
    });

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onSubmit.mock.calls[0]?.[0].getAll('city')).toEqual(['msk']);
  });

  it('показывает пустой результат', async () => {
    render(<SelectSearch options={OPTIONS} emptyText="Нет совпадений" />);

    await userEvent.click(combobox());
    await userEvent.type(combobox(), 'рим');

    expect(screen.queryByRole('option')).toBeNull();
    expect(screen.getByText('Нет совпадений')).toBeInTheDocument();
  });

  it('внутри Field отдаёт value в FormData по name', async () => {
    const onSubmit = vi.fn<(data: FormData) => void>();
    const Harness = () => {
      const [city, setCity] = useState<string | null>(null);
      return (
        <Form onSubmit={onSubmit}>
          <Field label="Город" required>
            <SelectSearch
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
        <SelectSearch options={OPTIONS} />
      </Popover>,
    );

    await userEvent.click(combobox());
    await userEvent.click(screen.getByRole('option', { name: 'Москва' }));

    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('отдаёт ref и атрибуты корня, id остаётся на поле', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <SelectSearch
        ref={ref}
        id="city"
        options={OPTIONS}
        data-testid="select"
      />,
    );

    const root = screen.getByTestId('select');
    expect(root).toHaveClass('select');
    expect(root).not.toHaveAttribute('id');
    expect(screen.getByRole('combobox')).toHaveAttribute('id', 'city');
    expect(ref.current).toBe(root);
  });

  it('свой id важнее id поля', () => {
    render(
      <Field label="Город">
        <SelectSearch id="city" options={OPTIONS} />
      </Field>,
    );

    expect(screen.getByRole('combobox')).toHaveAttribute('id', 'city');
  });
});
