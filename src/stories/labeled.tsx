import type { CSSProperties, ReactNode } from 'react';

const storyBlock = {
  display: 'grid',
  gap: 12,
  padding: 16,
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-sm)',
} as const;

const storyTitle = {
  margin: 0,
  fontWeight: 700,
} as const;

const storyCells = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '20px 16px',
  alignItems: 'start',
} as const;

const storyCell = {
  display: 'grid',
  gap: 8,
  justifyItems: 'center',
  minWidth: 88,
} as const;

const storyCaption = {
  fontSize: 'var(--text-xs)',
  lineHeight: 'var(--text-xs--line-height)',
  color: 'var(--color-muted-foreground)',
} as const;

export function LabeledBlock(props: { title: string; children: ReactNode }) {
  const { title, children } = props;

  return (
    <section style={storyBlock}>
      <p style={storyTitle}>{title}</p>
      <div style={storyCells}>{children}</div>
    </section>
  );
}

export function Labeled(props: {
  label: string;
  wide?: boolean;
  maxWidth?: number;
  children: ReactNode;
}) {
  const { label, wide, maxWidth, children } = props;
  const wideStyle: CSSProperties | null = wide
    ? { width: '100%', maxWidth, justifyItems: 'stretch' }
    : null;

  return (
    <div style={{ ...storyCell, ...wideStyle }}>
      <span style={storyCaption}>{label}</span>
      {children}
    </div>
  );
}
