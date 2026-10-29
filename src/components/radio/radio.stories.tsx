import type { Meta, StoryObj } from '@storybook/react-vite';

import { Labeled, LabeledBlock } from '@/stories/labeled';
import { RadioGroup, RadioInput } from './radio';

const options = {
  display: 'grid',
  gap: 8,
} as const;

const meta = {
  title: 'Components/Radio',
  component: RadioInput,
  args: {
    label: 'Вариант',
    name: 'demo',
  },
} satisfies Meta<typeof RadioInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Alone: Story = {
  render: () => (
    <LabeledBlock title="вне группы">
      <Labeled label="default">
        <RadioInput name="alone" label="Вне группы" value="a" />
      </Labeled>
      <Labeled label="checked">
        <RadioInput name="alone" label="Тот же name" value="b" defaultChecked />
      </Labeled>
    </LabeledBlock>
  ),
};

export const Group: Story = {
  render: () => (
    <LabeledBlock title="группа">
      <Labeled label="default" wide maxWidth={360}>
        <RadioGroup label="Группа" name="group">
          <div style={options}>
            <RadioInput label="Первый" value="1" defaultChecked />
            <RadioInput label="Второй" value="2" />
            <RadioInput label="Ошибка" value="3" error />
            <RadioInput label="Выключен" value="5" disabled />
          </div>
        </RadioGroup>
      </Labeled>
      <Labeled label="error + checked" wide maxWidth={360}>
        <RadioGroup label="Ошибка и выбран" name="group-error">
          <RadioInput label="Ошибка и выбран" value="4" error defaultChecked />
        </RadioGroup>
      </Labeled>
      <Labeled label="disabled + checked" wide maxWidth={360}>
        <RadioGroup label="Выключен и выбран" name="group-disabled">
          <RadioInput
            label="Выключен и выбран"
            value="6"
            disabled
            defaultChecked
          />
        </RadioGroup>
      </Labeled>
    </LabeledBlock>
  ),
};
