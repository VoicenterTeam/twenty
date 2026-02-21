// Modified by Voicenter — 2026-02-20
// Description: Charts always render LTR to preserve axis and data flow direction
import styled from '@emotion/styled';
import { type ComponentProps, forwardRef } from 'react';

type GraphWidgetChartContainerProps = {
  $isClickable?: boolean;
  $cursorSelector?: string;
};

const StyledGraphWidgetChartContainer = styled.div<GraphWidgetChartContainerProps>`
  flex: 1;
  position: relative;
  width: 100%;

  ${({ $isClickable, $cursorSelector }) =>
    $isClickable &&
    $cursorSelector &&
    `
    ${$cursorSelector} {
      cursor: pointer;
    }
  `}
`;

export const GraphWidgetChartContainer = forwardRef<
  HTMLDivElement,
  ComponentProps<typeof StyledGraphWidgetChartContainer>
>(({ children, $isClickable, $cursorSelector, ...rest }, ref) => (
  <StyledGraphWidgetChartContainer
    $isClickable={$isClickable}
    $cursorSelector={$cursorSelector}
    ref={ref}
    dir="ltr"
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...rest}
  >
    {children}
  </StyledGraphWidgetChartContainer>
));
