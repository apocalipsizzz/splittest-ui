import type { Meta, StoryObj } from '@storybook/react-vite';

import { HR } from './hr';

const meta = {
  title: 'Components/HR',
  component: HR,
} satisfies Meta<typeof HR>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Between: Story = {
  render: () => (
    <div style={{ maxWidth: 480 }}>
      <p>Блок выше</p>
      <HR />
      <p>Блок ниже</p>
    </div>
  ),
};
