import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { FieldControlProvider } from './field-context';
import { useFieldControlProps } from './use-field-control-props';

const Probe = (props: { describedBy?: string; nativeRequired?: boolean }) => {
  const { controlProps } = useFieldControlProps({
    describedBy: [props.describedBy],
    nativeRequired: props.nativeRequired,
  });

  return <input {...controlProps} />;
};

describe('useFieldControlProps', () => {
  it('склеивает required, ошибку и describedby из поля', () => {
    render(
      <FieldControlProvider
        value={{
          id: 'city',
          invalid: true,
          required: true,
          describedBy: 'hint',
          errorId: 'err',
        }}
      >
        <Probe describedBy="extra" />
      </FieldControlProvider>,
    );

    const input = screen.getByRole('textbox');
    expect(input).toBeRequired();
    expect(input).toHaveAttribute('aria-required', 'true');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', 'hint extra');
    expect(input).toHaveAttribute('aria-errormessage', 'err');
    expect(input).not.toHaveAttribute('id');
  });

  it('nativeRequired false оставляет только aria-required', () => {
    render(
      <FieldControlProvider
        value={{ id: 'city', invalid: false, required: true }}
      >
        <Probe nativeRequired={false} />
      </FieldControlProvider>,
    );

    const input = screen.getByRole('textbox');
    expect(input).not.toHaveAttribute('required');
    expect(input).toHaveAttribute('aria-required', 'true');
  });
});
