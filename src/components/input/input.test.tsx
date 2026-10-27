import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Input } from './input';

describe('Input', () => {
  it('error ставит класс и aria-invalid', () => {
    render(<Input error placeholder="Имя" />);
    const input = screen.getByPlaceholderText('Имя');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveClass('input', 'input--error');
  });

  it('recommended ставит класс', () => {
    render(<Input recommended placeholder="Имя" />);
    expect(screen.getByPlaceholderText('Имя')).toHaveClass(
      'input',
      'input--recommended',
    );
  });
});
