import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Spinner } from './spinner';

describe('Spinner', () => {
  it('по умолчанию центрируется и рисует svg размером size', () => {
    const { container } = render(<Spinner />);
    const root = container.firstElementChild;
    expect(root).toHaveClass('spinner');
    expect(root).not.toHaveClass('spinner--top');
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '64');
    expect(svg).toHaveAttribute('height', '64');
    expect(svg).toHaveAttribute('fill', 'var(--color-muted)');
    expect(container.querySelectorAll('circle')).toHaveLength(8);
  });

  it('size задаёт ширину и высоту svg', () => {
    const { container } = render(<Spinner size={24} />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '24');
    expect(svg).toHaveAttribute('height', '24');
  });

  it('data-testid садится на обёртку, className не затирает spinner, role остаётся status', () => {
    render(
      <Spinner data-testid="loader" className="extra" role="presentation" />,
    );
    const status = screen.getByTestId('loader');
    expect(status).toHaveClass('spinner', 'extra');
    expect(status).toHaveAttribute('role', 'status');
    expect(status).toHaveAccessibleName('Загрузка');
  });

  it('position=top вешает модификатор', () => {
    const { container } = render(<Spinner position="top" />);
    expect(container.firstElementChild).toHaveClass('spinner', 'spinner--top');
  });

  it('объявляет статус «Загрузка»', () => {
    render(<Spinner />);
    const status = screen.getByRole('status', { name: 'Загрузка' });
    expect(status.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it('анимацию ведёт CSS: у каждой точки своя задержка, SMIL нет', () => {
    const { container } = render(<Spinner />);

    expect(container.querySelector('animate')).toBeNull();
    const dots = container.querySelectorAll('.spinner__dot');
    expect(dots).toHaveLength(8);
    expect(dots[0]?.getAttribute('style')).toContain('--spinner-dot-delay: 0s');
    expect(dots[4]?.getAttribute('style')).toContain(
      '--spinner-dot-delay: 0.5s',
    );
  });

  it('label переопределяет подпись', () => {
    render(<Spinner label="Считаем" />);
    expect(screen.getByRole('status', { name: 'Считаем' })).toBeInTheDocument();
  });
});
