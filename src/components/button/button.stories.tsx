import type { Meta, StoryObj } from '@storybook/react-vite';

import { IconArrowLeft } from '@/icons/icon-arrow-left';
import { IconArrowRight } from '@/icons/icon-arrow-right';
import { Button } from './button';
import { IconPreview } from '@/icons';

const row = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 12,
  alignItems: 'center',
} as const;

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
      options: ['default', 'outline', 'link'],
    },
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
    },
    loading: {
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
      <Button href="https://example.com">Как ссылка</Button>
      <Button href="https://example.com" variant="outline">
        Ссылка с обводкой
      </Button>
      <Button href="https://example.com" variant="link">
        Ссылка-текст
      </Button>
      <Button variant="image">
        <img
          src="https://api.splittest.ru/storage/min_images/34702/0bdca0b1-9060-4b1f-b15e-f88ac0945e88.png"
          alt=""
        />
        <span className="button--image__icon">
          <IconPreview />
        </span>
      </Button>
      <Button variant="icon">
        <IconPreview />
      </Button>
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      <div style={row}>
        <Button>Обычная</Button>
        <Button disabled>disabled</Button>
      </div>
      <div style={row}>
        <Button variant="outline">outline</Button>
        <Button variant="outline" disabled>
          disabled
        </Button>
      </div>
      <div style={row}>
        <Button variant="link">link</Button>
        <Button variant="link" disabled>
          disabled
        </Button>
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
        <Button size="sm" variant="icon">
          sm
        </Button>
        <Button size="md" variant="icon">
          md
        </Button>
        <Button size="lg" variant="icon">
          lg
        </Button>
      </div>
    </div>
  ),
};
