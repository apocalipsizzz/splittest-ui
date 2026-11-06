import { createRef } from 'react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Field } from '@/components/field';
import { Input } from '@/components/input';
import { TextArea } from '@/components/textarea';
import { Form, FormActions, FormConsent, FormSubmit } from './form';

const contact = (
  onSubmit?: (data: FormData) => void | Promise<void>,
  error?: string,
) => (
  <Form onSubmit={onSubmit} error={error}>
    <Field hint="Опишите ситуацию">
      <TextArea name="question" defaultValue="Не открывается отчёт" />
    </Field>
    <Field label="Имя" required>
      <Input name="name" defaultValue="Jora" />
    </Field>
    <Field label="Номер телефона">
      <Input name="phone" defaultValue="+79990000000" />
    </Field>
    <FormActions>
      <FormSubmit>Отправить</FormSubmit>
      <FormConsent>Нажимая, принимаю условия оферты</FormConsent>
    </FormActions>
  </Form>
);

describe('Form', () => {
  it('отдаёт FormData и не уходит нативной отправкой', async () => {
    const onSubmit = vi.fn<(data: FormData) => void>();
    render(contact(onSubmit));

    const form = document.querySelector('form');
    expect(form).toHaveClass('form');
    expect(screen.getByText('Нажимая, принимаю условия оферты')).toHaveClass(
      'form__consent',
    );

    await userEvent.click(screen.getByRole('button', { name: 'Отправить' }));

    expect(onSubmit).toHaveBeenCalledOnce();
    const data = onSubmit.mock.calls[0]?.[0];
    expect(data?.get('question')).toBe('Не открывается отчёт');
    expect(data?.get('name')).toBe('Jora');
    expect(data?.get('phone')).toBe('+79990000000');
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
    expect(screen.getByRole('button')).toBeEnabled();
  });

  it('пустое обязательное поле не вызывает onSubmit', async () => {
    const onSubmit = vi.fn<(data: FormData) => void>();
    render(
      <Form onSubmit={onSubmit}>
        <Field label="Имя" required>
          <Input name="name" />
        </Field>
        <FormSubmit>Отправить</FormSubmit>
      </Form>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Отправить' }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Поле «Имя» обязательно',
    );
  });

  it('пока промис не осел, кнопка ждёт', async () => {
    let release: () => void = () => {};
    const onSubmit = vi.fn<(data: FormData) => Promise<void>>(
      () =>
        new Promise<void>(resolve => {
          release = resolve;
        }),
    );
    render(contact(onSubmit));

    await userEvent.click(screen.getByRole('button', { name: 'Отправить' }));

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(screen.getByRole('button')).toBeDisabled();
    expect(document.querySelector('form')).toHaveAttribute('aria-busy', 'true');

    await act(async () => {
      release();
    });

    expect(screen.getByRole('button')).toBeEnabled();
    expect(document.querySelector('form')).not.toHaveAttribute('aria-busy');
  });

  it('reject промиса показывает ошибку и отпускает кнопку', async () => {
    render(contact(() => Promise.reject(new Error('Сервер недоступен'))));

    await userEvent.click(screen.getByRole('button', { name: 'Отправить' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Сервер недоступен',
    );
    expect(screen.getByRole('alert')).toHaveClass('form__error');
    expect(screen.getByRole('button')).toBeEnabled();
  });

  it('внешняя ошибка важнее текста из onSubmit', async () => {
    render(
      contact(
        () => Promise.reject(new Error('Сервер недоступен')),
        'Телефон не тот',
      ),
    );

    await userEvent.click(screen.getByRole('button', { name: 'Отправить' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Телефон не тот',
    );
    expect(screen.queryByText('Сервер недоступен')).not.toBeInTheDocument();
  });

  it('прячет нативный бабл у Field и оставляет его голому инпуту', async () => {
    render(
      <Form>
        <Field label="Имя" required>
          <Input name="name" />
        </Field>
        <input name="raw" required />
      </Form>,
    );

    const named = screen.getByLabelText('Имя');
    const namedInvalid = new Event('invalid', { cancelable: true });
    named.dispatchEvent(namedInvalid);
    expect(namedInvalid.defaultPrevented).toBe(true);
    await act(async () => {
      await Promise.resolve();
    });
    expect(named).toHaveFocus();

    const raw = document.querySelector('input[name="raw"]');
    expect(raw).toBeInstanceOf(HTMLInputElement);
    const rawInvalid = new Event('invalid', { cancelable: true });
    raw?.dispatchEvent(rawInvalid);
    expect(rawInvalid.defaultPrevented).toBe(false);
  });

  it('pending снаружи крутит кнопку без промиса', () => {
    render(
      <Form pending>
        <FormSubmit>Отправить</FormSubmit>
      </Form>,
    );

    expect(screen.getByRole('button')).toBeDisabled();
    expect(document.querySelector('form')).toHaveAttribute('aria-busy', 'true');
  });

  it('внешний pending не даёт отправить мимо заблокированной кнопки', () => {
    const onSubmit = vi.fn<(data: FormData) => void>();
    render(
      <Form pending onSubmit={onSubmit}>
        <FormSubmit>Отправить</FormSubmit>
      </Form>,
    );

    act(() => {
      document.querySelector('form')?.requestSubmit();
    });

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('без onSubmit и без action отменяет нативный сабмит', () => {
    render(
      <Form>
        <input name="phone" defaultValue="+79990000000" />
        <FormSubmit>Отправить</FormSubmit>
      </Form>,
    );

    const form = document.querySelector('form');
    const event = new SubmitEvent('submit', {
      bubbles: true,
      cancelable: true,
    });
    form?.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
    expect(form).not.toHaveAttribute('action');
  });

  it('без onSubmit, но с action оставляет нативную отправку', () => {
    render(
      <Form action="/feedback" method="post">
        <input name="phone" defaultValue="+79990000000" />
        <FormSubmit>Отправить</FormSubmit>
      </Form>,
    );

    const form = document.querySelector('form');
    expect(form).toHaveAttribute('action', '/feedback');
    expect(form).toHaveAttribute('method', 'post');

    const event = new SubmitEvent('submit', {
      bubbles: true,
      cancelable: true,
    });
    form?.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(false);
  });

  it('onSubmit отменяет сабмит даже если задан action', () => {
    const onSubmit = vi.fn<(data: FormData) => void>();
    render(
      <Form action="/feedback" onSubmit={onSubmit}>
        <input name="name" defaultValue="Jora" />
        <FormSubmit>Отправить</FormSubmit>
      </Form>,
    );

    const form = document.querySelector('form');
    const event = new SubmitEvent('submit', {
      bubbles: true,
      cancelable: true,
    });
    form?.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onSubmit.mock.calls[0]?.[0].get('name')).toBe('Jora');
  });

  it('FormSubmit отдаёт ref на button', () => {
    const ref = createRef<HTMLButtonElement>();

    render(
      <Form>
        <FormSubmit ref={ref}>Отправить</FormSubmit>
      </Form>,
    );

    expect(ref.current).toBe(screen.getByRole('button', { name: 'Отправить' }));
  });

  it('берёт текст ошибки из объекта с message', async () => {
    render(
      <Form onSubmit={() => Promise.reject({ message: 'Лимит запросов' })}>
        <FormSubmit>Отправить</FormSubmit>
      </Form>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Отправить' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Лимит запросов',
    );
  });

  it('FormActions и FormConsent отдают ref и атрибуты', () => {
    const actionsRef = createRef<HTMLDivElement>();
    const consentRef = createRef<HTMLDivElement>();
    render(
      <Form>
        <FormActions ref={actionsRef} data-testid="actions">
          <FormSubmit>Отправить</FormSubmit>
          <FormConsent ref={consentRef} data-testid="consent">
            Оферта
          </FormConsent>
        </FormActions>
      </Form>,
    );

    const actions = screen.getByTestId('actions');
    const consent = screen.getByTestId('consent');
    expect(actions).toHaveClass('form__buttons');
    expect(consent).toHaveClass('form__consent');
    expect(actionsRef.current).toBe(actions);
    expect(consentRef.current).toBe(consent);
  });

  it('errorFallback заменяет текст для ошибки без сообщения', async () => {
    const user = userEvent.setup();
    render(
      <Form
        errorFallback="Сервис недоступен"
        onSubmit={() => Promise.reject(new Error(''))}
      >
        <FormSubmit>Отправить</FormSubmit>
      </Form>,
    );

    await user.click(screen.getByRole('button', { name: 'Отправить' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Сервис недоступен',
    );
  });
});
