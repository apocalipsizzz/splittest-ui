import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';

import { Spinner } from './spinner';

const meta = {
  title: 'Components/Spinner',
  component: Spinner,
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

// Спиннер тянется по родителю, поэтому высоту для показа задаёт история.
const inBox: Decorator = Story => (
  <div style={{ height: 240, border: '1px dashed var(--color-input)' }}>
    <Story />
  </div>
);

export const Center: Story = {
  decorators: [inBox],
};

export const Top: Story = {
  args: { position: 'top' },
  decorators: [inBox],
};

export const Small: Story = {
  args: { size: 24, label: 'Считаем' },
  decorators: [inBox],
};

export const Sizes: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 12,
      }}
    >
      <div style={{ height: 120, border: '1px dashed var(--color-input)' }}>
        <Spinner size={16} label="16" />
      </div>
      <div style={{ height: 120, border: '1px dashed var(--color-input)' }}>
        <Spinner size={24} label="24" />
      </div>
      <div style={{ height: 120, border: '1px dashed var(--color-input)' }}>
        <Spinner size={64} label="64" />
      </div>
    </div>
  ),
};
