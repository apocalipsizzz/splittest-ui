import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { Input } from '@/components/input';
import { TextArea } from '@/components/textarea';
import { Field } from './field';

describe('Field', () => {
  it('связывает лейбл, подсказку и ошибку', () => {
    const { rerender } = render(
      <Field label="Имя" hint="Нельзя изменить после проверки">
        <Input defaultValue="Jora" />
      </Field>,
    );

    const input = screen.getByLabelText('Имя');
    const hint = screen.getByText('Нельзя изменить после проверки');
    expect(input).toHaveValue('Jora');
    expect(input).toHaveAttribute('aria-describedby', hint.id);
    expect(input).not.toHaveAttribute('aria-invalid');

    rerender(
      <Field
        label="Имя"
        hint="Нельзя изменить после проверки"
        error="Имя занято"
      >
        <Input defaultValue="Jora" />
      </Field>,
    );

    const invalid = screen.getByLabelText('Имя');
    const error = screen.getByText('Имя занято');
    const hintAfter = screen.getByText('Нельзя изменить после проверки');
    expect(invalid).toHaveAttribute('aria-invalid', 'true');
    expect(invalid).toHaveClass('input--error');
    expect(invalid).toHaveAttribute(
      'aria-describedby',
      `${error.id} ${hintAfter.id}`,
    );
    expect(error.compareDocumentPosition(hintAfter)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });

  it('ошибка объявляется как alert и связана через aria-errormessage', () => {
    render(
      <Field label="Имя" error="Имя занято">
        <Input defaultValue="Jora" />
      </Field>,
    );

    const input = screen.getByLabelText('Имя');
    const error = screen.getByText('Имя занято');
    expect(error).toHaveAttribute('role', 'alert');
    expect(input).toHaveAttribute('aria-errormessage', error.id);
    expect(input).toHaveAttribute('aria-describedby', error.id);
  });

  it('hint под лейблом стоит над полем', () => {
    render(
      <Field
        label="Отчество"
        hint="Алгоритм не запутается в однофамильцах."
        hintPlacement="label"
      >
        <Input />
      </Field>,
    );

    const input = screen.getByLabelText('Отчество');
    const hint = screen.getByText('Алгоритм не запутается в однофамильцах.');
    expect(hint).toHaveClass('field__hint', 'field__hint--label');
    expect(
      screen.getAllByText('Алгоритм не запутается в однофамильцах.'),
    ).toHaveLength(1);
    expect(hint.compareDocumentPosition(input)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(input).toHaveAttribute('aria-describedby', hint.id);
  });

  it('required ругается только после стирания', async () => {
    render(
      <Field label="Фамилия" required>
        <Input />
      </Field>,
    );

    const input = screen.getByLabelText('Фамилия');
    expect(
      screen.queryByText('Поле «Фамилия» обязательно'),
    ).not.toBeInTheDocument();
    expect(input).not.toHaveAttribute('aria-invalid');

    await userEvent.type(input, 'Иванов');
    expect(
      screen.queryByText('Поле «Фамилия» обязательно'),
    ).not.toBeInTheDocument();

    await userEvent.clear(input);
    expect(screen.getByText('Поле «Фамилия» обязательно')).toBeInTheDocument();
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveClass('input--error');

    await userEvent.type(input, 'А');
    expect(
      screen.queryByText('Поле «Фамилия» обязательно'),
    ).not.toBeInTheDocument();
    expect(input).not.toHaveAttribute('aria-invalid');
  });

  it('required помечает контрол и не рисует звёздочку', () => {
    const { container } = render(
      <Field label="Фамилия" required>
        <Input />
      </Field>,
    );

    const input = screen.getByLabelText('Фамилия');
    expect(input).toBeRequired();
    expect(input).toHaveAttribute('aria-required', 'true');
    expect(container.querySelector('.field__required')).toBeNull();
    expect(screen.getByText('Фамилия')).toHaveTextContent(/^Фамилия$/);
  });

  it('required видит начальное значение', async () => {
    render(
      <Field label="Имя" required>
        <Input defaultValue="Jora" />
      </Field>,
    );

    const input = screen.getByLabelText('Имя');
    expect(
      screen.queryByText('Поле «Имя» обязательно'),
    ).not.toBeInTheDocument();

    await userEvent.clear(input);
    expect(screen.getByText('Поле «Имя» обязательно')).toBeInTheDocument();
  });

  it('textarea получает id поля', async () => {
    render(
      <Field label="Комментарий" required hint="Коротко">
        <TextArea defaultValue="текст" />
      </Field>,
    );

    const area = screen.getByLabelText('Комментарий');
    const hint = screen.getByText('Коротко');
    expect(area.tagName).toBe('TEXTAREA');
    expect(area).toHaveAttribute('aria-required', 'true');
    expect(hint.id).toBe(`${area.id}-hint`);
    expect(area).toHaveAttribute('aria-describedby', hint.id);
    expect(screen.getAllByText('Коротко')).toHaveLength(1);

    await userEvent.clear(area);
    const error = screen.getByRole('alert');
    expect(error).toHaveTextContent('Поле «Комментарий» обязательно');
    expect(area).toHaveAttribute('aria-errormessage', error.id);
    expect(area).toHaveAttribute('aria-describedby', `${error.id} ${hint.id}`);
    expect(area).toHaveAttribute('aria-invalid', 'true');
  });

  it('нарушение формата не выдаёт себя за обязательность', () => {
    render(
      <form>
        <Field label="Почта" required>
          <Input type="email" defaultValue="не-почта" />
        </Field>
      </form>,
    );

    const input = screen.getByLabelText('Почта');
    let valid = true;
    act(() => {
      valid = input.closest('form')?.checkValidity() ?? true;
    });

    expect(valid).toBe(false);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('без лейбла не рисует label', async () => {
    const { container } = render(
      <Field required>
        <Input aria-label="Поиск" defaultValue="текст" />
      </Field>,
    );

    const input = screen.getByLabelText('Поиск');
    expect(container.querySelector('.field__label')).toBeNull();
    expect(input).not.toHaveAttribute('aria-labelledby');

    await userEvent.clear(input);
    expect(screen.getByRole('alert')).toHaveTextContent('Обязательное поле');
  });

  it('пустое обязательное поле ругается после неудачной отправки', () => {
    render(
      <form>
        <Field label="Почта" required>
          <Input type="email" />
        </Field>
      </form>,
    );

    const input = screen.getByLabelText('Почта');
    act(() => {
      input.closest('form')?.checkValidity();
    });

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Поле «Почта» обязательно',
    );
  });
});
