import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Field } from '@/components/field';
import { Form, FormSubmit } from '@/components/form';
import { BirthdayPicker } from './birthday-picker';
import { WHEEL_ITEM_HEIGHT } from './wheel-column';

const trigger = () => screen.getByRole('textbox');
const wheel = (label: string) =>
  screen.getByRole('spinbutton', { name: label });
const items = (label: string) => within(wheel(label)).getAllByRole('button');

const pick = async (label: string, text: string) => {
  await userEvent.click(within(wheel(label)).getByText(text));
};

describe('BirthdayPicker', () => {
  it('показывает дату текстом и отдаёт ISO в hidden-поле', () => {
    const { container } = render(
      <BirthdayPicker
        name="birth"
        value={new Date(1990, 2, 15)}
        onChange={() => {}}
      />,
    );

    expect(trigger()).toHaveValue('15 марта 1990');
    expect(container.querySelector('input[name="birth"]')).toHaveValue(
      '1990-03-15',
    );
  });

  it('клик по пунктам колёс и «Применить» отдаёт выбранную дату', async () => {
    const onChange = vi.fn<(date: Date) => void>();
    render(<BirthdayPicker onChange={onChange} />);

    await userEvent.click(trigger());
    // Год и месяц first: день не может быть позже максимальной даты по возрасту.
    await pick('Год', '1990');
    await pick('Месяц', 'март');
    await pick('День', '10');
    await userEvent.click(screen.getByRole('button', { name: 'Применить' }));

    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange.mock.calls[0]?.[0]).toEqual(new Date(1990, 2, 10));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('стрелки меняют выбранный пункт колеса', async () => {
    const onChange = vi.fn<(date: Date) => void>();
    render(
      <BirthdayPicker value={new Date(1990, 2, 15)} onChange={onChange} />,
    );

    await userEvent.click(trigger());
    wheel('Месяц').focus();
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.click(screen.getByRole('button', { name: 'Применить' }));

    expect(onChange.mock.calls[0]?.[0]).toEqual(new Date(1990, 3, 15));
  });

  it('прокрутка колеса выбирает пункт посередине после остановки', async () => {
    render(<BirthdayPicker value={new Date(1990, 2, 15)} />);
    await userEvent.click(trigger());

    const node = wheel('День');
    node.scrollTop = 9 * WHEEL_ITEM_HEIGHT;
    fireEvent.scroll(node);

    await waitFor(() => {
      expect(node).toHaveAttribute('aria-valuenow', '10');
    });
  });

  it('минимальный возраст ограничивает список годов', async () => {
    render(<BirthdayPicker minAge={18} />);
    await userEvent.click(trigger());

    const years = items('Год');
    expect(years.at(-1)).toHaveTextContent(
      String(new Date().getFullYear() - 18),
    );
  });

  it('в феврале дней не больше длины месяца', async () => {
    render(<BirthdayPicker />);
    await userEvent.click(trigger());

    await pick('Год', '2001');
    await pick('Месяц', 'январь');
    await pick('День', '31');
    await pick('Месяц', 'февраль');

    expect(items('День')).toHaveLength(28);
    expect(wheel('День')).toHaveAttribute('aria-valuenow', '28');
  });

  it('текст не вводится с клавиатуры', async () => {
    render(<BirthdayPicker />);

    trigger().focus();
    await userEvent.keyboard('1990');

    expect(trigger()).toHaveValue('');
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('Escape закрывает лист', async () => {
    render(<BirthdayPicker />);
    await userEvent.click(trigger());

    await userEvent.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('required из Field блокирует отправку формы', async () => {
    const onSubmit = vi.fn<(data: FormData) => void>();
    render(
      <Form onSubmit={onSubmit}>
        <Field label="Дата рождения" required>
          <BirthdayPicker name="birth" />
        </Field>
        <FormSubmit>Отправить</FormSubmit>
      </Form>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Отправить' }));

    expect(onSubmit).not.toHaveBeenCalled();
  });
});
