import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { CheckboxInput } from './checkbox';

describe('CheckboxInput', () => {
  it('связывает label с input и меняет дефис на тире', () => {
    render(<CheckboxInput title="18-24" />);
    expect(screen.getByLabelText('18–24')).toHaveAttribute('type', 'checkbox');
  });

  it('disabled выключает input', () => {
    render(<CheckboxInput title="Нет" disabled />);
    expect(screen.getByLabelText('Нет')).toBeDisabled();
  });
});
