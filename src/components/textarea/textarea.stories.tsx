import type { Meta, StoryObj } from '@storybook/react-vite';

import { CodeBlock } from '@/stories/code-block';
import { Labeled, LabeledBlock } from '@/stories/labeled';
import { storyStack } from '@/stories/story-stack';
import { TextArea } from './textarea';

const meta = {
  title: 'Components/TextArea',
  component: TextArea,
  args: {
    placeholder: 'Комментарий',
    maxLength: 120,
  },
} satisfies Meta<typeof TextArea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Sizes: Story = {
  render: () => (
    <LabeledBlock title="size">
      <Labeled label="sm" wide maxWidth={360}>
        <TextArea size="sm" placeholder="sm" />
      </Labeled>
      <Labeled label="md" wide maxWidth={360}>
        <TextArea placeholder="md" />
      </Labeled>
      <Labeled label="lg" wide maxWidth={360}>
        <TextArea size="lg" placeholder="lg" />
      </Labeled>
    </LabeledBlock>
  ),
};

export const States: Story = {
  render: () => (
    <div style={storyStack}>
      <LabeledBlock title="state">
        <Labeled label="default" wide maxWidth={360}>
          <TextArea placeholder="Комментарий" />
        </Labeled>
        <Labeled label="recommended" wide maxWidth={360}>
          <TextArea placeholder="Комментарий" recommended />
        </Labeled>
        <Labeled label="error" wide maxWidth={360}>
          <TextArea placeholder="Комментарий" error defaultValue="текст" />
        </Labeled>
        <Labeled label="recommended + error" wide maxWidth={360}>
          <TextArea recommended error defaultValue="спорно" />
        </Labeled>
        <Labeled label="readOnly" wide maxWidth={360}>
          <TextArea readOnly defaultValue="только чтение" />
        </Labeled>
        <Labeled label="disabled" wide maxWidth={360}>
          <TextArea disabled defaultValue="нельзя" />
        </Labeled>
      </LabeledBlock>
      <LabeledBlock title="counter">
        <Labeled label="maxLength" wide maxWidth={360}>
          <TextArea
            placeholder="Комментарий"
            maxLength={80}
            defaultValue="Уже набрано"
          />
        </Labeled>
        <Labeled label="counter=false" wide maxWidth={360}>
          <TextArea placeholder="Комментарий" maxLength={80} counter={false} />
        </Labeled>
      </LabeledBlock>
    </div>
  ),
};

const usageExample = `import { Field, TextArea } from '@de-kit/st-ui';

function CommentField() {
  return (
    <Field label="Комментарий" hint="Необязательно" hintPlacement="label">
      <TextArea name="comment" rows={4} placeholder="Например, пожелания" />
    </Field>
  );
}`;

const counterExample = `import { useState } from 'react';
import { Field, TextArea } from '@de-kit/st-ui';

function ReviewField() {
  const [text, setText] = useState('');

  return (
    <Field label="Отзыв" required>
      <TextArea
        rows={5}
        maxLength={500}
        value={text}
        onChange={e => setText(e.target.value)}
      />
      <p>{text.length} / 500</p>
    </Field>
  );
}`;

export const Usage: Story = {
  render: () => (
    <div style={storyStack}>
      <LabeledBlock title="Примеры кода">
        <Labeled label="В Field с подсказкой" wide maxWidth={720}>
          <CodeBlock code={usageExample} />
        </Labeled>
        <Labeled label="Контролируемый счётчик" wide maxWidth={720}>
          <CodeBlock code={counterExample} />
        </Labeled>
      </LabeledBlock>
    </div>
  ),
};
