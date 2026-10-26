import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Button } from './button';
import styles from './button.module.scss';

describe('Button', () => {
  it('рендерит button type="button" по умолчанию', () => {
    render(<Button>Сохранить</Button>);
    expect(screen.getByRole('button', { name: 'Сохранить' })).toHaveAttribute(
      'type',
      'button',
    );
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
    expect(link.className).toContain(styles.button);
  });

  it('outline и fullWidth попадают в className', () => {
    render(
      <Button outline fullWidth>
        Ок
      </Button>,
    );
    const className = screen.getByRole('button').className;
    expect(className).toContain(styles.outline);
    expect(className).toContain(styles.fullWidth);
  });
});
