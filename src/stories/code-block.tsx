import type { CSSProperties } from 'react';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import tsx from 'react-syntax-highlighter/dist/esm/languages/prism/tsx';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

SyntaxHighlighter.registerLanguage('tsx', tsx);

const frame = {
  overflowX: 'auto',
  borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--color-border)',
} as const satisfies CSSProperties;

const highlighted = {
  margin: 0,
  padding: 16,
  background: 'transparent',
  fontSize: 'var(--text-sm)',
  lineHeight: 'var(--text-sm--line-height)',
} as const satisfies CSSProperties;

export function CodeBlock(props: { code: string }) {
  const { code } = props;

  return (
    <div style={frame}>
      <SyntaxHighlighter
        language="tsx"
        style={oneLight}
        customStyle={highlighted}
        codeTagProps={{ style: { fontFamily: 'inherit' } }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
