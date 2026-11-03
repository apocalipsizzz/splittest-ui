import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { PopupSheet } from './popup-sheet';

describe('PopupSheet', () => {
  it('не блокирует скролл, когда закрыт', () => {
    render(
      <PopupSheet open={false} onClose={() => {}}>
        Контент
      </PopupSheet>,
    );

    expect(document.body.style.overflow).toBe('');
  });

  it('блокирует скролл и рендерит заголовок, когда открыт', () => {
    render(
      <PopupSheet open onClose={() => {}} title="Заголовок">
        Контент
      </PopupSheet>,
    );

    expect(document.body.style.overflow).toBe('hidden');
    expect(screen.getByText('Заголовок')).toBeInTheDocument();
    expect(screen.getByText('Контент')).toBeInTheDocument();
  });

  it('вызывает onClose по Escape', async () => {
    const onClose = vi.fn<() => void>();
    const user = userEvent.setup();

    render(
      <PopupSheet open onClose={onClose}>
        Контент
      </PopupSheet>,
    );

    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
