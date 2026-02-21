// Modified by Voicenter — 2026-02-20
// Description: Hook that swaps left/right icon pairs based on layout direction
import { type ComponentType } from 'react';

import { useDirection } from '~/utils/rtl/useDirection';

type IconComponent = ComponentType<Record<string, unknown>>;

// Swaps a left/right icon pair based on the current direction.
// In RTL, IconLeft becomes IconRight and vice versa.
export const useDirectionalIcon = (
  ltrIcon: IconComponent,
  rtlIcon: IconComponent,
): IconComponent => {
  const direction = useDirection();
  return direction === 'rtl' ? rtlIcon : ltrIcon;
};
