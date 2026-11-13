import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Pagination } from './pagination';

const pages = () =>
  Array.from(screen.getByRole('list').children, item => item.textContent).join(
    ' ',
  );

const mockMatchMedia = (matches: boolean) => {
  window.matchMedia = (query: string) =>
    ({
      matches,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }) as unknown as MediaQueryList;
};

describe('Pagination', () => {
  const original = window.matchMedia;

  afterEach(() => {
    window.matchMedia = original;
  });

  it('на широком экране рисует восемь номеров, «…» и последнюю', () => {
    mockMatchMedia(true);
    render(
      <Pagination
        className="mine"
        page={1}
        pageCount={99}
        aria-label="Страницы списка"
        onPageChange={() => {}}
      />,
    );

    const nav = screen.getByRole('navigation', { name: 'Страницы списка' });
    expect(nav).toHaveClass('pagination', 'mine');
    expect(nav).not.toHaveClass('pagination--few');
    expect(pages()).toBe('1 2 3 4 5 6 7 8 ... 99');
    expect(screen.getByText('1')).toHaveAttribute('aria-current', 'page');
    expect(screen.getByText('1').tagName).toBe('BUTTON');
    expect(screen.getByRole('button', { name: 'Назад' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Вперёд' })).toBeEnabled();
  });

  it('на узком экране рисует пять номеров', () => {
    mockMatchMedia(false);
    render(<Pagination page={1} pageCount={99} onPageChange={() => {}} />);

    expect(pages()).toBe('1 2 3 4 5 ... 99');
  });

  it('в конце списка уводит «…» к началу и гасит «Вперёд»', () => {
    mockMatchMedia(true);
    render(<Pagination page={99} pageCount={99} onPageChange={() => {}} />);

    expect(pages()).toBe('1 ... 92 93 94 95 96 97 98 99');
    expect(screen.getByRole('button', { name: 'Вперёд' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Назад' })).not.toHaveAttribute(
      'aria-disabled',
    );
  });

  it('меняет страницу по номеру, «Вперёд» и «Назад» и молчит на краях', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn<(page: number) => void>();

    const Controlled = () => {
      const [page, setPage] = useState(2);
      return (
        <Pagination
          page={page}
          pageCount={5}
          onPageChange={next => {
            onPageChange(next);
            setPage(next);
          }}
        />
      );
    };

    render(<Controlled />);

    await user.click(screen.getByRole('button', { name: '4' }));
    expect(onPageChange).toHaveBeenLastCalledWith(4);
    expect(screen.getByText('4')).toHaveAttribute('aria-current', 'page');

    const next = screen.getByRole('button', { name: 'Вперёд' });
    await user.click(next);
    expect(onPageChange).toHaveBeenLastCalledWith(5);

    await user.click(next);
    expect(onPageChange).toHaveBeenCalledTimes(2);

    await user.click(screen.getByRole('button', { name: 'Назад' }));
    expect(onPageChange).toHaveBeenLastCalledWith(4);
  });

  it('оставляет фокус на номере и на шаге, дошедшем до края', async () => {
    const user = userEvent.setup();

    const Controlled = () => {
      const [page, setPage] = useState(1);
      return <Pagination page={page} pageCount={5} onPageChange={setPage} />;
    };

    render(<Controlled />);

    await user.click(screen.getByRole('button', { name: '3' }));
    expect(screen.getByRole('button', { name: '3' })).toHaveFocus();
    expect(screen.getByRole('button', { name: '3' })).toHaveAttribute(
      'aria-current',
      'page',
    );

    const next = screen.getByRole('button', { name: 'Вперёд' });
    await user.click(next);
    await user.click(next);
    expect(next).toHaveFocus();
    expect(next).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByRole('button', { name: '5' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('disabled глушит и номера, и шаги', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn<(page: number) => void>();

    render(
      <Pagination
        disabled
        page={3}
        pageCount={9}
        onPageChange={onPageChange}
      />,
    );

    await user.click(screen.getByRole('button', { name: '2' }));
    await user.click(screen.getByRole('button', { name: 'Назад' }));
    expect(onPageChange).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Назад' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Вперёд' })).toBeDisabled();
  });

  it('меньше пяти страниц помечает ряд как узкий, имена шагов остаются', () => {
    const { rerender } = render(
      <Pagination
        page={2}
        pageCount={4}
        prevLabel="Previous"
        nextLabel="Next"
        onPageChange={() => {}}
      />,
    );

    expect(screen.getByRole('navigation')).toHaveClass('pagination--few');
    expect(pages()).toBe('1 2 3 4');
    expect(
      screen.getByRole('button', { name: 'Previous' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled();

    rerender(<Pagination page={2} pageCount={5} onPageChange={() => {}} />);
    expect(screen.getByRole('navigation')).not.toHaveClass('pagination--few');
  });

  it('не рисуется на одной странице и при битом pageCount', () => {
    const { rerender } = render(
      <Pagination page={1} pageCount={1} onPageChange={() => {}} />,
    );
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();

    rerender(
      <Pagination page={1} pageCount={Number.NaN} onPageChange={() => {}} />,
    );
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });
});
