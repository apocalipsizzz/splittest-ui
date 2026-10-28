import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { Field } from '@/components/field';
import { FieldControlProvider } from '@/components/field/field-context';

import { CheckboxInput } from './checkbox';

describe('CheckboxInput', () => {
  it('label рисует текст, title — тултип, дефис не переписывается', () => {
    render(<CheckboxInput label="18-24" title="Подсказка" />);
    const input = screen.getByLabelText('18-24');
    expect(input).toHaveAttribute('type', 'checkbox');
    expect(input).toHaveAttribute('title', 'Подсказка');
    expect(input).toHaveClass('checkbox__input');
    expect(input).not.toHaveClass('checkbox__input--no-events');
    expect(input.parentElement).toHaveClass('checkbox');
    expect(screen.getByText('18-24')).toHaveClass('checkbox__label');
  });

  it('type остаётся checkbox', () => {
    render(<CheckboxInput label="Да" type="text" />);
    expect(screen.getByLabelText('Да')).toHaveAttribute('type', 'checkbox');
  });

  it('disabled выключает input', () => {
    render(<CheckboxInput label="Нет" disabled />);
    expect(screen.getByLabelText('Нет')).toBeDisabled();
  });

  it('clickable={false} ставит класс без pointer-events', () => {
    render(<CheckboxInput label="Да" clickable={false} />);
    expect(screen.getByLabelText('Да')).toHaveClass(
      'checkbox__input--no-events',
    );
  });

  it('indeterminate пишет IDL и не aria-checked', () => {
    const { rerender } = render(<CheckboxInput label="Все" indeterminate />);
    const input = screen.getByLabelText('Все');
    expect(input).toHaveProperty('indeterminate', true);
    expect(input).not.toHaveAttribute('aria-checked');

    rerender(<CheckboxInput label="Все" />);
    expect(input).toHaveProperty('indeterminate', false);
  });

  it('контекст Field перебивает id и не затирает явные aria', () => {
    render(
      <FieldControlProvider
        value={{
          id: 'from-field',
          invalid: false,
          required: false,
        }}
      >
        <CheckboxInput
          label="Имя"
          id="from-props"
          required={false}
          aria-invalid={false}
          aria-describedby="extra"
          aria-errormessage="own-error"
        />
      </FieldControlProvider>,
    );

    const input = screen.getByLabelText('Имя');
    expect(input).toHaveAttribute('id', 'from-field');
    expect(screen.getByText('Имя')).toHaveAttribute('for', 'from-field');
    expect(input).not.toBeRequired();
    expect(input).not.toHaveAttribute('aria-required');
    expect(input).toHaveAttribute('aria-invalid', 'false');
    expect(input).toHaveAttribute('aria-describedby', 'extra');
    expect(input).toHaveAttribute('aria-errormessage', 'own-error');
  });

  it('контекст Field ставит required, ошибку и склеивает describedby', () => {
    render(
      <FieldControlProvider
        value={{
          id: 'from-field',
          invalid: true,
          required: true,
          describedBy: 'hint',
          errorId: 'err',
        }}
      >
        <CheckboxInput label="Имя" aria-describedby="extra" />
      </FieldControlProvider>,
    );

    const input = screen.getByLabelText('Имя');
    expect(input).toBeRequired();
    expect(input).toHaveAttribute('aria-required', 'true');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', 'hint extra');
    expect(input).toHaveAttribute('aria-errormessage', 'err');
  });

  it('error помечает, один required — нет', () => {
    const { rerender } = render(<CheckboxInput label="Да" required />);
    expect(screen.getByLabelText('Да')).not.toHaveAttribute('aria-invalid');

    rerender(<CheckboxInput label="Да" error />);
    expect(screen.getByLabelText('Да')).toHaveAttribute('aria-invalid', 'true');
  });

  it('в Field ругается после снятия галочки, а не с первого рендера', async () => {
    render(
      <Field label="Согласие" required>
        <CheckboxInput />
      </Field>,
    );

    const box = screen.getByLabelText('Согласие');
    expect(box).not.toHaveAttribute('aria-invalid');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    await userEvent.click(box);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    await userEvent.click(box);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(box).toHaveAttribute('aria-invalid', 'true');
  });
});
