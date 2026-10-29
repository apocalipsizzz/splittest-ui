import { createRef, type ReactNode } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Button, type ButtonProps } from './button';

describe('Button', () => {
  it('рендерит button type="button" по умолчанию', () => {
    render(<Button>Сохранить</Button>);
    const button = screen.getByRole('button', { name: 'Сохранить' });
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveClass('button');
    expect(button).not.toHaveClass('button--default', 'button--md');
  });

  it('не перебивает type', () => {
    render(<Button type="submit">Отправить</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
  });

  it('disabled блокирует клик', async () => {
    const onClick = vi.fn<() => void>();
    render(
      <Button disabled onClick={onClick}>
        Сохранить
      </Button>,
    );

    const button = screen.getByRole('button');
    expect(button).not.toHaveClass('button--disabled');
    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('loading ставит aria-busy и не вызывает onClick', async () => {
    const onClick = vi.fn<() => void>();
    render(
      <Button loading onClick={onClick}>
        Сохранить
      </Button>,
    );

    const button = screen.getByRole('button', { name: 'Сохранить' });
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toBeDisabled();
    expect(button.querySelector('.button__label')).toHaveTextContent(
      'Сохранить',
    );
    expect(button.querySelector('.button__icon--spin')).toBeInTheDocument();

    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('variant и size попадают в className', () => {
    render(
      <Button variant="outline" size="sm">
        Ок
      </Button>,
    );
    expect(screen.getByRole('button')).toHaveClass(
      'button',
      'button--outline',
      'button--sm',
    );
  });

  it('children остаются в том порядке, как переданы', () => {
    render(
      <Button>
        <span>Назад</span>
        <span>иконка</span>
      </Button>,
    );
    const button = screen.getByRole('button');

    expect(button.textContent).toBe('Назадиконка');
    expect(button.children).toHaveLength(2);
  });

  it('fullWidth растягивает кнопку, размер остаётся своим', () => {
    render(
      <Button fullWidth size="lg">
        Дальше
      </Button>,
    );
    expect(screen.getByRole('button')).toHaveClass(
      'button--lg',
      'button--full-width',
    );
  });

  it('ButtonProps принимает ref на HTMLElement', () => {
    let node: HTMLElement | null = null;
    const props: ButtonProps = {
      'children': 'Кнопка',
      'disabled': false,
      'className': 'x',
      'role': 'button',
      'tabIndex': 0,
      'aria-disabled': false,
      'aria-pressed': undefined,
      'aria-roledescription': 'draggable',
      'aria-describedby': 'hint',
      'ref': (element: HTMLElement | null) => {
        node = element;
      },
    };

    render(<Button {...props} />);
    expect(node).toBeInstanceOf(HTMLButtonElement);
  });

  it('ref без asChild — button', () => {
    const buttonRef = createRef<HTMLButtonElement>();
    const anchorRef = createRef<HTMLAnchorElement>();

    render(<Button ref={buttonRef}>Кнопка</Button>);
    expect(buttonRef.current).toBeInstanceOf(HTMLButtonElement);

    void (
      <>
        {/* @ts-expect-error ref кнопки — HTMLButtonElement */}
        <Button ref={anchorRef}>Кнопка</Button>
      </>
    );
  });

  it('asChild вешает классы на ребёнка и не рисует button', () => {
    render(
      <Button asChild variant="outline" size="sm" fullWidth className="extra">
        <a href="/prices" className="child">
          Тарифы
        </a>
      </Button>,
    );

    const link = screen.getByRole('link', { name: 'Тарифы' });
    expect(link.tagName).toBe('A');
    expect(link).toHaveClass(
      'button',
      'button--outline',
      'button--sm',
      'button--full-width',
      'extra',
      'child',
    );
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('asChild вызывает onClick ребёнка и кнопки', async () => {
    const onChildClick =
      vi.fn<(event: { defaultPrevented: boolean }) => void>();
    const onClick = vi.fn<() => void>();

    render(
      <Button asChild onClick={onClick}>
        <button type="button" onClick={onChildClick}>
          Тарифы
        </button>
      </Button>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Тарифы' }));
    expect(onChildClick).toHaveBeenCalledOnce();
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('asChild не зовёт onClick кнопки, если ребёнок отменил событие', () => {
    const onClick = vi.fn<() => void>();

    render(
      <Button asChild onClick={onClick}>
        <a
          href="/prices"
          onClick={event => {
            event.preventDefault();
          }}
        >
          Тарифы
        </a>
      </Button>,
    );

    fireEvent.click(screen.getByRole('link', { name: 'Тарифы' }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('asChild loading блокирует клик и оставляет спиннер внутри ребёнка', () => {
    const onClick = vi.fn<() => void>();
    const onChildClick = vi.fn<() => void>();

    render(
      <Button asChild loading onClick={onClick}>
        <a href="/prices" onClick={onChildClick}>
          Тарифы
        </a>
      </Button>,
    );

    const link = screen.getByRole('link', { name: 'Тарифы' });
    expect(link).toHaveAttribute('aria-busy', 'true');
    expect(link).toHaveAttribute('aria-disabled', 'true');
    expect(link).not.toHaveAttribute('disabled');
    expect(link.querySelector('.button__icon--spin')).toBeInTheDocument();
    expect(fireEvent.click(link)).toBe(false);
    expect(onClick).not.toHaveBeenCalled();
    expect(onChildClick).not.toHaveBeenCalled();
  });

  it('asChild disabled на button-ребёнке выключает его и не подменяет type', () => {
    const onClick = vi.fn<() => void>();

    render(
      <Button asChild disabled onClick={onClick}>
        <button type="submit">Отправить</button>
      </Button>,
    );

    const button = screen.getByRole('button', { name: 'Отправить' });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('type', 'submit');
    expect(button).toHaveClass('button');
  });

  it('asChild по умолчанию ставит type="button" на button-ребёнка', () => {
    render(
      <Button asChild>
        <button>Сохранить</button>
      </Button>,
    );

    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  it('asChild disabled на ссылке не навигирует', () => {
    const onClick = vi.fn<() => void>();

    render(
      <Button asChild disabled onClick={onClick}>
        <a href="/prices">Тарифы</a>
      </Button>,
    );

    const link = screen.getByRole('link', { name: 'Тарифы' });
    expect(link).toHaveAttribute('aria-disabled', 'true');
    expect(link).not.toHaveAttribute('disabled');
    expect(fireEvent.click(link)).toBe(false);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('asChild собирает ref кнопки и ребёнка на одном узле', () => {
    const buttonRef = createRef<HTMLElement>();
    const childRef = createRef<HTMLAnchorElement>();

    render(
      <Button asChild ref={buttonRef}>
        <a href="/prices" ref={childRef}>
          Тарифы
        </a>
      </Button>,
    );

    expect(buttonRef.current).toBeInstanceOf(HTMLAnchorElement);
    expect(buttonRef.current).toBe(childRef.current);
  });

  it('asChild прокидывает className в свой компонент', () => {
    function Link(props: {
      href: string;
      className?: string;
      children?: ReactNode;
    }) {
      const { href, className, children } = props;
      return (
        <a href={href} className={className}>
          {children}
        </a>
      );
    }

    render(
      <Button asChild variant="outline">
        <Link href="/prices">Тарифы</Link>
      </Button>,
    );

    expect(screen.getByRole('link', { name: 'Тарифы' })).toHaveClass(
      'button',
      'button--outline',
    );
  });

  it('asChild без элемента кидает ошибку', () => {
    expect(() =>
      render(
        // @ts-expect-error asChild ждёт элемент, не текст
        <Button asChild>Текст</Button>,
      ),
    ).toThrow('Button с asChild ждёт ровно один React-элемент.');
  });
});
