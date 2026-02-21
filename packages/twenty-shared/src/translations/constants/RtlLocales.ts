// Modified by Voicenter — 2026-02-20
// Description: Locales that require right-to-left layout direction
import { type AppLocale } from './AppLocales';

export const RTL_LOCALES: ReadonlyArray<AppLocale> = ['he-IL', 'ar-SA'];

export const isRtlLocale = (locale: string): boolean =>
  RTL_LOCALES.includes(locale as AppLocale);
