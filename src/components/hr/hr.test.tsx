import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { HR } from './hr';

describe('HR', () => {
  it('рендерит hr с классом hr и пропускает className', () => {
    const { container } = render(<HR className="mine" data-testid="divider" />);

    const hr = container.querySelector('hr');
    expect(hr).toHaveClass('hr', 'mine');
    expect(hr).toHaveAttribute('data-testid', 'divider');
  });
});
