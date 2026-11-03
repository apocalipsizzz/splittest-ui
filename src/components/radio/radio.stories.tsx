import type { Meta, StoryObj } from '@storybook/react-vite';

import { CodeBlock } from '@/stories/code-block';
import { Labeled, LabeledBlock } from '@/stories/labeled';
import { storyStack } from '@/stories/story-stack';
import { FieldList } from '@/components/field/field-list';
import { RadioGroup, RadioInput } from './radio';

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
          <FieldList>
            <RadioInput label="Первый" value="1" defaultChecked />
            <RadioInput label="Второй" value="2" />
            <RadioInput label="Ошибка" value="3" error />
            <RadioInput label="Выключен" value="5" disabled />
          </FieldList>
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

export const Feedback: Story = {
  render: () => (
    <LabeledBlock title="подсказка и ошибка группы">
      <Labeled label="hint" wide maxWidth={360}>
        <RadioGroup
          label="Доставка"
          name="delivery-hint"
          hint="Курьер привозит до двери"
        >
          <FieldList>
            <RadioInput label="Курьер" value="courier" />
            <RadioInput label="Самовывоз" value="pickup" />
          </FieldList>
        </RadioGroup>
      </Labeled>
      <Labeled label="error" wide maxWidth={360}>
        <RadioGroup
          label="Доставка"
          name="delivery-error"
          error="Выберите способ доставки"
        >
          <FieldList>
            <RadioInput label="Курьер" value="courier" />
            <RadioInput label="Самовывоз" value="pickup" />
          </FieldList>
        </RadioGroup>
      </Labeled>
    </LabeledBlock>
  ),
};

const usageExample = `import { FieldList, RadioGroup, RadioInput } from '@de-kit/st-ui';

function DeliveryChoice() {
  return (
    <RadioGroup label="Доставка" name="delivery">
      <FieldList>
        <RadioInput label="Курьер" value="courier" defaultChecked />
        <RadioInput label="Самовывоз" value="pickup" />
      </FieldList>
    </RadioGroup>
  );
}`;

const controlledExample = `import { useState } from 'react';
import { FieldList, RadioGroup, RadioInput } from '@de-kit/st-ui';

function PlanPicker() {
  const [plan, setPlan] = useState('monthly');

  return (
    <RadioGroup label="Тариф" name="plan">
      <FieldList>
        <RadioInput
          label="Ежемесячно"
          value="monthly"
          checked={plan === 'monthly'}
          onChange={() => setPlan('monthly')}
        />
        <RadioInput
          label="Ежегодно"
          value="yearly"
          checked={plan === 'yearly'}
          onChange={() => setPlan('yearly')}
        />
      </FieldList>
    </RadioGroup>
  );
}`;

const feedbackExample = `import { FieldList, RadioGroup, RadioInput } from '@de-kit/st-ui';

function DeliveryChoice({ error }: { error?: string }) {
  return (
    <RadioGroup
      label="Доставка"
      name="delivery"
      hint="Курьер привозит до двери"
      error={error}
    >
      <FieldList>
        <RadioInput label="Курьер" value="courier" />
        <RadioInput label="Самовывоз" value="pickup" />
      </FieldList>
    </RadioGroup>
  );
}`;

export const Usage: Story = {
  render: () => (
    <div style={storyStack}>
      <LabeledBlock title="Примеры кода">
        <Labeled label="Группа с легендой" wide maxWidth={720}>
          <CodeBlock code={usageExample} />
        </Labeled>
        <Labeled label="Контролируемый выбор" wide maxWidth={720}>
          <CodeBlock code={controlledExample} />
        </Labeled>
        <Labeled label="Подсказка и ошибка" wide maxWidth={720}>
          <CodeBlock code={feedbackExample} />
        </Labeled>
      </LabeledBlock>
    </div>
  ),
};
