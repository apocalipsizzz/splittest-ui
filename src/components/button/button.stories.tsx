import type { Meta, StoryObj } from '@storybook/react-vite';

import { IconArrowLeft } from '../../icons/icon-arrow-left';
import { IconArrowRight } from '../../icons/icon-arrow-right';
import { IconSpinner } from '../../icons/icon-spinner';
import { Button } from './button';

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
        <Button>
          <IconSpinner className="button__icon--spin" width={20} height={20} />
          Сохранение
        </Button>
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
        <Button variant="outline">
          <IconSpinner className="button__icon--spin" width={20} height={20} />
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
        <Button variant="link">
          <IconSpinner className="button__icon--spin" width={20} height={20} />
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
    </div>
  ),
};
