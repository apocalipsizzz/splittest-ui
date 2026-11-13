import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { CodeBlock } from '@/stories/code-block';
import { Labeled, LabeledBlock } from '@/stories/labeled';
import { storyStack } from '@/stories/story-stack';
import { Pagination, type PaginationProps } from './pagination';

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
    onPageChange: () => {},
  },
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: args => <Demo key={`${args.page}-${args.pageCount}`} {...args} />,
};

const positions = [
  { page: 1, label: 'начало' },
  { page: 8, label: 'сразу за началом' },
  { page: 50, label: 'середина' },
  { page: 99, label: 'конец' },
] as const;

export const Positions: Story = {
  render: () => (
    <div style={storyStack}>
      <LabeledBlock title="99 страниц">
        {positions.map(position => (
          <Labeled key={position.label} label={position.label} wide>
            <Demo
              page={position.page}
              pageCount={99}
              aria-label={`Страницы, ${position.label}`}
              onPageChange={() => {}}
            />
          </Labeled>
        ))}
      </LabeledBlock>
    </div>
  ),
};

const counts = [2, 4, 5, 10, 11] as const;

export const PageCounts: Story = {
  render: () => (
    <div style={storyStack}>
      <LabeledBlock title="сколько номеров видно">
        {counts.map(pageCount => (
          <Labeled key={pageCount} label={`${pageCount} стр.`} wide>
            <Demo
              page={1}
              pageCount={pageCount}
              aria-label={`Страницы, ${pageCount}`}
              onPageChange={() => {}}
            />
          </Labeled>
        ))}
      </LabeledBlock>
    </div>
  ),
};

const usageExample = `import { useState } from 'react';
import { Pagination } from '@de-kit/st-ui';

function ListPager(props: { total: number; limit: number }) {
  const [page, setPage] = useState(1);
  const pageCount = Math.ceil(props.total / props.limit);

  return (
    <Pagination page={page} pageCount={pageCount} onPageChange={setPage} />
  );
}`;

const propsExample = `// Больше пропсов у компонента нет: ряд и раскладку он выбирает сам.
<Pagination page={page} pageCount={99} onPageChange={setPage} />

// Свои подписи шагов — они же имена кнопок для скринридера.
<Pagination
  page={page}
  pageCount={99}
  prevLabel="Previous"
  nextLabel="Next"
  onPageChange={setPage}
/>

// Ряд целиком недоступен, пока грузится страница.
<Pagination page={page} pageCount={99} disabled onPageChange={setPage} />`;

export const Usage: Story = {
  render: () => (
    <div style={storyStack}>
      <LabeledBlock title="Примеры кода">
        <Labeled label="страница и размер выборки" wide maxWidth={720}>
          <CodeBlock code={usageExample} />
        </Labeled>
        <Labeled label="подписи и disabled" wide maxWidth={720}>
          <CodeBlock code={propsExample} />
        </Labeled>
      </LabeledBlock>
      <LabeledBlock title="Раскладка">
        <Labeled label="как компонент решает сам" wide maxWidth={720}>
          <CodeBlock
            code={`от 680px — одна строка: ← Назад | 1 2 3 4 5 6 7 8 … 99 | Вперёд →

до 680px и от 5 страниц:
        1 2 3 4 5 … 99
← Назад              Вперёд →

до 680px и меньше 5 страниц — одна строка, у шагов только стрелки:
←   1 2 3 4   →

Ширину компонент берёт у окна, поэтому мобильную раскладку
видно, если сузить окно браузера, а не колонку вокруг него.`}
          />
        </Labeled>
      </LabeledBlock>
    </div>
  ),
};
