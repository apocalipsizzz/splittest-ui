import type { Meta, StoryObj } from '@storybook/react-vite';

import { CodeBlock } from '@/stories/code-block';
import { Labeled, LabeledBlock } from '@/stories/labeled';
import { storyStack } from '@/stories/story-stack';
import { Progress } from './progress';

const meta = {
  title: 'Components/Progress',
  component: Progress,
  args: { 'value': 40, 'aria-label': 'Загрузка' },
  decorators: [
    Story => (
      <div style={{ width: 240 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Edges: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12, width: 240 }}>
      <Progress value={0} aria-label="Пусто" />
      <Progress value={100} aria-label="Готово" />
      <Progress
        value={65}
        aria-label="Плеер"
        style={{
          ['--progress-track' as string]: 'var(--color-sidebar)',
        }}
      />
    </div>
  ),
};

const usageExample = `import { Progress } from '@de-kit/st-ui';

<Progress value={40} aria-label="Загрузка: 40%" />

// Трек и заливка через переменные, раскладка — у родителя.
<Progress
  value={position}
  max={duration}
  aria-label="Воспроизведение"
  style={{ '--progress-track': 'var(--color-sidebar)' }}
/>`;

export const Usage: Story = {
  render: () => (
    <div style={storyStack}>
      <LabeledBlock title="Примеры кода">
        <Labeled label="полоска" wide maxWidth={720}>
          <CodeBlock code={usageExample} />
        </Labeled>
      </LabeledBlock>
    </div>
  ),
};
