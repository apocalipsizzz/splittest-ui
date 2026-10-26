import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { RadioInput } from './radio';
import styles from './radio.module.scss';

describe('RadioInput', () => {
  it('связывает label и помечает ошибку классом', () => {
    render(<RadioInput title="Да" error />);
    const radio = screen.getByLabelText('Да');
    expect(radio).toHaveAttribute('type', 'radio');
    expect(radio.className).toContain(styles.error);
  });
});
