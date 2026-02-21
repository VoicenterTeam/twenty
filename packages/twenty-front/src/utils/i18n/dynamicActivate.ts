// Modified by Voicenter — 2026-02-20
// Description: Set document direction (RTL/LTR) on locale activation
import { i18n } from '@lingui/core';
import { APP_LOCALES, SOURCE_LOCALE } from 'twenty-shared/translations';

import { getDirectionFromLocale } from '~/utils/rtl/useDirection';

export const dynamicActivate = async (locale: keyof typeof APP_LOCALES) => {
  if (!Object.values(APP_LOCALES).includes(locale)) {
    // eslint-disable-next-line no-console
    console.warn(`Invalid locale "${locale}", defaulting to "en"`);
    locale = SOURCE_LOCALE;
  }
  const { messages } = await import(`../../locales/generated/${locale}.ts`);
  i18n.load(locale, messages);
  i18n.activate(locale);

  document.documentElement.dir = getDirectionFromLocale(locale);
  document.documentElement.lang = locale;
};
