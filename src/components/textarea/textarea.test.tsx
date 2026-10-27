import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TextArea } from './textarea';

describe('TextArea', () => {
  it('показывает счётчик, если задан maxLength', () => {
    render(<TextArea maxLength={40} />);
    expect(screen.getByRole('textbox')).toHaveClass('textarea');
    expect(screen.getByText('Максимум 40 символов')).toHaveClass(
      'textarea__counter',
    );
  });

  it('hideCounter прячет счётчик', () => {
    render(<TextArea maxLength={40} hideCounter />);
    expect(screen.queryByText('Максимум 40 символов')).not.toBeInTheDocument();
  });
});
