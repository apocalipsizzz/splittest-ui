import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Field } from '@/components/field';
import { Form, FormSubmit } from '@/components/form';
import { PhoneInput } from './phone-input';

describe('PhoneInput', () => {
  it('маскирует ввод и отдаёт значение и цифры', async () => {
    const onAccept = vi.fn<(value: string, unmasked: string) => void>();
    render(<PhoneInput placeholder="Телефон" onAccept={onAccept} />);

    await userEvent.type(screen.getByPlaceholderText('Телефон'), '9991234567');

    const input = screen.getByPlaceholderText<HTMLInputElement>('Телефон');
    expect(input.value).toBe('+7 (999) 123-45-67');
    expect(onAccept).toHaveBeenLastCalledWith(
      '+7 (999) 123-45-67',
      '9991234567',
    );
  });

  it('не принимает 7 и 8 первой цифрой номера', async () => {
    const onAccept = vi.fn<(value: string, unmasked: string) => void>();

    const { unmount } = render(
      <PhoneInput placeholder="Телефон" onAccept={onAccept} />,
    );
    await userEvent.type(screen.getByPlaceholderText('Телефон'), '89991234567');

    expect(screen.getByPlaceholderText<HTMLInputElement>('Телефон').value).toBe(
      '+7 (999) 123-45-67',
    );
    expect(onAccept).toHaveBeenLastCalledWith(
      '+7 (999) 123-45-67',
      '9991234567',
    );

    unmount();
    onAccept.mockClear();
    render(<PhoneInput placeholder="Телефон" onAccept={onAccept} />);
    await userEvent.type(screen.getByPlaceholderText('Телефон'), '79991234567');

    expect(screen.getByPlaceholderText<HTMLInputElement>('Телефон').value).toBe(
      '+7 (999) 123-45-67',
    );
    expect(onAccept).toHaveBeenLastCalledWith(
      '+7 (999) 123-45-67',
      '9991234567',
    );
  });

  it('без placeholder показывает маску из цифр-подчёркиваний', () => {
    render(<PhoneInput />);

    expect(screen.getByRole('textbox')).toHaveAttribute(
      'placeholder',
      '+7 (___) ___-__-__',
    );
  });

  it('clearable показывает крестик и очищает controlled value', async () => {
    const onAccept = vi.fn<(value: string, unmasked: string) => void>();
    const Harness = () => {
      const [phone, setPhone] = useState('');
      return (
        <PhoneInput
          placeholder="Телефон"
          clearable
          value={phone}
          onAccept={(value, unmasked) => {
            setPhone(value);
            onAccept(value, unmasked);
          }}
        />
      );
    };
    render(<Harness />);

    expect(screen.queryByRole('button', { name: 'Очистить' })).toBeNull();

    await userEvent.type(screen.getByPlaceholderText('Телефон'), '9991234567');
    await userEvent.click(screen.getByRole('button', { name: 'Очистить' }));

    const input = screen.getByPlaceholderText<HTMLInputElement>('Телефон');
    expect(input.value).toBe('');
    expect(onAccept).toHaveBeenLastCalledWith('', '');
    expect(screen.queryByRole('button', { name: 'Очистить' })).toBeNull();
  });

  it('тип tel и класс input, error ставит aria-invalid', () => {
    render(<PhoneInput placeholder="Телефон" error />);

    const input = screen.getByPlaceholderText('Телефон');
    expect(input).toHaveAttribute('type', 'tel');
    expect(input).toHaveAttribute('autocomplete', 'tel');
    expect(input).toHaveClass('input', 'input--error');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('внутри Field пустой телефон блокирует отправку', async () => {
    const onSubmit = vi.fn<(data: FormData) => void>();
    render(
      <Form onSubmit={onSubmit}>
        <Field label="Телефон" required>
          <PhoneInput />
        </Field>
        <FormSubmit>Отправить</FormSubmit>
      </Form>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Отправить' }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Поле «Телефон» обязательно',
    );
    expect(screen.getByLabelText('Телефон')).toBeRequired();
  });

  it('внутри Field отдаёт маску в FormData по name', async () => {
    const onSubmit = vi.fn<(data: FormData) => void>();
    render(
      <Form onSubmit={onSubmit}>
        <Field label="Телефон" required>
          <PhoneInput name="phone" />
        </Field>
        <FormSubmit>Отправить</FormSubmit>
      </Form>,
    );

    await userEvent.type(screen.getByLabelText('Телефон'), '9991234567');
    await userEvent.click(screen.getByRole('button', { name: 'Отправить' }));

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onSubmit.mock.calls[0]?.[0].get('phone')).toBe('+7 (999) 123-45-67');
  });
});
