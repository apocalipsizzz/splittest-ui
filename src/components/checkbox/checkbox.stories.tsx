import type { Meta, StoryObj } from '@storybook/react-vite';

import { Labeled, LabeledBlock } from '@/stories/labeled';
import { CheckboxInput } from './checkbox';

const meta = {
  title: 'Components/Checkbox',
  component: CheckboxInput,
  args: {
    label: 'Согласен',
  },
} satisfies Meta<typeof CheckboxInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const States: Story = {
  render: () => (
    <LabeledBlock title="state">
      <Labeled label="default">
        <CheckboxInput label="Не выбран" />
      </Labeled>
      <Labeled label="checked">
        <CheckboxInput label="Выбран" defaultChecked />
      </Labeled>
      <Labeled label="indeterminate">
        <CheckboxInput label="Частично" indeterminate />
      </Labeled>
      <Labeled label="indeterminate + checked">
        <CheckboxInput label="Частично и выбран" indeterminate defaultChecked />
      </Labeled>
      <Labeled label="disabled">
        <CheckboxInput label="Выключен" disabled />
      </Labeled>
      <Labeled label="disabled + checked">
        <CheckboxInput label="Выключен и выбран" disabled defaultChecked />
      </Labeled>
      <Labeled label="error">
        <CheckboxInput label="С ошибкой" error />
      </Labeled>
      <Labeled label="error + checked">
        <CheckboxInput label="Ошибка и выбран" error defaultChecked />
      </Labeled>
      <Labeled label="clickable=false">
        <CheckboxInput label="Квадрат не кликается" clickable={false} />
      </Labeled>
      <Labeled label="без label">
        <CheckboxInput />
      </Labeled>
    </LabeledBlock>
  ),
};
