import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';

import { CodeBlock } from '@/stories/code-block';
import { Labeled, LabeledBlock } from '@/stories/labeled';
import { storyStack } from '@/stories/story-stack';
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

const usageExample = `import { Spinner } from '@de-kit/st-ui';

// Спиннер тянется по родителю, поэтому родителю нужна высота
function CatalogLoader() {
  return (
    <div style={{ height: 240 }}>
      <Spinner label="Загружаем каталог" />
    </div>
  );
}`;

const resultsExample = `import { Spinner } from '@de-kit/st-ui';

function Results({ isLoading, items }) {
  if (isLoading) {
    return <Spinner position="top" />;
  }

  return <ResultList items={items} />;
}`;

const inlineExample = `import { Spinner } from '@de-kit/st-ui';

function Counter() {
  return <Spinner size={24} label="Считаем" />;
}`;

export const Usage: Story = {
  render: () => (
    <div style={storyStack}>
      <LabeledBlock title="Примеры кода">
        <Labeled label="Блок на всю ширину" wide maxWidth={720}>
          <CodeBlock code={usageExample} />
        </Labeled>
        <Labeled label="Вместо содержимого" wide maxWidth={720}>
          <CodeBlock code={resultsExample} />
        </Labeled>
        <Labeled label="Маленький с подписью" wide maxWidth={720}>
          <CodeBlock code={inlineExample} />
        </Labeled>
      </LabeledBlock>
    </div>
  ),
};
