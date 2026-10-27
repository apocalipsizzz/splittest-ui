import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { CheckboxInput } from './checkbox';

describe('CheckboxInput', () => {
  it('связывает label с input и меняет дефис на тире', () => {
    render(<CheckboxInput title="18-24" />);
    const input = screen.getByLabelText('18–24');
    expect(input).toHaveAttribute('type', 'checkbox');
    expect(input).toHaveClass('checkbox__input');
    expect(input.parentElement).toHaveClass('checkbox');
    expect(screen.getByText('18–24')).toHaveClass('checkbox__label');
  });

  it('disabled выключает input', () => {
    render(<CheckboxInput title="Нет" disabled />);
    expect(screen.getByLabelText('Нет')).toBeDisabled();
  });
});
