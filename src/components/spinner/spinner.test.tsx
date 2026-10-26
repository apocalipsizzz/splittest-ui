import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Spinner } from './spinner';
import styles from './spinner.module.scss';

describe('Spinner', () => {
  it('по умолчанию центрируется', () => {
    const { container } = render(<Spinner />);
    const root = container.firstElementChild;
    expect(root?.className).toContain(styles.spinner);
    expect(root?.className).not.toContain(styles.top);
    expect(container.querySelector('svg')).toBeTruthy();
  });

  it('position=top вешает модификатор', () => {
    const { container } = render(<Spinner position="top" />);
    expect(container.firstElementChild?.className).toContain(styles.top);
  });
});
