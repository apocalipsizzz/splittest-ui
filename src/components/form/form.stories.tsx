import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { Field } from '@/components/field';
import { Input } from '@/components/input';
import { PhoneInput } from '@/components/phone-input';
import { TextArea } from '@/components/textarea';
import { IconArrowRight } from '@/icons/icon-arrow-right';
import { Form, FormActions, FormConsent, FormSubmit } from './form';

const meta = {
  title: 'Components/Form',
  component: Form,
  args: {
    children: null,
  },
} satisfies Meta<typeof Form>;

export default meta;
type Story = StoryObj<typeof meta>;

const frame = {
  maxWidth: 480,
} as const;

const wait = (ms: number) =>
  new Promise<void>(resolve => {
    setTimeout(resolve, ms);
  });

const ContactDemo = () => {
  const [sent, setSent] = useState('');

  const handleSubmit = async (data: FormData) => {
    await wait(700);
    const name = String(data.get('name') ?? '').trim();
    setSent(name ? `Ушло, ${name}` : 'Ушло');
  };

  return (
    <div style={frame}>
      <Form onSubmit={handleSubmit}>
        <Field
          hint="Опишите ситуацию и укажите детали, которые помогут разобраться"
          required
          requiredMessage="Напишите сообщение"
        >
          <TextArea name="question" rows={6} placeholder="Сообщение" />
        </Field>
        <Field label="Имя" required>
          <Input name="name" placeholder="Имя" autoComplete="name" />
        </Field>
        <Field label="Номер телефона" required>
          <PhoneInput name="phone" clearable />
        </Field>
        <FormActions>
          <FormSubmit>
            <IconArrowRight />
            Отправить
          </FormSubmit>
          <FormConsent>
            Нажимая, принимаю условия оферты и соглашаюсь на обработку данных
          </FormConsent>
        </FormActions>
      </Form>
      {sent ? <p>{sent}</p> : null}
    </div>
  );
};

export const Contact: Story = {
  render: () => <ContactDemo />,
};
