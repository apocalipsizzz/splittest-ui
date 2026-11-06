import { act, render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it } from 'vitest';

import { useMediaQuery } from './use-media-query';

const Probe = ({ query }: { query: string }) => (
  <span>{String(useMediaQuery(query))}</span>
);

describe('useMediaQuery', () => {
  const original = window.matchMedia;

  afterEach(() => {
    window.matchMedia = original;
  });

  it('на сервере всегда false, даже если запрос совпал бы', () => {
    window.matchMedia = () =>
      ({
        matches: true,
        addEventListener: () => {},
        removeEventListener: () => {},
      }) as unknown as MediaQueryList;

    expect(renderToString(<Probe query="(min-width: 1px)" />)).toBe(
      '<span>false</span>',
    );
  });

  it('на клиенте берёт matchMedia и слышит change', () => {
    let matches = false;
    const listeners = new Set<() => void>();
    window.matchMedia = () =>
      ({
        get matches() {
          return matches;
        },
        addEventListener: (_type: string, listener: () => void) => {
          listeners.add(listener);
        },
        removeEventListener: (_type: string, listener: () => void) => {
          listeners.delete(listener);
        },
      }) as unknown as MediaQueryList;

    render(<Probe query="(min-width: 680px)" />);
    expect(screen.getByText('false')).toBeInTheDocument();

    act(() => {
      matches = true;
      listeners.forEach(listener => listener());
    });

    expect(screen.getByText('true')).toBeInTheDocument();
  });
});
