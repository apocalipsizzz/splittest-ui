import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { Field } from '@/components/field';

import { TextArea } from './textarea';

describe('TextArea', () => {
  it('показывает остаток символов и связывает его с полем', () => {
    render(<TextArea maxLength={40} />);
    const textarea = screen.getByRole('textbox');
    const counter = screen.getByText('Осталось 40 из 40 символов');

    expect(textarea).toHaveClass('textarea');
    expect(counter).toHaveClass('textarea__counter');
    expect(textarea).toHaveAttribute('aria-describedby', counter.id);
  });

  it('остаток считается от значения в поле', () => {
    render(<TextArea maxLength={40} value="12345" onChange={() => {}} />);
    expect(screen.getByText('Осталось 35 из 40 символов')).toBeInTheDocument();
  });

  it('свой aria-describedby не теряется', () => {
    render(
      <>
        <TextArea maxLength={40} aria-describedby="hint" />
        <p id="hint">Подсказка</p>
      </>,
    );

    const counter = screen.getByText('Осталось 40 из 40 символов');
    expect(screen.getByRole('textbox')).toHaveAttribute(
      'aria-describedby',
      `${counter.id} hint`,
    );
  });

  it('counterLabel заменяет текст счётчика', () => {
    render(
      <TextArea
        maxLength={40}
        value="12345"
        onChange={() => {}}
        counterLabel={(left, max) => `${left}/${max}`}
      />,
    );
    expect(screen.getByText('35/40')).toBeInTheDocument();
  });

  it('reset возвращает defaultValue и счётчик', async () => {
    render(
      <form>
        <TextArea maxLength={40} defaultValue="12345" />
        <button type="reset">Сброс</button>
      </form>,
    );

    const area = screen.getByRole('textbox');
    expect(screen.getByText('Осталось 35 из 40 символов')).toBeInTheDocument();

    await userEvent.type(area, '!');
    expect(screen.getByText('Осталось 34 из 40 символов')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Сброс' }));
    expect(area).toHaveValue('12345');
    expect(screen.getByText('Осталось 35 из 40 символов')).toBeInTheDocument();
  });

  it('counter={false} прячет счётчик', () => {
    render(<TextArea maxLength={40} counter={false} />);
    expect(screen.queryByText(/Осталось/)).not.toBeInTheDocument();
    expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-describedby');
  });

  it('size ставит модификатор, md — без класса', () => {
    const { rerender } = render(<TextArea size="sm" placeholder="Текст" />);
    expect(screen.getByPlaceholderText('Текст')).toHaveClass(
      'textarea',
      'textarea--sm',
    );

    rerender(<TextArea size="md" placeholder="Текст" />);
    expect(screen.getByPlaceholderText('Текст')).not.toHaveClass(
      'textarea--md',
    );

    rerender(<TextArea size="lg" placeholder="Текст" />);
    expect(screen.getByPlaceholderText('Текст')).toHaveClass('textarea--lg');
  });

  it('без label подписи нет', () => {
    render(<TextArea placeholder="Текст" />);
    expect(document.querySelector('.textarea__label')).not.toBeInTheDocument();
  });

  it('label связан с полем', async () => {
    render(<TextArea label="Комментарий" />);
    const area = screen.getByRole('textbox', { name: 'Комментарий' });

    expect(area).toHaveClass('textarea');
    await userEvent.click(screen.getByText('Комментарий'));
    expect(area).toHaveFocus();
  });

  it('свой label не забирает id поля', () => {
    render(
      <Field label="Пример и комментарий">
        <TextArea label="Комментарий" />
      </Field>,
    );

    const area = screen.getByRole('textbox', { name: 'Комментарий' });
    const fieldLabel = screen.getByText('Пример и комментарий');
    expect(fieldLabel).toHaveAttribute('for');
    expect(fieldLabel.getAttribute('for')).not.toBe(area.id);
  });

  it('свой id важнее id поля', () => {
    render(
      <Field label="Комментарий">
        <TextArea id="note" aria-label="заметка" />
      </Field>,
    );

    expect(screen.getByLabelText('заметка')).toHaveAttribute('id', 'note');
  });
});
