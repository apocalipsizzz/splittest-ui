import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { Button } from '@/components/button';
import { CodeBlock } from '@/stories/code-block';
import { Labeled, LabeledBlock } from '@/stories/labeled';
import { storyStack } from '@/stories/story-stack';
import { PopupSheet } from './popup-sheet';

const meta = {
  title: 'Components/PopupSheet',
  component: PopupSheet,
  args: {
    open: false,
    children: 'Контент',
    title: 'Заголовок',
  },
} satisfies Meta<typeof PopupSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: function Render() {
    const [open, setOpen] = useState(false);

    return (
      <>
        <Button type="button" onClick={() => setOpen(true)}>
          Открыть sheet
        </Button>
        <PopupSheet
          open={open}
          onClose={() => setOpen(false)}
          title="Подтверждение"
        >
          <p>Контент нижнего sheet.</p>
          <Button type="button" onClick={() => setOpen(false)}>
            Ок
          </Button>
        </PopupSheet>
      </>
    );
  },
};

const usageExample = `import { PopupSheet } from '@de-kit/st-ui';

function ConfirmLogout() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>Выйти</button>
      <PopupSheet
        open={open}
        onClose={() => setOpen(false)}
        title="Выйти из профиля?"
      >
        <button type="button" onClick={handleLogout}>Да, выйти</button>
      </PopupSheet>
    </>
  );
}`;

export const Usage: Story = {
  render: () => (
    <div style={storyStack}>
      <LabeledBlock title="Примеры кода">
        <Labeled label="Базовый сценарий" wide maxWidth={720}>
          <CodeBlock code={usageExample} />
        </Labeled>
      </LabeledBlock>
    </div>
  ),
};

export const WithoutTitle: Story = {
  render: function Render() {
    const [open, setOpen] = useState(false);

    return (
      <>
        <Button type="button" onClick={() => setOpen(true)}>
          Открыть без заголовка
        </Button>
        <PopupSheet open={open} onClose={() => setOpen(false)}>
          <p>Без заголовка у диалога нет имени: передайте aria-label.</p>
          <Button type="button" onClick={() => setOpen(false)}>
            Готово
          </Button>
        </PopupSheet>
      </>
    );
  },
};

export const LongContent: Story = {
  render: function Render() {
    const [open, setOpen] = useState(false);

    return (
      <>
        <Button type="button" onClick={() => setOpen(true)}>
          Открыть с длинным текстом
        </Button>
        <PopupSheet open={open} onClose={() => setOpen(false)} title="Условия">
          {Array.from({ length: 30 }, (_, i) => (
            <p key={i}>
              Пункт {i + 1}: длинный текст, который должен скроллиться внутри
              листа.
            </p>
          ))}
        </PopupSheet>
      </>
    );
  },
};
