import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Slot } from './slot';

describe('Slot', () => {
  it('склеивает onClick ребёнка и слота', () => {
    const onChildClick = vi.fn<() => void>();
    const onClick = vi.fn<() => void>();

    render(
      <Slot onClick={onClick}>
        <button type="button" onClick={onChildClick}>
          Открыть
        </button>
      </Slot>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Открыть' }));

    expect(onChildClick).toHaveBeenCalledOnce();
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('не зовёт onClick слота, если ребёнок отменил событие', () => {
    const onClick = vi.fn<() => void>();

    render(
      <Slot onClick={onClick}>
        <button
          type="button"
          onClick={event => {
            event.preventDefault();
          }}
        >
          Открыть
        </button>
      </Slot>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Открыть' }));

    expect(onClick).not.toHaveBeenCalled();
  });
});
