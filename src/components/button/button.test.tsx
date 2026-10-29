import { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Button, type ButtonLinkProps, type ButtonProps } from './button';

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

  it('loading на ссылке ставит aria-busy и не вызывает onClick', () => {
    const onClick = vi.fn<() => void>();
    render(
      <Button href="/prices" loading onClick={onClick}>
        Тарифы
      </Button>,
    );

    const link = screen.getByRole('link', { name: 'Тарифы' });
    expect(link).toHaveAttribute('aria-busy', 'true');
    expect(link).not.toHaveAttribute('disabled');
    expect(fireEvent.click(link)).toBe(false);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('href рендерит ссылку без type', () => {
    render(<Button href="/prices">Тарифы</Button>);
    const link = screen.getByRole('link', { name: 'Тарифы' });
    expect(link).toHaveAttribute('href', '/prices');
    expect(link).not.toHaveAttribute('type');
    expect(link).toHaveClass('button');
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
      children: 'Кнопка',
      disabled: false,
      className: 'x',
      role: 'button',
      tabIndex: 0,
      'aria-disabled': false,
      'aria-pressed': undefined,
      'aria-roledescription': 'draggable',
      'aria-describedby': 'hint',
      ref: (element: HTMLElement | null) => {
        node = element;
      },
    };

    render(<Button {...props} />);
    expect(node).toBeInstanceOf(HTMLButtonElement);

    const linkProps: ButtonLinkProps = {
      href: '/prices',
      children: 'Тарифы',
      ref: (element: HTMLElement | null) => {
        node = element;
      },
    };
    render(<Button {...linkProps} />);
    expect(node).toBeInstanceOf(HTMLAnchorElement);
  });

  it('ref без href — button, с href — anchor', () => {
    const buttonRef = createRef<HTMLButtonElement>();
    const anchorRef = createRef<HTMLAnchorElement>();

    render(
      <>
        <Button ref={buttonRef}>Кнопка</Button>
        <Button href="/prices" ref={anchorRef}>
          Тарифы
        </Button>
      </>,
    );

    expect(buttonRef.current).toBeInstanceOf(HTMLButtonElement);
    expect(anchorRef.current).toBeInstanceOf(HTMLAnchorElement);

    void (
      <>
        {/* @ts-expect-error href сужает ref до HTMLAnchorElement */}
        <Button href="/prices" ref={buttonRef}>
          Тарифы
        </Button>
        {/* @ts-expect-error без href ref — HTMLButtonElement */}
        <Button ref={anchorRef}>Кнопка</Button>
      </>
    );
  });

  it('loading у ссылки объявляет aria-disabled и aria-busy', () => {
    render(
      <Button href="/prices" loading>
        Тарифы
      </Button>,
    );

    const link = screen.getByRole('link', { name: 'Тарифы' });
    expect(link).toHaveAttribute('aria-disabled', 'true');
    expect(link).toHaveAttribute('aria-busy', 'true');
  });
});
