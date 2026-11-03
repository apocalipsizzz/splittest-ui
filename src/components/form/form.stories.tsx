import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { Field } from '@/components/field';
import { Input } from '@/components/input';
import { PhoneInput } from '@/components/phone-input';
import { TextArea } from '@/components/textarea';
import { IconArrowRight } from '@/icons/icon-arrow-right';
import { CodeBlock } from '@/stories/code-block';
import { Labeled, LabeledBlock } from '@/stories/labeled';
import { storyStack } from '@/stories/story-stack';
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

const usageExample = `import { Field, Form, FormSubmit, Input } from '@de-kit/st-ui';

function LoginForm() {
  const handleSubmit = async (data: FormData) => {
    await login(String(data.get('email')), String(data.get('password')));
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Field label="Email" required>
        <Input name="email" type="email" autoComplete="email" />
      </Field>
      <Field label="Пароль" required>
        <Input name="password" type="password" autoComplete="current-password" />
      </Field>
      <FormSubmit>Войти</FormSubmit>
    </Form>
  );
}`;

const storeExample = `import { Field, Form, FormSubmit, Input } from '@de-kit/st-ui';

// Запрос ведёт стор: pending и error берём оттуда
function SubscribeForm() {
  const mutation = useSubscribe();

  return (
    <Form
      onSubmit={data => mutation.mutateAsync(data)}
      pending={mutation.isPending}
      error={mutation.error?.message}
    >
      <Field label="Email" required>
        <Input name="email" type="email" />
      </Field>
      <FormSubmit>Подписаться</FormSubmit>
    </Form>
  );
}`;

const actionsExample = `import { Form, FormActions, FormConsent, FormSubmit, Field, Input } from '@de-kit/st-ui';
import { IconArrowRight } from '@de-kit/st-ui/icons';

function ContactForm() {
  return (
    <Form onSubmit={sendRequest}>
      <Field label="Имя" required>
        <Input name="name" />
      </Field>
      <FormActions>
        <FormSubmit>
          <IconArrowRight />
          Отправить
        </FormSubmit>
        <FormConsent>
          Нажимая, принимаю <a href="/offer">условия оферты</a>
        </FormConsent>
      </FormActions>
    </Form>
  );
}`;

export const Usage: Story = {
  render: () => (
    <div style={storyStack}>
      <LabeledBlock title="Примеры кода">
        <Labeled label="Базовая форма" wide maxWidth={720}>
          <CodeBlock code={usageExample} />
        </Labeled>
        <Labeled label="Pending и ошибка из стора" wide maxWidth={720}>
          <CodeBlock code={storeExample} />
        </Labeled>
        <Labeled label="Кнопка и согласие" wide maxWidth={720}>
          <CodeBlock code={actionsExample} />
        </Labeled>
      </LabeledBlock>
    </div>
  ),
};
