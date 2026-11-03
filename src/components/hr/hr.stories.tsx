import type { Meta, StoryObj } from '@storybook/react-vite';

import { CodeBlock } from '@/stories/code-block';
import { Labeled, LabeledBlock } from '@/stories/labeled';
import { storyStack } from '@/stories/story-stack';
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

const usageExample = `import { HR } from '@de-kit/st-ui';

function Article() {
  return (
    <>
      <p>Первый блок текста</p>
      <HR />
      <p>Второй блок текста</p>
    </>
  );
}`;

const classNameExample = `import { HR } from '@de-kit/st-ui';

// Отступы уже заданы компонентом, свой класс их переопределит
function Catalog() {
  return (
    <>
      <Cards />
      <HR className="catalog__divider" />
      <Filters />
    </>
  );
}`;

export const Usage: Story = {
  render: () => (
    <div style={storyStack}>
      <LabeledBlock title="Примеры кода">
        <Labeled label="Между блоками" wide maxWidth={720}>
          <CodeBlock code={usageExample} />
        </Labeled>
        <Labeled label="Свой класс для отступов" wide maxWidth={720}>
          <CodeBlock code={classNameExample} />
        </Labeled>
      </LabeledBlock>
    </div>
  ),
};
