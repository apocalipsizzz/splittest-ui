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

  it('рисует ряд, текущую страницу и классы раскладки', () => {
    render(
      <Pagination
        className="mine"
        page={1}
        pageCount={99}
        layout="inline"
        range="regular"
        aria-label="Страницы списка"
        onPageChange={() => {}}
      />,
    );

    const nav = screen.getByRole('navigation', { name: 'Страницы списка' });
    expect(nav).toHaveClass(
      'pagination',
      'pagination--inline',
      'pagination--labeled',
      'mine',
    );
    expect(nav).not.toHaveClass('pagination--stacked');
    expect(pages()).toBe('1 2 3 4 5 6 7 8 ... 99');
    expect(screen.getByText('1')).toHaveAttribute('aria-current', 'page');
    expect(screen.getByText('1').tagName).toBe('BUTTON');
    expect(screen.getByRole('button', { name: 'Назад' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Вперёд' })).toBeEnabled();
  });

  it('меняет страницу по номеру, «Далее» и «Назад» и молчит на краях', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn<(page: number) => void>();

    const Controlled = () => {
      const [page, setPage] = useState(2);
      return (
        <Pagination
          page={page}
          pageCount={5}
          range="compact"
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

    await user.click(screen.getByRole('button', { name: 'Вперёд' }));
    expect(onPageChange).toHaveBeenLastCalledWith(5);
    expect(screen.getByRole('button', { name: 'Вперёд' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );

    await user.click(screen.getByRole('button', { name: 'Вперёд' }));
    expect(onPageChange).toHaveBeenCalledTimes(2);

    await user.click(screen.getByRole('button', { name: 'Назад' }));
    expect(onPageChange).toHaveBeenLastCalledWith(4);
  });

  it('disabled глушит и номера, и шаги', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn<(page: number) => void>();

    render(
      <Pagination
        disabled
        page={3}
        pageCount={9}
        range="compact"
        onPageChange={onPageChange}
      />,
    );

    await user.click(screen.getByRole('button', { name: '2' }));
    await user.click(screen.getByRole('button', { name: 'Назад' }));
    expect(onPageChange).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Назад' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Вперёд' })).toBeDisabled();
  });

  it('подписи и stacked/compact задаются пропами', () => {
    render(
      <Pagination
        page={1}
        pageCount={99}
        layout="stacked"
        range="compact"
        prevLabel="Previous"
        nextLabel="Next"
        onPageChange={() => {}}
      />,
    );

    expect(screen.getByRole('navigation')).toHaveClass('pagination--stacked');
    expect(screen.getByRole('button', { name: 'Previous' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled();
    expect(pages()).toBe('1 2 3 4 5 ... 99');
  });

  it('responsive на узком экране compact, на широком regular', () => {
    mockMatchMedia(false);
    const { unmount } = render(
      <Pagination page={1} pageCount={99} onPageChange={() => {}} />,
    );

    expect(screen.getByRole('navigation')).toHaveClass(
      'pagination--responsive',
    );
    expect(pages()).toBe('1 2 3 4 5 ... 99');
    unmount();

    mockMatchMedia(true);
    render(<Pagination page={1} pageCount={99} onPageChange={() => {}} />);
    expect(pages()).toBe('1 2 3 4 5 6 7 8 ... 99');
  });

  it('inline остаётся широким окном даже на узком экране', () => {
    mockMatchMedia(false);
    render(
      <Pagination
        page={1}
        pageCount={99}
        layout="inline"
        onPageChange={() => {}}
      />,
    );

    expect(pages()).toBe('1 2 3 4 5 6 7 8 ... 99');
  });

  it('свой range перекрывает пресет раскладки', () => {
    render(
      <Pagination
        page={8}
        pageCount={20}
        layout="stacked"
        range={{
          showAllUntil: 3,
          headUntil: 1,
          headSize: 1,
          siblingCount: 0,
          tailFrom: 0,
        }}
        onPageChange={() => {}}
      />,
    );

    expect(pages()).toBe('1 ... 8 ... 20');
  });

  it('меньше пяти страниц оставляет у шагов только стрелки', () => {
    const { rerender } = render(
      <Pagination
        page={2}
        pageCount={4}
        layout="inline"
        onPageChange={() => {}}
      />,
    );

    const prev = screen.getByRole('button', { name: 'Назад' });
    const next = screen.getByRole('button', { name: 'Вперёд' });
    expect(prev).not.toHaveTextContent('Назад');
    expect(next).not.toHaveTextContent('Вперёд');
    expect(screen.getByRole('navigation')).not.toHaveClass(
      'pagination--labeled',
    );
    expect(pages()).toBe('1 2 3 4');

    rerender(
      <Pagination
        page={1}
        pageCount={4}
        prevLabel="Previous"
        nextLabel="Next"
        onPageChange={() => {}}
      />,
    );
    expect(
      screen.getByRole('button', { name: 'Previous' }),
    ).not.toHaveTextContent('Previous');
    expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled();
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
  it('оставляет фокус на номере и на шаге, дошедшем до края', async () => {
    const user = userEvent.setup();

    const Controlled = () => {
      const [page, setPage] = useState(1);
      return (
        <Pagination
          page={page}
          pageCount={5}
          layout="inline"
          range="compact"
          onPageChange={setPage}
        />
      );
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
});
