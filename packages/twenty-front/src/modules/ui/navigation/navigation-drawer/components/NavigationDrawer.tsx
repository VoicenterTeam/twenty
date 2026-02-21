// Modified by Voicenter — 2026-02-20
// Description: Made resize edge direction-aware for RTL layout support
import styled from '@emotion/styled';
import { type ReactNode, useState } from 'react';
import { useSetRecoilState } from 'recoil';

import { useIsSettingsDrawer } from '@/navigation/hooks/useIsSettingsDrawer';
import { tableWidthResizeIsActiveState } from '@/object-record/record-table/states/tableWidthResizeIsActivedState';
import { useRecoilStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilStateV2';
import { ResizablePanelEdge } from '@/ui/layout/resizable-panel/components/ResizablePanelEdge';
import { NAVIGATION_DRAWER_COLLAPSED_WIDTH } from '@/ui/layout/resizable-panel/constants/NavigationDrawerCollapsedWidth';
import { NAVIGATION_DRAWER_CONSTRAINTS } from '@/ui/layout/resizable-panel/constants/NavigationDrawerConstraints';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { MOBILE_VIEWPORT } from 'twenty-ui/theme';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import {
  NAVIGATION_DRAWER_WIDTH_VAR,
  navigationDrawerWidthState,
} from '@/ui/navigation/states/navigationDrawerWidthState';
import { NavigationDrawerWidthEffect } from '@/ui/navigation/components/NavigationDrawerWidthEffect';
import { useDirection } from '~/utils/rtl/useDirection';
import { NavigationDrawerBackButton } from './NavigationDrawerBackButton';
import { NavigationDrawerHeader } from './NavigationDrawerHeader';

export type NavigationDrawerProps = {
  children?: ReactNode;
  className?: string;
  title: string;
};

const StyledAnimatedContainer = styled.div<{
  isExpanded: boolean;
  isResizing: boolean;
}>`
  max-height: 100vh;
  overflow: hidden;
  position: relative;
  width: ${({ isExpanded }) =>
    isExpanded
      ? `var(${NAVIGATION_DRAWER_WIDTH_VAR})`
      : `${NAVIGATION_DRAWER_COLLAPSED_WIDTH}px`};
  transition: ${({ isResizing, theme }) =>
    isResizing ? 'none' : `width ${theme.animation.duration.normal}s`};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    width: ${({ isExpanded }) => (isExpanded ? '100%' : '0')};
  }
`;

const StyledContainer = styled.div<{
  isSettings?: boolean;
  isMobile?: boolean;
}>`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  width: var(${NAVIGATION_DRAWER_WIDTH_VAR});
  gap: ${({ theme }) => theme.spacing(3)};
  height: 100%;
  padding-block-start: ${({ theme }) => theme.spacing(3)};
  padding-block-end: ${({ theme, isSettings, isMobile }) =>
    isSettings ? (isMobile ? '0' : theme.spacing(4)) : theme.spacing(4)};
  padding-inline-start: ${({ theme, isSettings, isMobile }) =>
    isSettings ? (isMobile ? theme.spacing(8) : '0') : theme.spacing(2)};
  padding-inline-end: 0;
  @media (max-width: ${MOBILE_VIEWPORT}px) {
    width: 100%;
    padding-inline-start: ${({ theme }) => theme.spacing(5)};
    padding-inline-end: ${({ theme }) => theme.spacing(5)};
  }
`;

export const NavigationDrawer = ({
  children,
  className,
  title,
}: NavigationDrawerProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const isMobile = useIsMobile();
  const isSettingsDrawer = useIsSettingsDrawer();
  const direction = useDirection();
  const resizeEdgeSide = direction === 'rtl' ? 'left' : 'right';

  const [isNavigationDrawerExpanded, setIsNavigationDrawerExpanded] =
    useRecoilStateV2(isNavigationDrawerExpandedState);
  const [navigationDrawerWidth, setNavigationDrawerWidth] = useRecoilStateV2(
    navigationDrawerWidthState,
  );
  const setTableWidthResizeIsActive = useSetRecoilState(
    tableWidthResizeIsActiveState,
  );

  const handleHover = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleCollapse = () => {
    setIsNavigationDrawerExpanded(false);
    setIsResizing(false);
    setTableWidthResizeIsActive(true);
  };

  const handleWidthChange = (width: number) => {
    setNavigationDrawerWidth(width);
    setIsResizing(false);
    setTableWidthResizeIsActive(true);
  };

  const handleResizeStart = () => {
    setIsResizing(true);
    setTableWidthResizeIsActive(false);
  };

  return (
    <>
      <NavigationDrawerWidthEffect />
      <StyledAnimatedContainer
        className={className}
        isExpanded={isNavigationDrawerExpanded}
        isResizing={isResizing}
      >
        <StyledContainer
          isSettings={isSettingsDrawer}
          isMobile={isMobile}
          onMouseEnter={handleHover}
          onMouseLeave={handleMouseLeave}
        >
          {isSettingsDrawer && title ? (
            !isMobile && <NavigationDrawerBackButton title={title} />
          ) : (
            <NavigationDrawerHeader showCollapseButton={isHovered} />
          )}

          {children}
        </StyledContainer>

        {isNavigationDrawerExpanded && !isMobile && !isSettingsDrawer && (
          <ResizablePanelEdge
            side={resizeEdgeSide}
            constraints={NAVIGATION_DRAWER_CONSTRAINTS}
            currentWidth={navigationDrawerWidth}
            onWidthChange={handleWidthChange}
            onCollapse={handleCollapse}
            showHandle={false}
            cssVariableName={NAVIGATION_DRAWER_WIDTH_VAR}
            onResizeStart={handleResizeStart}
          />
        )}
      </StyledAnimatedContainer>
    </>
  );
};
