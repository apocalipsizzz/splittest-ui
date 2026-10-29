import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';

import { Labeled, LabeledBlock } from '@/stories/labeled';
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

const sizeBox = {
  width: 160,
  height: 120,
  border: '1px dashed var(--color-input)',
} as const;

export const Sizes: Story = {
  render: () => (
    <LabeledBlock title="size">
      <Labeled label="16">
        <div style={sizeBox}>
          <Spinner size={16} label="16" />
        </div>
      </Labeled>
      <Labeled label="24">
        <div style={sizeBox}>
          <Spinner size={24} label="24" />
        </div>
      </Labeled>
      <Labeled label="64">
        <div style={sizeBox}>
          <Spinner size={64} label="64" />
        </div>
      </Labeled>
    </LabeledBlock>
  ),
};
