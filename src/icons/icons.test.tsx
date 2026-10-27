import { render, screen } from '@testing-library/react';

import {
  IconClose,
  IconGalleryNext,
  IconLabelWildberries,
  IllustrationTestBest,
  LogoVisa,
} from './index';

const svgOf = (container: HTMLElement) => {
  const svg = container.querySelector('svg');
  if (!svg) throw new Error('svg missing');
  return svg;
};

describe('icons', () => {
  it('монохром наследует цвет и скрыт от скринридера', () => {
    const { container } = render(<IconClose />);
    const svg = svgOf(container);

    expect(svg).toHaveAttribute('fill', 'currentColor');
    expect(svg).toHaveAttribute('width', '20');
    expect(svg).toHaveAttribute('height', '20');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg.querySelector('path')).not.toBeNull();
  });

  it('title и пропсы перекрывают дефолт', () => {
    const { container } = render(<IconClose title="Закрыть" width={32} />);

    expect(screen.getByRole('img', { name: 'Закрыть' })).toBe(svgOf(container));
    expect(svgOf(container)).toHaveAttribute('width', '32');
    expect(svgOf(container)).not.toHaveAttribute('aria-hidden');
  });

  it('высокая иконка не сплющивается в квадрат', () => {
    const { container } = render(<IconGalleryNext />);
    const svg = svgOf(container);

    expect(svg).toHaveAttribute('width', '20');
    expect(svg).toHaveAttribute('height', '40');
  });

  it('бренд сохраняет заливку, градиент уникален на экземпляр', () => {
    const { container } = render(
      <>
        <IconLabelWildberries />
        <IconLabelWildberries />
      </>,
    );
    const gradients = [...container.querySelectorAll('linearGradient')];
    const first = gradients[0];
    const second = gradients[1];
    if (!first || !second) throw new Error('gradient missing');

    expect(first.id).not.toBe('');
    expect(first.id).not.toBe(second.id);
    expect(container.querySelector('path')).toHaveAttribute(
      'fill',
      `url(#${first.id})`,
    );
  });

  it('логотип и иллюстрация сохраняют размер из файла', () => {
    const logo = render(<LogoVisa />);
    const picture = render(<IllustrationTestBest />);

    expect(svgOf(logo.container)).toHaveAttribute('width', '40');
    expect(svgOf(logo.container)).not.toHaveAttribute('fill', 'currentColor');
    expect(svgOf(picture.container)).toHaveAttribute('width', '240');
    expect(svgOf(picture.container)).toHaveAttribute('fill', 'currentColor');
    expect(
      svgOf(picture.container).querySelector('[stroke="currentColor"]'),
    ).not.toBeNull();
  });
});
