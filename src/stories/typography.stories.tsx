import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties } from 'react';

import { CodeBlock } from './code-block';
import { LabeledBlock, Labeled } from './labeled';
import { storyStack } from './story-stack';

const meta = {
  title: 'Foundations/Typography',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const sample = 'Любое ваше устройство подойдет для тестов';

const caption = {
  fontSize: 'var(--text-xs)',
  lineHeight: 'var(--text-xs--line-height)',
  color: 'var(--color-muted-foreground)',
} as const satisfies CSSProperties;

const frame = { maxWidth: 720 } as const;

// Размеры шкалы: имя токена и значение. Значения читаются из CSS, а не дублируются.
const scale = [
  { token: '--text-xs', name: 'xs' },
  { token: '--text-sm', name: 'sm' },
  { token: '--text-base', name: 'base' },
  { token: '--text-lg', name: 'lg' },
  { token: '--text-xl', name: 'xl' },
  { token: '--text-2xl', name: '2xl' },
  { token: '--text-3xl', name: '3xl' },
  { token: '--text-4xl', name: '4xl' },
] as const;

export const Scale: Story = {
  render: () => (
    <div style={{ ...storyStack, ...frame }}>
      <LabeledBlock title="Шкала токенов">
        {scale.map(({ token, name }) => (
          <div key={token} style={{ width: '100%' }}>
            <p
              style={{
                fontSize: `var(${token})`,
                lineHeight: `var(${token}--line-height)`,
                margin: 0,
              }}
            >
              {sample}
            </p>
            <p style={caption}>
              {name} · {token}
            </p>
          </div>
        ))}
      </LabeledBlock>
    </div>
  ),
};

export const Tags: Story = {
  render: () => (
    <div style={{ ...storyStack, ...frame }}>
      <LabeledBlock title="Теги по умолчанию (h1–h3 меняются с 680px)">
        <Labeled label="h1" wide maxWidth={720}>
          <h1>{sample}</h1>
        </Labeled>
        <Labeled label="h2" wide maxWidth={720}>
          <h2>{sample}</h2>
        </Labeled>
        <Labeled label="h3" wide maxWidth={720}>
          <h3>{sample}</h3>
        </Labeled>
        <Labeled label="h4" wide maxWidth={720}>
          <h4>{sample}</h4>
        </Labeled>
      </LabeledBlock>
    </div>
  ),
};

export const HeadingClasses: Story = {
  render: () => (
    <div style={{ ...storyStack, ...frame }}>
      <LabeledBlock title="Классы заголовков: .heading-1 … .heading-4">
        <Labeled label="heading-1 · 4xl · 45px" wide maxWidth={720}>
          <p className="heading-1">{sample}</p>
        </Labeled>
        <Labeled label="heading-2 · 3xl · 36px" wide maxWidth={720}>
          <p className="heading-2">{sample}</p>
        </Labeled>
        <Labeled label="heading-3 · 2xl · 27px" wide maxWidth={720}>
          <p className="heading-3">{sample}</p>
        </Labeled>
        <Labeled label="heading-4 · xl · 18px" wide maxWidth={720}>
          <p className="heading-4">{sample}</p>
        </Labeled>
      </LabeledBlock>
    </div>
  ),
};

export const TextClasses: Story = {
  render: () => (
    <div style={{ ...storyStack, ...frame }}>
      <LabeledBlock title="Классы текста: .text-xs … .text-lg">
        <Labeled label="text-xs · 11px" wide maxWidth={720}>
          <p className="text-xs">{sample}</p>
        </Labeled>
        <Labeled label="text-sm · 14px" wide maxWidth={720}>
          <p className="text-sm">{sample}</p>
        </Labeled>
        <Labeled label="text-base · 16px" wide maxWidth={720}>
          <p className="text-base">{sample}</p>
        </Labeled>
        <Labeled label="text-lg · 18px · line 30px" wide maxWidth={720}>
          <p className="text-lg">{sample}</p>
        </Labeled>
      </LabeledBlock>
    </div>
  ),
};

export const Weight: Story = {
  render: () => (
    <div style={{ ...storyStack, ...frame }}>
      <LabeledBlock title="Вес: --font-weight-black (900) у заголовков">
        <Labeled label="font-weight-black" wide maxWidth={720}>
          <p
            className="heading-4"
            style={{ fontWeight: 'var(--font-weight-black)' }}
          >
            {sample}
          </p>
        </Labeled>
      </LabeledBlock>
      <LabeledBlock title="Вес: --font-weight-black (700) у заголовков">
        <Labeled label="font-weight-bold" wide maxWidth={720}>
          <p
            className="heading-4"
            style={{ fontWeight: 'var(--font-weight-bold)' }}
          >
            {sample}
          </p>
        </Labeled>
      </LabeledBlock>
      <LabeledBlock title="Вес: --font-weight-semibold (600) у заголовков">
        <Labeled label="font-weight-semibold" wide maxWidth={720}>
          <p
            className="heading-4"
            style={{ fontWeight: 'var(--font-weight-semibold)' }}
          >
            {sample}
          </p>
        </Labeled>
      </LabeledBlock>
      <LabeledBlock title="Вес: --font-weight-medium (500) у заголовков">
        <Labeled label="font-weight-medium" wide maxWidth={720}>
          <p
            className="heading-4"
            style={{ fontWeight: 'var(--font-weight-medium)' }}
          >
            {sample}
          </p>
        </Labeled>
      </LabeledBlock>
      <LabeledBlock title="Вес: --font-weight-normal (400) у заголовков">
        <Labeled label="font-weight-normal" wide maxWidth={720}>
          <p
            className="heading-4"
            style={{ fontWeight: 'var(--font-weight-normal)' }}
          >
            {sample}
          </p>
        </Labeled>
      </LabeledBlock>
    </div>
  ),
};

const usageExample = `import '@de-kit/st-ui/typography.scss';

// Классы для текста и заголовков
<h1>Персональные данные</h1>
<p className="text-base">Основной текст блока</p>
<p className="text-sm">Вспомогательный текст</p>

// Токены размеров и веса в своих стилях
.note {
  font-size: var(--text-lg);
  line-height: var(--text-lg--line-height);
  font-weight: var(--font-weight-black);
}`;

export const Usage: Story = {
  render: () => (
    <div style={{ ...storyStack, ...frame }}>
      <LabeledBlock title="Примеры кода">
        <Labeled label="Классы и токены" wide maxWidth={720}>
          <CodeBlock code={usageExample} />
        </Labeled>
      </LabeledBlock>
    </div>
  ),
};
