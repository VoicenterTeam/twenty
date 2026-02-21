// Modified by Voicenter — 2026-02-20
// Description: Wrapper component that mirrors directional icons (arrows, chevrons) in RTL mode
import styled from '@emotion/styled';
import { type ComponentType } from 'react';

import { useDirection } from '~/utils/rtl/useDirection';

type IconProps = {
  size?: number;
  color?: string;
  stroke?: number;
  className?: string;
};

type DirectionalIconProps = {
  Icon: ComponentType<IconProps>;
  mirror?: boolean;
  size?: number;
  color?: string;
  stroke?: number;
  className?: string;
};

const StyledMirroredIcon = styled.span`
  display: inline-flex;
  transform: scaleX(-1);
`;

export const DirectionalIcon = ({
  Icon,
  mirror = true,
  size,
  color,
  stroke,
  className,
}: DirectionalIconProps) => {
  const direction = useDirection();
  const shouldMirror = mirror && direction === 'rtl';

  if (shouldMirror) {
    return (
      <StyledMirroredIcon>
        <Icon size={size} color={color} stroke={stroke} className={className} />
      </StyledMirroredIcon>
    );
  }

  return (
    <Icon size={size} color={color} stroke={stroke} className={className} />
  );
};
