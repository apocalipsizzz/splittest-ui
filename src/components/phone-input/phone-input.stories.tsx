import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { Field } from '@/components/field';
import { Form, FormSubmit } from '@/components/form';
import { Labeled, LabeledBlock } from '@/stories/labeled';
import { storyStack } from '@/stories/story-stack';
import { PhoneInput } from './phone-input';

const meta = {
  title: 'Components/PhoneInput',
  component: PhoneInput,
} satisfies Meta<typeof PhoneInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

const ControlledDemo = () => {
  const [phone, setPhone] = useState('');

  return (
    <div style={storyStack}>
      <Labeled label="controlled" wide maxWidth={360}>
        <PhoneInput value={phone} onAccept={setPhone} clearable />
      </Labeled>
      <p>Значение: {phone || '—'}</p>
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
          <PhoneInput />
        </Labeled>
        <Labeled label="size sm" wide maxWidth={360}>
          <PhoneInput size="sm" />
        </Labeled>
        <Labeled label="size lg" wide maxWidth={360}>
          <PhoneInput size="lg" />
        </Labeled>
        <Labeled label="error" wide maxWidth={360}>
          <PhoneInput error defaultValue="+7 (999) 1" />
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
        <Field label="Номер телефона" required>
          <PhoneInput name="phone" />
        </Field>
        <FormSubmit>Отправить</FormSubmit>
      </Form>
    </div>
  ),
};
