import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Progress } from './progress';

describe('Progress', () => {
  it('рендерит полоску с value, max и классом', () => {
    render(
      <Progress className="mine" value={40} max={80} aria-label="Загрузка" />,
    );

    const bar = screen.getByRole('progressbar', { name: 'Загрузка' });
    expect(bar).toHaveClass('progress', 'mine');
    expect(bar).toHaveAttribute('value', '40');
    expect(bar).toHaveAttribute('max', '80');
  });

  it('max по умолчанию 100', () => {
    render(<Progress value={0} aria-label="Пусто" />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('max', '100');
  });
});
