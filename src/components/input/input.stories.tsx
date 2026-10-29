import type { Meta, StoryObj } from '@storybook/react-vite';

import { Labeled, LabeledBlock } from '@/stories/labeled';
import { storyStack } from '@/stories/story-stack';
import { Input } from './input';

const meta = {
  title: 'Components/Input',
  component: Input,
  args: {
    placeholder: 'Название теста',
  },
  argTypes: {
    clearable: { control: 'boolean' },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Sizes: Story = {
  render: () => (
    <LabeledBlock title="size">
      <Labeled label="sm, 30px" wide maxWidth={360}>
        <Input size="sm" placeholder="sm, 30px" />
      </Labeled>
      <Labeled label="md, 40px" wide maxWidth={360}>
        <Input placeholder="md, 40px" />
      </Labeled>
      <Labeled label="lg, 52px" wide maxWidth={360}>
        <Input size="lg" placeholder="lg, 52px" />
      </Labeled>
    </LabeledBlock>
  ),
};

export const Types: Story = {
  render: () => (
    <LabeledBlock title="type">
      <Labeled label="text" wide maxWidth={360}>
        <Input type="text" placeholder="Название теста" />
      </Labeled>
      <Labeled label="email" wide maxWidth={360}>
        <Input type="email" placeholder="name@test.ru" />
      </Labeled>
      <Labeled label="password" wide maxWidth={360}>
        <Input type="password" placeholder="Пароль" defaultValue="secret" />
      </Labeled>
      <Labeled label="number" wide maxWidth={360}>
        <Input type="number" placeholder="18" />
      </Labeled>
      <Labeled label="search" wide maxWidth={360}>
        <Input
          type="search"
          placeholder="Поиск"
          clearable
          defaultValue="тест"
        />
      </Labeled>
      <Labeled label="date" wide maxWidth={360}>
        <Input type="date" aria-label="Дата" />
      </Labeled>
    </LabeledBlock>
  ),
};

export const States: Story = {
  render: () => (
    <div style={storyStack}>
      <LabeledBlock title="state">
        <Labeled label="default" wide maxWidth={360}>
          <Input placeholder="Название теста" />
        </Labeled>
        <Labeled label="recommended" wide maxWidth={360}>
          <Input placeholder="Название теста" recommended />
        </Labeled>
        <Labeled label="error" wide maxWidth={360}>
          <Input placeholder="Название теста" error defaultValue="пусто" />
        </Labeled>
        <Labeled label="recommended + error" wide maxWidth={360}>
          <Input recommended error defaultValue="и то и другое" />
        </Labeled>
        <Labeled label="disabled" wide maxWidth={360}>
          <Input placeholder="Название теста" disabled defaultValue="нельзя" />
        </Labeled>
        <Labeled label="readOnly" wide maxWidth={360}>
          <Input readOnly defaultValue="только чтение" />
        </Labeled>
      </LabeledBlock>
      <LabeledBlock title="clearable">
        <Labeled label="пусто" wide maxWidth={360}>
          <Input placeholder="Название теста" clearable />
        </Labeled>
        <Labeled label="со значением" wide maxWidth={360}>
          <Input placeholder="Название теста" clearable defaultValue="текст" />
        </Labeled>
        <Labeled label="error" wide maxWidth={360}>
          <Input clearable error defaultValue="а" />
        </Labeled>
      </LabeledBlock>
    </div>
  ),
};
