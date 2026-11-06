import { createRef } from 'react';
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
import { DatePicker } from './date-picker';
import { WHEEL_ITEM_HEIGHT } from './wheel-column';

const trigger = () => screen.getByRole('textbox');
const wheel = (label: string) =>
  screen.getByRole('spinbutton', { name: label });
const items = (label: string) => within(wheel(label)).getAllByRole('button');

const pick = async (label: string, text: string) => {
  await userEvent.click(within(wheel(label)).getByText(text));
};

describe('DatePicker', () => {
  it('показывает дату текстом и отдаёт ISO в hidden-поле', () => {
    const { container } = render(
      <DatePicker
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
    render(<DatePicker onChange={onChange} />);

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
    render(<DatePicker value={new Date(1990, 2, 15)} onChange={onChange} />);

    await userEvent.click(trigger());
    wheel('Месяц').focus();
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.click(screen.getByRole('button', { name: 'Применить' }));

    expect(onChange.mock.calls[0]?.[0]).toEqual(new Date(1990, 3, 15));
  });

  it('прокрутка колеса выбирает пункт посередине после остановки', async () => {
    render(<DatePicker value={new Date(1990, 2, 15)} />);
    await userEvent.click(trigger());

    const node = wheel('День');
    node.scrollTop = 9 * WHEEL_ITEM_HEIGHT;
    fireEvent.scroll(node);

    await waitFor(() => {
      expect(node).toHaveAttribute('aria-valuenow', '10');
    });
  });

  it('title попадает в заголовок окна, по умолчанию — общий', async () => {
    const { unmount } = render(<DatePicker title="Дата заезда" />);
    await userEvent.click(trigger());

    expect(
      screen.getByRole('heading', { name: 'Дата заезда' }),
    ).toBeInTheDocument();
    unmount();
  });

  it('без title и minAge окно общее, годы до текущего', async () => {
    render(<DatePicker />);
    await userEvent.click(trigger());

    expect(
      screen.getByRole('heading', { name: 'Выберите дату' }),
    ).toBeInTheDocument();
    const years = items('Год');
    expect(years.at(-1)).toHaveTextContent(String(new Date().getFullYear()));
  });

  it('минимальный возраст ограничивает список годов', async () => {
    render(<DatePicker minAge={18} />);
    await userEvent.click(trigger());

    const years = items('Год');
    expect(years.at(-1)).toHaveTextContent(
      String(new Date().getFullYear() - 18),
    );
  });

  it('в феврале дней не больше длины месяца', async () => {
    render(<DatePicker />);
    await userEvent.click(trigger());

    await pick('Год', '2001');
    await pick('Месяц', 'январь');
    await pick('День', '31');
    await pick('Месяц', 'февраль');

    expect(items('День')).toHaveLength(28);
    expect(wheel('День')).toHaveAttribute('aria-valuenow', '28');
  });

  it('текст не вводится с клавиатуры', async () => {
    render(<DatePicker />);

    trigger().focus();
    await userEvent.keyboard('1990');

    expect(trigger()).toHaveValue('');
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('Escape закрывает лист', async () => {
    render(<DatePicker />);
    await userEvent.click(trigger());
    const dialog = await screen.findByRole('dialog');
    await waitFor(() => {
      expect(dialog).toHaveFocus();
    });

    await userEvent.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('модальный: страница под листом скрыта и Tab из него не выходит', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <>
        <button type="button">Снаружи</button>
        <DatePicker />
      </>,
    );

    await user.click(trigger());
    const dialog = await screen.findByRole('dialog');
    await waitFor(() => {
      expect(dialog).toHaveFocus();
    });

    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(container).toHaveAttribute('aria-hidden', 'true');

    await user.tab();

    expect(container).not.toContainElement(
      document.activeElement as HTMLElement,
    );
    expect(dialog).toContainElement(document.activeElement as HTMLElement);
  });

  it('required из Field блокирует отправку формы', async () => {
    const onSubmit = vi.fn<(data: FormData) => void>();
    render(
      <Form onSubmit={onSubmit}>
        <Field label="Дата рождения" required>
          <DatePicker name="birth" />
        </Field>
        <FormSubmit>Отправить</FormSubmit>
      </Form>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Отправить' }));

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('подписи и месяцы берутся из пропсов и Intl', async () => {
    render(
      <DatePicker
        value={new Date(1990, 2, 15)}
        locale="en"
        monthLabel="Month"
        applyLabel="Apply"
        onChange={() => {}}
      />,
    );

    expect(trigger()).toHaveValue('15 March 1990');
    await userEvent.click(trigger());
    expect(
      screen.getByRole('spinbutton', { name: 'Month' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Apply' })).toBeInTheDocument();
  });

  it('без value держит дату сам: defaultValue и выбор через лист', async () => {
    const onChange = vi.fn<(date: Date) => void>();
    const user = userEvent.setup();
    render(
      <DatePicker
        defaultValue={new Date(1990, 2, 15)}
        onChange={onChange}
        locale="en"
      />,
    );

    expect(trigger()).toHaveValue('15 March 1990');

    await user.click(trigger());
    await screen.findByRole('dialog');
    await user.click(screen.getByRole('button', { name: 'Применить' }));

    expect(onChange).toHaveBeenCalledOnce();
    expect(trigger()).toHaveValue('15 March 1990');
  });

  it('вуаль скрыта от скринридера и не попадает в табуляцию', async () => {
    const user = userEvent.setup();
    render(<DatePicker />);
    await user.click(trigger());
    await screen.findByRole('dialog');

    const mask = document.querySelector('.date-picker__mask');
    expect(mask).toHaveAttribute('aria-hidden', 'true');
    expect(mask?.tagName).toBe('DIV');
    expect(screen.queryByRole('button', { name: 'Закрыть' })).toBeNull();
  });

  it('закрывается кликом по вуали', async () => {
    const user = userEvent.setup();
    render(<DatePicker />);
    await user.click(trigger());
    await screen.findByRole('dialog');

    await user.click(document.querySelector('.date-picker__mask') as Element);

    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('отдаёт ref и атрибуты корня, title не становится тултипом', () => {
    const ref = createRef<HTMLDivElement>();
    render(<DatePicker ref={ref} title="День рождения" data-testid="picker" />);

    const root = screen.getByTestId('picker');
    expect(root).toHaveClass('date-picker');
    expect(root).not.toHaveAttribute('title');
    expect(ref.current).toBe(root);
  });
});
