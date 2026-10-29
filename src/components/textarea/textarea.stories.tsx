import type { Meta, StoryObj } from '@storybook/react-vite';

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
