import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

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
    expect(input.parentElement).toHaveClass('checkbox__box');
    expect(input.closest('.checkbox')).toHaveClass('checkbox');
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

  it('свой id важнее контекста Field, без id берётся id поля', () => {
    const { rerender } = render(
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
    const caption = screen.getByText('Имя');
    expect(input).toHaveAttribute('id', 'from-props');
    expect(input).toHaveAttribute('aria-labelledby', caption.id);
    expect(
      caption.closest('.checkbox')?.querySelector('label'),
    ).toHaveAttribute('for', 'from-props');
    expect(input).not.toBeRequired();
    expect(input).not.toHaveAttribute('aria-required');
    expect(input).toHaveAttribute('aria-invalid', 'false');
    expect(input).toHaveAttribute('aria-describedby', 'extra');
    expect(input).toHaveAttribute('aria-errormessage', 'own-error');

    rerender(
      <FieldControlProvider
        value={{
          id: 'from-field',
          invalid: false,
          required: false,
        }}
      >
        <CheckboxInput label="Имя" />
      </FieldControlProvider>,
    );
    expect(screen.getByLabelText('Имя')).toHaveAttribute('id', 'from-field');
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

  it('ссылка внутри текста не переключает чекбокс и сохраняет свои target и rel', async () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);

    render(
      <CheckboxInput
        label={
          <>
            Даю согласие на обработку моих{' '}
            <span>
              <a
                href="https://splittest.ru/privacy.pdf"
                target="_self"
                onClick={event => event.preventDefault()}
              >
                персональных данных
              </a>
            </span>
          </>
        }
      />,
    );

    const input = screen.getByRole('checkbox', {
      name: 'Даю согласие на обработку моих персональных данных',
    });
    const link = screen.getByRole('link', { name: 'персональных данных' });
    expect(link).toHaveAttribute('href', 'https://splittest.ru/privacy.pdf');
    expect(link).toHaveAttribute('target', '_self');
    expect(link).not.toHaveAttribute('rel');
    expect(link).not.toHaveClass('checkbox__link');

    fireEvent.click(link);
    expect(input).not.toBeChecked();
    expect(open).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText(/Даю согласие/));
    expect(input).toBeChecked();

    open.mockRestore();
  });

  it('в одном Field свои id не схлопываются', () => {
    render(
      <Field label="Нажмите, чтобы продолжить">
        <CheckboxInput id="captcha" label="Я не робот" />
        <CheckboxInput id="offerta" label="Оферта" />
        <CheckboxInput id="personal-data" label="Персональные данные" />
      </Field>,
    );

    expect(
      screen.getByRole('checkbox', { name: 'Я не робот' }),
    ).toHaveAttribute('id', 'captcha');
    expect(screen.getByRole('checkbox', { name: 'Оферта' })).toHaveAttribute(
      'id',
      'offerta',
    );
    expect(
      screen.getByRole('checkbox', { name: 'Персональные данные' }),
    ).toHaveAttribute('id', 'personal-data');
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
