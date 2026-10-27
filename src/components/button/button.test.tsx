import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Button } from './button';

describe('Button', () => {
  it('рендерит button type="button" по умолчанию', () => {
    render(<Button>Сохранить</Button>);
    const button = screen.getByRole('button', { name: 'Сохранить' });
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveClass('button', 'button--default', 'button--md');
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

    await userEvent.click(screen.getByRole('button'));
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

  it('icon back ставит стрелку 20px перед текстом', () => {
    render(<Button icon="back">Назад</Button>);
    const button = screen.getByRole('button', { name: 'Назад' });
    const svg = button.querySelector('svg');

    expect(button.firstElementChild).toBe(svg);
    expect(svg).toHaveAttribute('width', '20');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });

  it('icon forward ставит стрелку после текста', () => {
    render(<Button icon="forward">Дальше</Button>);
    const button = screen.getByRole('button', { name: 'Дальше' });

    expect(button.lastElementChild?.tagName).toBe('svg');
  });

  it('loading крутит спиннер и не вызывает onClick', async () => {
    const onClick = vi.fn<() => void>();
    render(
      <Button loading onClick={onClick}>
        Сохранение
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Сохранение' });

    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toHaveClass('button--loading');
    expect(button.querySelector('.button__icon--spin')).not.toBeNull();

    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
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
});
