import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { CodeBlock } from '@/stories/code-block';
import { Labeled, LabeledBlock } from '@/stories/labeled';
import { storyStack } from '@/stories/story-stack';
import {
  Pagination,
  type PaginationLayout,
  type PaginationProps,
  type PaginationRangePreset,
} from './pagination';

function Demo(props: PaginationProps) {
  const { page: initialPage, onPageChange, ...rest } = props;
  const [page, setPage] = useState(initialPage);

  return (
    <Pagination
      {...rest}
      page={page}
      onPageChange={next => {
        setPage(next);
        onPageChange(next);
      }}
    />
  );
}

const meta = {
  title: 'Components/Pagination',
  component: Pagination,
  args: {
    page: 1,
    pageCount: 99,
    layout: 'inline',
    range: 'regular',
    onPageChange: () => {},
  },
  argTypes: {
    layout: {
      control: 'inline-radio',
      options: ['responsive', 'inline', 'stacked'],
    },
    range: {
      control: 'inline-radio',
      options: ['compact', 'regular'],
    },
  },
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: args => (
    <Demo key={`${args.page}-${args.pageCount}-${args.layout}`} {...args} />
  ),
};

const layouts = [
  'inline',
  'stacked',
] as const satisfies readonly PaginationLayout[];

const positions = [
  { page: 1, label: 'начало' },
  { page: 50, label: 'середина' },
  { page: 99, label: 'конец' },
] as const;

export const Layouts: Story = {
  render: () => (
    <div style={storyStack}>
      {layouts.map(layout => (
        <LabeledBlock key={layout} title={layout}>
          <Labeled
            label={layout === 'stacked' ? '320px' : 'на всю ширину'}
            wide
          >
            <div style={layout === 'stacked' ? { width: 320 } : undefined}>
              <Demo
                page={1}
                pageCount={99}
                layout={layout}
                range={layout === 'stacked' ? 'compact' : 'regular'}
                aria-label={`Страницы, ${layout}`}
                onPageChange={() => {}}
              />
            </div>
          </Labeled>
        </LabeledBlock>
      ))}
    </div>
  ),
};

const fewCounts = [2, 3, 4] as const;

export const FewPages: Story = {
  render: () => (
    <div style={storyStack}>
      <LabeledBlock title="меньше пяти страниц — только стрелки">
        {fewCounts.map(pageCount => (
          <Labeled key={pageCount} label={`${pageCount} стр., 280px`} wide>
            <div style={{ width: 280 }}>
              <Demo
                page={pageCount === 2 ? 2 : 1}
                pageCount={pageCount}
                layout="inline"
                aria-label={`Страницы, ${pageCount}`}
                onPageChange={() => {}}
              />
            </div>
          </Labeled>
        ))}
        <Labeled label="4 стр., stacked 320px" wide>
          <div style={{ width: 320 }}>
            <Demo
              page={1}
              pageCount={4}
              layout="stacked"
              aria-label="Страницы, 4, stacked"
              onPageChange={() => {}}
            />
          </div>
        </Labeled>
      </LabeledBlock>
      <LabeledBlock title="пять страниц — на узкой ширине номера сверху">
        {(
          [
            { page: 1, label: 'начало' },
            { page: 3, label: 'середина' },
            { page: 5, label: 'конец' },
          ] as const
        ).map(item => (
          <Labeled key={item.label} label={`${item.label}, 320px`} wide>
            <div style={{ width: 320 }}>
              <Demo
                page={item.page}
                pageCount={5}
                layout="inline"
                aria-label={`Страницы, 5, ${item.label}`}
                onPageChange={() => {}}
              />
            </div>
          </Labeled>
        ))}
      </LabeledBlock>
    </div>
  ),
};

const ranges = [
  'compact',
  'regular',
] as const satisfies readonly PaginationRangePreset[];

export const Window: Story = {
  render: () => (
    <div style={storyStack}>
      {ranges.map(range => (
        <LabeledBlock key={range} title={range}>
          {positions.map(position => (
            <Labeled key={position.label} label={position.label} wide>
              <Demo
                page={position.page}
                pageCount={99}
                layout="inline"
                range={range}
                aria-label={`Страницы, ${range}, ${position.label}`}
                onPageChange={() => {}}
              />
            </Labeled>
          ))}
        </LabeledBlock>
      ))}
    </div>
  ),
};

const usageExample = `import { useState } from 'react';
import { Pagination } from '@de-kit/st-ui';

function ListPager(props: { total: number; limit: number }) {
  const [page, setPage] = useState(1);
  const pageCount = Math.ceil(props.total / props.limit);

  return (
    <Pagination
      page={page}
      pageCount={pageCount}
      onPageChange={setPage}
    />
  );
}`;

const layoutExample = `import { Pagination } from '@de-kit/st-ui';

// responsive — до 680px номера сверху и compact (1–5 … N),
// от 680px одна строка и regular (1–8 … N).
<Pagination page={page} pageCount={99} onPageChange={setPage} />

// Жёстко, как на макете узкой колонки.
<Pagination
  page={page}
  pageCount={99}
  layout="stacked"
  range="compact"
  onPageChange={setPage}
/>

// Всегда одна строка, своё окно.
<Pagination
  page={page}
  pageCount={99}
  layout="inline"
  range={{
    showAllUntil: 10,
    headUntil: 6,
    headSize: 8,
    siblingCount: 2,
    tailFrom: 7,
  }}
  onPageChange={setPage}
/>

// Меньше пяти страниц: текст «Назад»/«Вперёд» скрыт, остаются стрелки.
// Имя кнопок для скринридера берётся из тех же подписей.
<Pagination page={page} pageCount={4} onPageChange={setPage} />`;

export const Usage: Story = {
  render: () => (
    <div style={storyStack}>
      <LabeledBlock title="Примеры кода">
        <Labeled label="страница и размер выборки" wide maxWidth={720}>
          <CodeBlock code={usageExample} />
        </Labeled>
        <Labeled label="раскладка и окно номеров" wide maxWidth={720}>
          <CodeBlock code={layoutExample} />
        </Labeled>
      </LabeledBlock>
    </div>
  ),
};
