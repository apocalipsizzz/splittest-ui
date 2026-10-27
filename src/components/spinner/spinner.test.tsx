import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Spinner } from './spinner';

describe('Spinner', () => {
  it('по умолчанию центрируется', () => {
    const { container } = render(<Spinner />);
    const root = container.firstElementChild;
    expect(root).toHaveClass('spinner');
    expect(root).not.toHaveClass('spinner--top');
    expect(container.querySelector('svg')).toBeTruthy();
  });

  it('position=top вешает модификатор', () => {
    const { container } = render(<Spinner position="top" />);
    expect(container.firstElementChild).toHaveClass('spinner', 'spinner--top');
  });
});
