import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { RadioInput } from './radio';

describe('RadioInput', () => {
  it('связывает label и помечает ошибку классом', () => {
    render(<RadioInput title="Да" error />);
    const radio = screen.getByLabelText('Да');
    expect(radio).toHaveAttribute('type', 'radio');
    expect(radio).toHaveClass('radio__input');
    expect(radio.parentElement).toHaveClass('radio', 'radio--error');
  });
});
