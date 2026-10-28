import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

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
});
