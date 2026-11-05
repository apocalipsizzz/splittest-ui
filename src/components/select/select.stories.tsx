import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { Field } from '@/components/field';
import { Form, FormSubmit } from '@/components/form';
import { CodeBlock } from '@/stories/code-block';
import { Labeled, LabeledBlock } from '@/stories/labeled';
import { storyStack } from '@/stories/story-stack';
import { Select, type SelectOption } from './select';

const CITIES: SelectOption[] = [
  { value: 'msk', label: 'Москва' },
  { value: 'spb', label: 'Санкт-Петербург' },
  { value: 'ekb', label: 'Екатеринбург' },
  { value: 'kzn', label: 'Казань', disabled: true },
  { value: 'nsk', label: 'Новосибирск' },
  { value: 'nn', label: 'Нижний Новгород' },
];

const meta = {
  title: 'Components/Select',
  component: Select,
  args: {
    options: CITIES,
    placeholder: 'Город',
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

const ControlledDemo = () => {
  const [city, setCity] = useState<string | null>(null);

  return (
    <div style={storyStack}>
      <Labeled label="controlled" wide maxWidth={360}>
        <Select
          options={CITIES}
          placeholder="Город"
          value={city}
          onChange={setCity}
        />
      </Labeled>
      <p>Значение: {city ?? '—'}</p>
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
          <Select options={CITIES} placeholder="Город" />
        </Labeled>
        <Labeled label="filled" wide maxWidth={360}>
          <Select options={CITIES} value="msk" onChange={() => {}} />
        </Labeled>
        <Labeled label="error" wide maxWidth={360}>
          <Select options={CITIES} error value={null} onChange={() => {}} />
        </Labeled>
        <Labeled label="disabled" wide maxWidth={360}>
          <Select options={CITIES} disabled value="spb" />
        </Labeled>
      </LabeledBlock>
      <LabeledBlock title="size">
        <Labeled label="sm" wide maxWidth={360}>
          <Select options={CITIES} size="sm" placeholder="sm" />
        </Labeled>
        <Labeled label="md" wide maxWidth={360}>
          <Select options={CITIES} placeholder="md" />
        </Labeled>
        <Labeled label="lg" wide maxWidth={360}>
          <Select options={CITIES} size="lg" placeholder="lg" />
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
        <Field label="Город" required>
          <Select name="city" options={CITIES} placeholder="Город" />
        </Field>
        <FormSubmit>Отправить</FormSubmit>
      </Form>
    </div>
  ),
};

const usageExample = `import { useState } from 'react';
import { Select } from '@de-kit/st-ui';

const cities = [
  { value: 'msk', label: 'Москва' },
  { value: 'spb', label: 'Санкт-Петербург' },
];

function CitySelect() {
  const [city, setCity] = useState<string | null>(null);

  return (
    <Select
      options={cities}
      placeholder="Город"
      value={city}
      onChange={setCity}
    />
  );
}`;

const formExample = `import { Field, Form, FormSubmit, Select } from '@de-kit/st-ui';

function ProfileForm() {
  return (
    <Form onSubmit={data => saveProfile(data)}>
      <Field label="Город" required>
        <Select
          name="city"
          placeholder="Город"
          options={[
            { value: 'msk', label: 'Москва' },
            { value: 'spb', label: 'Санкт-Петербург' },
          ]}
        />
      </Field>
      <FormSubmit>Сохранить</FormSubmit>
    </Form>
  );
}`;

export const Usage: Story = {
  render: () => (
    <div style={storyStack}>
      <LabeledBlock title="Примеры кода">
        <Labeled label="Контролируемое значение" wide maxWidth={720}>
          <CodeBlock code={usageExample} />
        </Labeled>
        <Labeled label="В форме с Field" wide maxWidth={720}>
          <CodeBlock code={formExample} />
        </Labeled>
      </LabeledBlock>
    </div>
  ),
};
