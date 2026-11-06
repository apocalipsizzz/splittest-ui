import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { DatePicker } from '@/components/date-picker';
import { Select } from '@/components/select';
import { PopupSheet } from './popup-sheet';

const Harness = ({ onClose }: { onClose?: () => void }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Открыть
      </button>
      <PopupSheet
        open={open}
        title="Заголовок"
        onClose={() => {
          setOpen(false);
          onClose?.();
        }}
      >
        <button type="button">Внутри</button>
      </PopupSheet>
    </>
  );
};

const portalOf = (dialog: HTMLElement) =>
  dialog.closest('[data-floating-ui-portal]');

/**
 * Начальный фокус уезжает на лист асинхронно. Пока он не осел, клик по контролу
 * внутри листа успевает потерять фокус обратно на лист — в браузере этого не
 * бывает, там пользователь сначала видит открытый лист.
 */
const sheetReady = async () => {
  const dialog = await screen.findByRole('dialog');
  await waitFor(() => {
    expect(dialog).toHaveFocus();
  });
  return dialog;
};

describe('PopupSheet', () => {
  it('не рендерит содержимое, пока закрыт', () => {
    render(
      <PopupSheet open={false} onClose={() => {}} title="Заголовок">
        <button type="button">Внутри</button>
      </PopupSheet>,
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Внутри' }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText('Заголовок')).not.toBeInTheDocument();
  });

  it('не блокирует скролл, когда закрыт', () => {
    render(
      <PopupSheet open={false} onClose={() => {}}>
        Контент
      </PopupSheet>,
    );

    expect(document.body.style.overflow).toBe('');
    expect(document.body.style.position).toBe('');
  });

  it('блокирует скролл и рендерит заголовок, когда открыт', () => {
    render(
      <PopupSheet open onClose={() => {}} title="Заголовок">
        Контент
      </PopupSheet>,
    );

    expect(document.body.style.overflow).toBe('hidden');
    expect(document.body.style.position).toBe('fixed');
    expect(screen.getByText('Заголовок')).toBeInTheDocument();
    expect(screen.getByText('Контент')).toBeInTheDocument();
  });

  it('объявлен модальным диалогом с доступным именем', () => {
    render(
      <PopupSheet open onClose={() => {}} title="Заголовок">
        Контент
      </PopupSheet>,
    );

    const dialog = screen.getByRole('dialog');

    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAccessibleName('Заголовок');
  });

  it('скрывает остальную страницу от скринридера, пока открыт', () => {
    const { container } = render(
      <>
        <button type="button">Снаружи</button>
        <PopupSheet open onClose={() => {}} title="Заголовок">
          Контент
        </PopupSheet>
      </>,
    );

    // Кнопка «Снаружи» живёт в container, он же — сосед портала с листом.
    expect(container).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('уводит фокус на лист при открытии', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole('button', { name: 'Открыть' }));

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toHaveFocus();
    });
  });

  it('не выпускает фокус из листа по Tab', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    const trigger = screen.getByRole('button', { name: 'Открыть' });
    await user.click(trigger);
    const dialog = await screen.findByRole('dialog');
    const portal = portalOf(dialog);

    for (let step = 0; step < 4; step += 1) {
      await user.tab();
      expect(trigger).not.toHaveFocus();
      expect(portal).toContainElement(document.activeElement as HTMLElement);
    }
  });

  it('возвращает фокус на триггер после закрытия', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    const trigger = screen.getByRole('button', { name: 'Открыть' });
    await user.click(trigger);
    await screen.findByRole('dialog');

    await user.keyboard('{Escape}');

    await waitFor(() => {
      expect(trigger).toHaveFocus();
    });
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

  it('Escape сначала закрывает вложенный селект, а не весь лист', async () => {
    const onClose = vi.fn<() => void>();
    const user = userEvent.setup();

    render(
      <PopupSheet open onClose={onClose} title="Заголовок">
        <Select
          options={[
            { value: 'one', label: 'Один' },
            { value: 'two', label: 'Два' },
          ]}
        />
      </PopupSheet>,
    );

    await sheetReady();

    await user.click(screen.getByRole('combobox'));
    expect(await screen.findByRole('listbox')).toBeInTheDocument();

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('закрытие DatePicker внутри листа не снимает блокировку скролла', async () => {
    const onClose = vi.fn<() => void>();
    const user = userEvent.setup();

    render(
      <PopupSheet open onClose={onClose} title="Анкета">
        <DatePicker />
      </PopupSheet>,
    );

    await user.click(screen.getByRole('textbox'));
    const picker = await screen.findByRole('dialog', { name: 'Выберите дату' });
    await waitFor(() => {
      expect(picker).toHaveFocus();
    });

    await user.keyboard('{Escape}');

    expect(picker).not.toBeInTheDocument();
    expect(screen.getByRole('dialog', { name: 'Анкета' })).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
    expect(document.body.style.overflow).toBe('hidden');
    expect(document.body.style.position).toBe('fixed');
  });

  it('клик по дропдауну вложенного селекта не закрывает лист', async () => {
    const onClose = vi.fn<() => void>();
    const user = userEvent.setup();

    render(
      <PopupSheet open onClose={onClose} title="Заголовок">
        <Select
          options={[
            { value: 'one', label: 'Один' },
            { value: 'two', label: 'Два' },
          ]}
        />
      </PopupSheet>,
    );

    await sheetReady();

    await user.click(screen.getByRole('combobox'));
    await user.click(await screen.findByRole('option', { name: 'Два' }));

    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('closeLabel подписывает кнопку закрытия', () => {
    render(
      <PopupSheet open onClose={() => {}} closeLabel="Close">
        Текст
      </PopupSheet>,
    );

    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });

  it('отдаёт ref и атрибуты листа', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <PopupSheet
        open
        ref={ref}
        title="Заголовок"
        data-testid="sheet"
        aria-label="Лист"
      >
        Текст
      </PopupSheet>,
    );

    const sheet = screen.getByTestId('sheet');
    expect(sheet).toHaveClass('popup-sheet');
    expect(sheet).toHaveAttribute('role', 'dialog');
    expect(sheet).toHaveAttribute('aria-modal', 'true');
    expect(sheet).not.toHaveAttribute('title');
    expect(ref.current).toBe(sheet);
  });

  it('без open держит состояние сам: defaultOpen и закрытие крестиком', async () => {
    const onOpenChange = vi.fn<(open: boolean) => void>();
    const user = userEvent.setup();

    render(
      <PopupSheet defaultOpen onOpenChange={onOpenChange} title="Заголовок">
        Контент
      </PopupSheet>,
    );

    await sheetReady();
    await user.click(screen.getByRole('button', { name: 'Закрыть' }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('data-state рассказывает про анимацию закрытия', async () => {
    const { rerender } = render(
      <PopupSheet open title="Заголовок">
        Контент
      </PopupSheet>,
    );

    const dialog = await screen.findByRole('dialog');
    await waitFor(() => {
      expect(dialog).toHaveAttribute('data-state', 'open');
    });

    rerender(
      <PopupSheet open={false} title="Заголовок">
        Контент
      </PopupSheet>,
    );

    expect(dialog).toHaveAttribute('data-state', 'closed');
  });
});
