import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Input } from './input';
import styles from './input.module.scss';

describe('Input', () => {
  it('error ставит класс и aria-invalid', () => {
    render(<Input error placeholder="Имя" />);
    const input = screen.getByPlaceholderText('Имя');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input.className).toContain(styles['input--error']);
  });

  it('recommended ставит класс', () => {
    render(<Input recommended placeholder="Имя" />);
    expect(screen.getByPlaceholderText('Имя').className).toContain(
      styles['input--recommended'],
    );
  });
});
