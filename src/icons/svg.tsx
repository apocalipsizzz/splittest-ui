import type { SVGProps } from 'react';

export interface IconProps extends SVGProps<SVGSVGElement> {
  title?: string;
}

export const Svg = ({ title, children, ...props }: IconProps) => {
  const accessibleName = props['aria-label'] ?? title;
  const labelled = Boolean(accessibleName);

  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      role={props.role ?? (labelled ? 'img' : undefined)}
      aria-label={labelled ? accessibleName : undefined}
      aria-hidden={props['aria-hidden'] ?? (labelled ? undefined : true)}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
};
