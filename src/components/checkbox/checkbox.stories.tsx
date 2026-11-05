import type { Meta, StoryObj } from '@storybook/react-vite';

import { CodeBlock } from '@/stories/code-block';
import { Labeled, LabeledBlock } from '@/stories/labeled';
import { storyStack } from '@/stories/story-stack';
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
      <Labeled label="ссылка">
        <CheckboxInput
          label="Принимаю "
          urlLabel="оферту"
          url="https://splittest.ru/agreement.pdf"
        />
      </Labeled>
    </LabeledBlock>
  ),
};

const usageExample = `import { CheckboxInput, Field } from '@de-kit/st-ui';

function ConsentField() {
  return (
    <Field error="Отметьте, чтобы продолжить">
      <CheckboxInput name="consent" label="Согласен на обработку данных" />
    </Field>
  );
}`;

const selectAllExample = `import { useState } from 'react';
import { CheckboxInput } from '@de-kit/st-ui';

const items = ['Почта', 'Телефон', 'Чат'];

function FilterList() {
  const [selected, setSelected] = useState<string[]>([]);
  const allChecked = selected.length === items.length;

  const toggle = (item: string) => {
    setSelected(prev =>
      prev.includes(item) ? prev.filter(v => v !== item) : [...prev, item],
    );
  };

  return (
    <>
      <CheckboxInput
        label="Выбрать все"
        checked={allChecked}
        indeterminate={selected.length > 0 && !allChecked}
        onChange={() => setSelected(allChecked ? [] : items)}
      />
      {items.map(item => (
        <CheckboxInput
          key={item}
          label={item}
          checked={selected.includes(item)}
          onChange={() => toggle(item)}
        />
      ))}
    </>
  );
}`;

export const Usage: Story = {
  render: () => (
    <div style={storyStack}>
      <LabeledBlock title="Примеры кода">
        <Labeled label="Согласие в Field" wide maxWidth={720}>
          <CodeBlock code={usageExample} />
        </Labeled>
        <Labeled label="Выбрать все с indeterminate" wide maxWidth={720}>
          <CodeBlock code={selectAllExample} />
        </Labeled>
      </LabeledBlock>
    </div>
  ),
};
