import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';

import { IconArrowLeft } from '@/icons/icon-arrow-left';
import { IconArrowRight } from '@/icons/icon-arrow-right';
import { IconPreview } from '@/icons';
import { Button, type ButtonSize } from './button';

const row = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 12,
  alignItems: 'center',
} as const;

const imageCover = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  borderRadius: 'inherit',
} as const;

const PREVIEW_SRC =
  'https://api.splittest.ru/storage/min_images/34702/0bdca0b1-9060-4b1f-b15e-f88ac0945e88.png';

const iconSizes = ['sm', 'md', 'lg'] as const satisfies readonly ButtonSize[];

function ImageButton(props: {
  label: string;
  disabled?: boolean;
  loading?: boolean;
  href?: string;
}) {
  const { label, disabled, loading, href } = props;
  const content = (
    <>
      <img src={PREVIEW_SRC} alt="" style={imageCover} />
      <span className="button--image__icon">
        <IconPreview />
      </span>
    </>
  );

  if (href) {
    return (
      <Button asChild variant="image" aria-label={label} loading={loading}>
        <a href={href}>{content}</a>
      </Button>
    );
  }

  return (
    <Button
      variant="image"
      aria-label={label}
      disabled={disabled}
      loading={loading}
    >
      {content}
    </Button>
  );
}

function IconButton(props: {
  label: string;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  children?: ReactNode;
}) {
  const { label, size, disabled, loading, children } = props;

  return (
    <Button
      variant="icon"
      size={size}
      aria-label={label}
      disabled={disabled}
      loading={loading}
    >
      {children ?? <IconPreview />}
    </Button>
  );
}

const meta = {
  title: 'Components/Button',
  component: Button,
  args: {
    children: 'Кнопка',
    variant: 'default',
    size: 'md',
  },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['default', 'outline', 'link', 'image', 'icon'],
    },
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
    },
    loading: {
      control: 'boolean',
    },
    asChild: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Variants: Story = {
  render: () => (
    <div style={row}>
      <Button>Основная</Button>
      <Button variant="outline">Обводка</Button>
      <Button variant="link">Ссылка-текст</Button>
      <ImageButton label="Превью" />
      <IconButton label="Превью" />
    </div>
  ),
};

export const AsChild: Story = {
  render: () => (
    <div style={row}>
      <Button asChild>
        <a href="https://example.com">Ссылка</a>
      </Button>
      <Button asChild variant="outline">
        <a href="https://example.com">Обводка</a>
      </Button>
      <Button asChild variant="link">
        <a href="https://example.com">Текст</a>
      </Button>
      <Button asChild variant="icon" aria-label="Превью">
        <a href="https://example.com">
          <IconPreview />
        </a>
      </Button>
      <Button asChild disabled>
        <a href="https://example.com">Недоступна</a>
      </Button>
      <Button asChild loading>
        <a href="https://example.com">Загрузка</a>
      </Button>
    </div>
  ),
};

export const Image: Story = {
  render: () => (
    <div style={row}>
      <ImageButton label="Превью" />
      <ImageButton label="Превью, загрузка" loading />
      <ImageButton label="Превью, недоступно" disabled />
      <ImageButton label="Превью, ссылка" href="https://example.com" />
    </div>
  ),
};

export const Icon: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      <div style={row}>
        {iconSizes.map(size => (
          <IconButton key={size} size={size} label={`Иконка ${size}`} />
        ))}
      </div>
      <div style={row}>
        <IconButton label="Превью" />
        <IconButton label="Загрузка" loading />
        <IconButton label="Недоступно" disabled />
      </div>
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      <div style={row}>
        <Button>Обычная</Button>
        <Button disabled>disabled</Button>
        <Button loading>loading</Button>
      </div>
      <div style={row}>
        <Button variant="outline">outline</Button>
        <Button variant="outline" disabled>
          disabled
        </Button>
        <Button variant="outline" loading>
          loading
        </Button>
      </div>
      <div style={row}>
        <Button variant="link">link</Button>
        <Button variant="link" disabled>
          disabled
        </Button>
        <Button variant="link" loading>
          loading
        </Button>
      </div>
      <div style={row}>
        <IconButton label="icon" />
        <IconButton label="icon, недоступно" disabled />
        <IconButton label="icon, загрузка" loading />
      </div>
      <div style={row}>
        <ImageButton label="image" />
        <ImageButton label="image, недоступно" disabled />
        <ImageButton label="image, загрузка" loading />
      </div>
    </div>
  ),
};

export const Icons: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      <div style={row}>
        <Button>
          <IconArrowLeft width={20} height={20} />
          Назад
        </Button>
        <Button>
          Дальше
          <IconArrowRight width={20} height={20} />
        </Button>
        <Button loading>Сохранение</Button>
      </div>
      <div style={row}>
        <Button variant="outline">
          <IconArrowLeft width={20} height={20} />
          Назад
        </Button>
        <Button variant="outline">
          Дальше
          <IconArrowRight width={20} height={20} />
        </Button>
        <Button variant="outline" loading>
          Загрузка
        </Button>
      </div>
      <div style={row}>
        <Button variant="link">
          <IconArrowLeft width={20} height={20} />
          Назад
        </Button>
        <Button variant="link">
          Дальше
          <IconArrowRight width={20} height={20} />
        </Button>
        <Button variant="link" loading>
          Загрузка
        </Button>
      </div>
      <div style={row}>
        <IconButton label="Назад">
          <IconArrowLeft width={20} height={20} />
        </IconButton>
        <IconButton label="Дальше">
          <IconArrowRight width={20} height={20} />
        </IconButton>
        <IconButton label="Превью" />
      </div>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12, width: 320 }}>
      <div style={row}>
        <Button size="sm">sm</Button>
        <Button size="md">md</Button>
        <Button size="lg">lg</Button>
      </div>
      <Button fullWidth>На всю ширину</Button>
      <Button fullWidth size="lg" variant="outline">
        lg outline
      </Button>
      <Button fullWidth loading>
        Загрузка на всю ширину
      </Button>
      <div style={row}>
        {iconSizes.map(size => (
          <IconButton key={size} size={size} label={`Иконка ${size}`} />
        ))}
      </div>
    </div>
  ),
};
