import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties } from 'react';

import { CodeBlock } from '../../stories/code-block';
import { Labeled, LabeledBlock } from '../../stories/labeled';
import { storyStack } from '../../stories/story-stack';
import { useMediaQuery } from './use-media-query';

const meta = {
  title: 'Hooks/useMediaQuery',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const frame = { maxWidth: 720 } as const;

const badge = {
  padding: '8px 12px',
  borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--color-border)',
  fontSize: 'var(--text-sm)',
  lineHeight: 'var(--text-sm--line-height)',
} as const satisfies CSSProperties;

// Пример 1: значение обновляется при ресайзе окна.
const BreakpointDemo = () => {
  const isWide = useMediaQuery('(min-width: 680px)');

  return (
    <p style={{ ...badge, margin: 0 }}>
      {isWide ? 'Широкий экран: от 680px' : 'Узкий экран: до 680px'}
    </p>
  );
};

// Пример 2: разная разметка для мобильного и десктопа.
const LayoutDemo = () => {
  const isDesktop = useMediaQuery('(min-width: 680px)');

  return isDesktop ? (
    <div style={{ display: 'flex', gap: 8 }}>
      <span style={badge}>Меню</span>
      <span style={badge}>Каталог</span>
      <span style={badge}>Контакты</span>
    </div>
  ) : (
    <details>
      <summary style={badge}>Меню</summary>
      <ul style={{ margin: '8px 0 0', paddingLeft: 20 }}>
        <li>Каталог</li>
        <li>Контакты</li>
      </ul>
    </details>
  );
};

// Пример 3: пользовательские настройки системы.
const PreferenceDemo = () => {
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const dark = useMediaQuery('(prefers-color-scheme: dark)');

  return (
    <div style={{ display: 'grid', gap: 8, justifyItems: 'start' }}>
      <span style={badge}>
        {reduceMotion ? 'Анимации отключены системой' : 'Анимации включены'}
      </span>
      <span style={badge}>
        {dark ? 'Системная тема: тёмная' : 'Системная тема: светлая'}
      </span>
    </div>
  );
};

const usageExample = `import { useMediaQuery } from '@de-kit/st-ui';

function Header() {
  const isDesktop = useMediaQuery('(min-width: 680px)');

  return isDesktop ? <DesktopNav /> : <BurgerNav />;
}`;

const queryExample = `// Запрос меняется — подписка переоформляется автоматически
const isCompact = useMediaQuery(\`(max-width: \${maxWidth}px)\`);

// Первое значение берётся сразу, без undefined,
// поэтому первый рендер уже с правильным вариантом
const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');`;

const formExample = `import { useMediaQuery } from '@de-kit/st-ui';

function Actions() {
  const isWide = useMediaQuery('(min-width: 680px)');

  return (
    <div style={{ display: 'flex', flexDirection: isWide ? 'row' : 'column' }}>
      <Button>Отправить</Button>
      <Button variant="link">Отмена</Button>
    </div>
  );
}`;

export const Breakpoint: Story = {
  render: () => (
    <div style={{ ...storyStack, ...frame }}>
      <LabeledBlock title="Брейкпоинт: (min-width: 680px)">
        <Labeled label="Измените ширину окна" wide maxWidth={720}>
          <BreakpointDemo />
        </Labeled>
      </LabeledBlock>
    </div>
  ),
};

export const ConditionalLayout: Story = {
  render: () => (
    <div style={{ ...storyStack, ...frame }}>
      <LabeledBlock title="Разная разметка для мобильного и десктопа">
        <Labeled label="Навигация" wide maxWidth={720}>
          <LayoutDemo />
        </Labeled>
      </LabeledBlock>
    </div>
  ),
};

export const SystemPreferences: Story = {
  render: () => (
    <div style={{ ...storyStack, ...frame }}>
      <LabeledBlock title="Настройки системы: движение и тема">
        <Labeled
          label="prefers-reduced-motion, prefers-color-scheme"
          wide
          maxWidth={720}
        >
          <PreferenceDemo />
        </Labeled>
      </LabeledBlock>
    </div>
  ),
};

export const Usage: Story = {
  render: () => (
    <div style={{ ...storyStack, ...frame }}>
      <LabeledBlock title="Примеры кода">
        <Labeled label="Базовый случай" wide maxWidth={720}>
          <CodeBlock code={usageExample} />
        </Labeled>
        <Labeled label="Запросы и первое значение" wide maxWidth={720}>
          <CodeBlock code={queryExample} />
        </Labeled>
        <Labeled label="Кнопки в колонку на мобильном" wide maxWidth={720}>
          <CodeBlock code={formExample} />
        </Labeled>
      </LabeledBlock>
    </div>
  ),
};
