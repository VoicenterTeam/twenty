// Modified by Voicenter — 2026-02-20
// Description: Hook and utilities for determining layout direction (LTR/RTL) based on current locale
import { useLingui } from '@lingui/react';

import { isRtlLocale } from 'twenty-shared/translations';

export type LayoutDirection = 'ltr' | 'rtl';

export const getDirectionFromLocale = (locale: string): LayoutDirection =>
  isRtlLocale(locale) ? 'rtl' : 'ltr';

export const useDirection = (): LayoutDirection => {
  const { i18n } = useLingui();
  return getDirectionFromLocale(i18n.locale);
};
