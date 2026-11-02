import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { Field } from '@/components/field';
import { Form, FormSubmit } from '@/components/form';
import { Labeled, LabeledBlock } from '@/stories/labeled';
import { storyStack } from '@/stories/story-stack';
import { DatePicker } from './date-picker';

const meta = {
  title: 'Components/DatePicker',
  component: DatePicker,
  args: {
    minAge: 18,
    title: 'Дата рождения',
  },
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

const ControlledDemo = () => {
  const [birth, setBirth] = useState<Date | null>(null);

  return (
    <div style={storyStack}>
      <Labeled label="controlled" wide maxWidth={360}>
        <DatePicker value={birth} onChange={setBirth} />
      </Labeled>
      <p>Значение: {birth ? birth.toLocaleDateString('ru') : '—'}</p>
    </div>
  );
};

export const Controlled: Story = {
  render: () => <ControlledDemo />,
};

export const States: Story = {
  render: () => (
    <div style={storyStack}>
      <LabeledBlock title="state">
        <Labeled label="default" wide maxWidth={360}>
          <DatePicker />
        </Labeled>
        <Labeled label="filled" wide maxWidth={360}>
          <DatePicker value={new Date(1990, 2, 15)} onChange={() => {}} />
        </Labeled>
        <Labeled label="error" wide maxWidth={360}>
          <DatePicker error value={null} onChange={() => {}} />
        </Labeled>
        <Labeled label="disabled" wide maxWidth={360}>
          <DatePicker disabled value={new Date(1990, 2, 15)} />
        </Labeled>
      </LabeledBlock>
    </div>
  ),
};

export const InForm: Story = {
  render: () => (
    <div style={{ maxWidth: 480 }}>
      <Form
        onSubmit={async () => {
          await new Promise(resolve => setTimeout(resolve, 700));
        }}
      >
        <Field label="Дата рождения" required>
          <DatePicker name="birth" />
        </Field>
        <FormSubmit>Отправить</FormSubmit>
      </Form>
    </div>
  ),
};
