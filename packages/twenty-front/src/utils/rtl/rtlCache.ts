// Modified by Voicenter — 2026-02-20
// Description: Emotion cache instances for LTR/RTL layout switching
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';

export const rtlCache = createCache({
  key: 'twenty-rtl',
  stylisPlugins: [prefixer, rtlPlugin],
});

export const ltrCache = createCache({
  key: 'twenty-ltr',
  stylisPlugins: [prefixer],
});
