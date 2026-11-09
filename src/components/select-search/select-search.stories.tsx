import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { Field } from '@/components/field';
import { Form, FormSubmit } from '@/components/form';
import { CodeBlock } from '@/stories/code-block';
import { Labeled, LabeledBlock } from '@/stories/labeled';
import { storyStack } from '@/stories/story-stack';
import { SelectSearch, type SelectSearchOption } from './select-search';

const BANKS: SelectSearchOption[] = [
  { value: '044525225', label: 'Сбербанк' },
  { value: '044525974', label: 'Т-Банк', keywords: ['Тинькофф', 'tbank'] },
  { value: '044525593', label: 'Альфа-Банк' },
  { value: '044525545', label: 'ЮниКредит Банк', disabled: true },
  { value: '044525823', label: 'Газпромбанк' },
];

const meta = {
  title: 'Components/SelectSearch',
  component: SelectSearch,
  args: {
    options: BANKS,
    placeholder: 'Банк',
  },
} satisfies Meta<typeof SelectSearch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

const ControlledDemo = () => {
  const [bank, setBank] = useState<string | null>(null);

  return (
    <div style={storyStack}>
      <Labeled label="controlled" wide maxWidth={360}>
        <SelectSearch
          options={BANKS}
          placeholder="Банк"
          value={bank}
          onChange={setBank}
        />
      </Labeled>
      <p>Значение: {bank ?? '—'}</p>
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
          <SelectSearch options={BANKS} placeholder="Банк" />
        </Labeled>
        <Labeled label="filled" wide maxWidth={360}>
          <SelectSearch options={BANKS} value="044525974" onChange={() => {}} />
        </Labeled>
        <Labeled label="error" wide maxWidth={360}>
          <SelectSearch
            options={BANKS}
            error
            value={null}
            onChange={() => {}}
          />
        </Labeled>
        <Labeled label="disabled" wide maxWidth={360}>
          <SelectSearch options={BANKS} disabled value="044525225" />
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
        <Field label="Банк" required>
          <SelectSearch name="bank" options={BANKS} placeholder="Банк" />
        </Field>
        <FormSubmit>Отправить</FormSubmit>
      </Form>
    </div>
  ),
};

const usageExample = `import { useState } from 'react';
import { SelectSearch } from '@de-kit/st-ui';

const banks = [
  { value: '044525225', label: 'Сбербанк' },
  { value: '044525974', label: 'Т-Банк', keywords: ['Тинькофф'] },
];

function BankSelect() {
  const [bank, setBank] = useState<string | null>(null);

  return (
    <SelectSearch
      options={banks}
      placeholder="Банк"
      value={bank}
      onChange={setBank}
    />
  );
}`;

export const Usage: Story = {
  render: () => (
    <div style={storyStack}>
      <LabeledBlock title="Примеры кода">
        <Labeled label="Поиск по подписи и keywords" wide maxWidth={720}>
          <CodeBlock code={usageExample} />
        </Labeled>
      </LabeledBlock>
    </div>
  ),
};

export const WithHint: Story = {
  render: function Render() {
    const [value, setValue] = useState<string | null>(null);

    return (
      <div style={storyStack}>
        <LabeledBlock title="Подсказка и ошибка через Field">
          <Labeled label="hint" wide maxWidth={360}>
            <Field label="Банк" hint="Начните вводить название">
              <SelectSearch
                options={BANKS}
                value={value}
                onChange={setValue}
                placeholder="Выберите банк"
              />
            </Field>
          </Labeled>
          <Labeled label="error" wide maxWidth={360}>
            <Field label="Банк" error="Банк не выбран">
              <SelectSearch
                options={BANKS}
                value={value}
                onChange={setValue}
                error
                placeholder="Выберите банк"
              />
            </Field>
          </Labeled>
        </LabeledBlock>
      </div>
    );
  },
};
