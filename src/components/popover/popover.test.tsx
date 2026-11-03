import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Button } from '@/components/button';
import { Popover } from './popover';

describe('Popover', () => {
  it('рендерит якорь и не показывает панель, когда закрыт', () => {
    render(
      <Popover open={false} trigger={<Button type="button">Открыть</Button>}>
        Контент
      </Popover>,
    );

    expect(
      screen.getByRole('button', { name: 'Открыть' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('показывает заголовок и контент, когда открыт', () => {
    render(
      <Popover
        open
        title="Код подтверждения"
        trigger={<Button type="button">Сохранить</Button>}
      >
        Введите код
      </Popover>,
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Код подтверждения')).toBeInTheDocument();
    expect(screen.getByText('Введите код')).toBeInTheDocument();
  });

  it('вызывает onClose по кнопке закрытия', async () => {
    const onClose = vi.fn<() => void>();
    const user = userEvent.setup();

    render(
      <Popover
        open
        onClose={onClose}
        trigger={<Button type="button">Сохранить</Button>}
      >
        Контент
      </Popover>,
    );

    await user.click(screen.getByRole('button', { name: 'Закрыть' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
