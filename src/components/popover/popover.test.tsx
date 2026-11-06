import { createRef } from 'react';
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

    expect(screen.getByRole('button', { name: 'Открыть' })).toBeInTheDocument();
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

  it('вешает aria и класс на сам триггер', () => {
    const { container } = render(
      <Popover
        open
        triggerClassName="popover-trigger--full-width"
        trigger={
          <Button type="button" className="save">
            Сохранить
          </Button>
        }
      >
        Контент
      </Popover>,
    );

    const trigger = screen.getByRole('button', { name: 'Сохранить' });
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    expect(trigger).toHaveAttribute('aria-controls');
    expect(trigger).toHaveClass(
      'popover-trigger',
      'popover-trigger--full-width',
      'save',
    );
    expect(container.querySelector('span.popover-trigger')).toBeNull();
  });

  it('клик по триггеру вызывает его onClick', async () => {
    const onClick = vi.fn<() => void>();
    const user = userEvent.setup();

    render(
      <Popover
        open={false}
        trigger={
          <Button type="button" onClick={onClick}>
            Открыть
          </Button>
        }
      >
        Контент
      </Popover>,
    );

    const trigger = screen.getByRole('button', { name: 'Открыть' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await user.click(trigger);
    expect(onClick).toHaveBeenCalledOnce();
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

  it('openOnTriggerClick: якорь сам открывает и закрывает панель', async () => {
    const onOpenChange = vi.fn<(open: boolean) => void>();
    const user = userEvent.setup();

    render(
      <Popover
        openOnTriggerClick
        onOpenChange={onOpenChange}
        trigger={<Button type="button">Открыть</Button>}
      >
        Контент
      </Popover>,
    );

    const trigger = screen.getByRole('button', { name: 'Открыть' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await user.click(trigger);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(onOpenChange).toHaveBeenLastCalledWith(true);

    await user.click(trigger);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it('без openOnTriggerClick якорь панель не открывает', async () => {
    const onClick = vi.fn<() => void>();
    const user = userEvent.setup();

    render(
      <Popover
        trigger={
          <Button type="button" onClick={onClick}>
            Открыть
          </Button>
        }
      >
        Контент
      </Popover>,
    );

    await user.click(screen.getByRole('button', { name: 'Открыть' }));

    expect(onClick).toHaveBeenCalledOnce();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('свой onClick триггера жив рядом с обработчиком панели', async () => {
    const onClick = vi.fn<() => void>();
    const user = userEvent.setup();

    render(
      <Popover
        openOnTriggerClick
        trigger={
          <Button type="button" onClick={onClick}>
            Открыть
          </Button>
        }
      >
        Контент
      </Popover>,
    );

    await user.click(screen.getByRole('button', { name: 'Открыть' }));

    expect(onClick).toHaveBeenCalledOnce();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('closeLabel подписывает кнопку закрытия', () => {
    render(
      <Popover
        open
        closeLabel="Close"
        trigger={<button type="button">Якорь</button>}
      >
        Текст
      </Popover>,
    );

    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });

  it('отдаёт ref и атрибуты панели', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Popover
        open
        ref={ref}
        title="Подсказка"
        data-testid="panel"
        trigger={<button type="button">Якорь</button>}
      >
        Текст
      </Popover>,
    );

    const panel = screen.getByTestId('panel');
    expect(panel).toHaveClass('popover');
    expect(panel).not.toHaveAttribute('title');
    expect(screen.getByRole('heading', { name: 'Подсказка' })).toBe(
      panel.querySelector('h4'),
    );
    expect(ref.current).toBe(panel);
  });
});
