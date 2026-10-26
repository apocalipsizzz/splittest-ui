import type { Meta, StoryObj } from '@storybook/react-vite';

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
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Variants: Story = {
  render: () => (
    <div style={row}>
      <Button>Основная</Button>
      <Button outline>Обводка</Button>
      <Button link>Ссылка-текст</Button>
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
        <Button outline>outline</Button>
        <Button outline disabled>
          disabled
        </Button>
      </div>
      <div style={row}>
        <Button link>link</Button>
        <Button link disabled>
          disabled
        </Button>
      </div>
    </div>
  ),
};

export const FullWidth: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12, width: 320 }}>
      <Button fullWidth>На всю ширину</Button>
      <Button fullWidth outline>
        Отмена
      </Button>
    </div>
  ),
};
