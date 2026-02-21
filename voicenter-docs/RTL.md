# Adding Hebrew and RTL to a Twenty CRM fork

**Twenty CRM already ships a mature Lingui-based i18n system with 26+ languages and Crowdin automation — Hebrew translation is mostly a configuration task.** The real engineering challenge is RTL layout support, which is completely absent from the codebase. Complicating matters, Twenty is actively migrating from Emotion (runtime CSS-in-JS) to Linaria (zero-runtime, build-time extraction), creating a dual styling pipeline that requires **two separate RTL flipping mechanisms**. This report lays out the minimal-change strategy for both translation and layout, covering every layer of the stack.

---

## Twenty's stack shapes the entire approach

Twenty's CRM frontend (`twenty-front`) is a **React 18 SPA** bundled with **Vite 7**, written entirely in TypeScript. State lives in **Recoil** (client) and **Apollo Client 3** (GraphQL server cache). Routing uses **react-router-dom 6**. There is no Next.js — that powers only the marketing site.

The UI is built on a fully custom component library (`twenty-ui`) organized into Display, Input, Feedback, and Navigation categories. **No external component library** (MUI, Chakra, Radix) is used. Icons come exclusively from **@tabler/icons-react 3.31**. Popovers and tooltips use **@floating-ui/react**, animations use **framer-motion 11**, rich text editing relies on **@tiptap/react 3** and **@blocknote/react**, and charts use **@nivo 0.99**. Forms are managed with **react-hook-form 7** and validated with **zod**.

The styling story is where things get interesting for RTL. The established approach is **Emotion** (`@emotion/styled` 11 + `@emotion/react` 11) with a comprehensive theme system (`ThemeProvider` with tokens for colors, spacing, typography). All styled components follow a `StyledFoo` naming convention. However, Twenty is **actively migrating performance-critical components to Linaria** (`@linaria/react` 6.2 + `@linaria/core` 6.2), which extracts CSS at build time via `@wyw-in-js/vite`. Emotion still covers the majority of components; Linaria targets render-heavy areas like the record table. This dual pipeline is the single biggest complication for RTL support.

---

## Translation infrastructure already exists — just add Hebrew

Twenty integrated **Lingui** (`@lingui/core`, `@lingui/react`, `@lingui/cli`, `@lingui/swc-plugin` — all v5.1.2) in January 2025, driven primarily by core maintainer FelixMalfait. The system is production-grade:

- **Source strings** use Lingui's `t` tagged template literals and `<Trans>` macros in frontend code, with extraction via `lingui extract`. Message catalogs live in **PO format** under `packages/twenty-front/src/locales/` and `packages/twenty-server/src/engine/core-modules/i18n/locales/`.
- **Translation management** runs through **Crowdin** with fully automated GitHub Actions: `i18n-push.yaml` uploads source strings to Crowdin on every `main` push; `i18n-pull.yaml` downloads translations every 2 hours, compiles them, and auto-creates PRs on an `i18n` branch. Automated `i18n - translations` PRs ship multiple times per week.
- **26+ languages** are supported, including Arabic (`ar-SA`) — but Arabic has translations only, with no RTL layout. Hebrew (`he` / `he-IL`) is **not yet a target language**.
- A **feature flag** (`IsLocalizationEnabled`) gates the locale picker in Settings → Appearance. The frontend sends an `x-locale` header with GraphQL requests so the server translates metadata labels.
- Coverage spans settings pages, authentication flows, object metadata, core view names, CSV import, aggregate operations, workspace management, and billing copy. Some strings remain untranslated in non-English locales.

**Adding Hebrew translations requires these steps:**

1. Add `he` as a target locale in `packages/twenty-front/lingui.config.ts` and the Crowdin project configuration (`crowdin.yml`).
2. Run `lingui extract` to generate the initial `he.po` file with all source strings.
3. Upload to Crowdin; translate (or use Crowdin's machine translation as a starting point and refine).
4. Add the `he-IL` locale entry to the server's i18n module for server-side metadata translation.
5. Register Hebrew in the `LocalePicker` component so users can select it.

Because the Lingui infrastructure and Crowdin pipeline are mature, **the translation layer is the easy part**. The hard part is everything below.

---

## RTL layout requires a dual-pipeline flipping strategy

Twenty has **zero RTL support today** — no `direction: rtl` anywhere, no CSS logical properties, no RTL-related GitHub issues or PRs, no bidirectional text handling. Every directional CSS property uses physical values (`margin-left`, `padding-right`, `left`, `text-align: left`). Adding RTL therefore means flipping the entire layout.

The dual Emotion+Linaria styling system demands **two complementary RTL mechanisms**:

**For Emotion styles (majority of the codebase):** Use `stylis-plugin-rtl` v2 with `@emotion/cache`. This hooks into Emotion's runtime Stylis preprocessor and automatically flips directional CSS properties (margins, padding, positioning, borders, border-radius, floats, text-align, `translateX`) at style injection time. Setup touches **2–3 files**: create LTR and RTL cache instances, wrap the app root in `<CacheProvider>` that switches based on locale direction, and set `dir="rtl"` on `<html>`. This is the same approach used by MUI, Mantine, and Chakra UI. Use `/*! @noflip */` (with exclamation mark to survive minification) to exempt specific rules.

**For Linaria styles (performance-critical components, growing share):** Use `postcss-rtlcss` as a PostCSS plugin in Vite's build pipeline. Since Linaria extracts CSS at build time and feeds it through Vite's standard CSS processing, PostCSS plugins apply to Linaria output. In its "combined" mode, `postcss-rtlcss` generates both `[dir="ltr"]` and `[dir="rtl"]` rule variants in a single stylesheet, so the correct layout activates based on the `dir` attribute on `<html>`. One critical configuration: enable `keepComments: true` in the `@wyw-in-js/vite` plugin options. Without this, Linaria's internal Stylis preprocessing strips CSS comments, destroying `/*rtl:ignore*/` control directives before they reach PostCSS.

The Vite configuration changes look like this:

```ts
// vite.config.ts additions
import wyw from '@wyw-in-js/vite';
import postcssRtlcss from 'postcss-rtlcss';

export default defineConfig({
  plugins: [
    wyw({ keepComments: true }), // preserve RTL directives
    // ... existing plugins
  ],
  css: {
    postcss: {
      plugins: [postcssRtlcss()],
    },
  },
});
```

```ts
// rtlCache.ts — new file
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
```

Both mechanisms coexist cleanly because they target different CSS outputs. **The net effect is that ~90% of directional styles flip automatically** without touching any component code.

---

## Handling icons, charts, portals, and edge cases

The automatic flipping covers the bulk of layout work, but roughly **5–10% of the UI needs manual attention**:

**Icons.** Tabler icons that imply direction — back arrows, forward chevrons, undo/redo, send, reply — must be mirrored. Apply `transform: scaleX(-1)` via a `[dir="rtl"]` selector or a direction-aware wrapper component. Icons that should *not* mirror include search, close/X, download, checkmarks, media playback controls, and refresh. Create a utility like `<DirectionalIcon icon={IconArrowLeft} mirror />` that reads direction from context.

**Charts (@nivo).** Chart axes and data flow should generally remain LTR — Arabic and Hebrew readers are accustomed to left-to-right charts. Wrap chart containers in `dir="ltr"` and mark their Emotion styles with `/*! @noflip */`. Text labels and legends within charts need explicit RTL handling (right-aligned legend items, RTL text direction on labels).

**Portals (modals, tooltips, dropdowns).** Components rendered via React portals escape the DOM tree and may not inherit the `dir` attribute. Floating UI and framer-motion powered popovers need explicit `dir="rtl"` set on their portal root elements. Audit every use of `@floating-ui/react` to ensure correct placement (`start`/`end` instead of `left`/`right`).

**Rich text editors.** Both TipTap and BlockNote support `dir` attributes on their editor containers. Set `dir="rtl"` on the editor root and test toolbar button order, list indentation direction, and text alignment defaults.

**Animations.** `translateX()` values are auto-negated by `stylis-plugin-rtl`. However, `transition` property strings referencing `left` or `right` may not convert fully — use `transition: inset-inline-start 300ms` (logical property) or explicitly specify both `left` and `right` in transition lists. Directional `@keyframes` need manual RTL variants.

**CSS variables.** Values inside `var(--custom-property)` are resolved at browser computation time and cannot be flipped by any preprocessor. If any CSS variables encode directional values, add RTL-aware alternatives.

---

## Hebrew-specific font, locale, and BiDi decisions

**Fonts.** The best all-in-one choice is **Rubik** (Google Fonts, variable weight 300–900), which covers both Hebrew and Latin scripts with consistent visual weight and a slightly rounded, friendly aesthetic well-suited to CRM interfaces. Alternatives include **Heebo** (geometric, based on Roboto's Latin shapes, most popular Hebrew web font) and **Noto Sans Hebrew** paired with Noto Sans for maximum script consistency. All three are variable fonts with excellent web performance. Set a fallback stack: `font-family: 'Rubik', 'Arial Hebrew', 'Noto Sans Hebrew', sans-serif`. Hebrew text generally benefits from **slightly larger font sizes** than Latin text at equivalent optical size — consider a 5–10% bump for Hebrew-only strings or test thoroughly at existing sizes.

**Number and date formatting.** Israel uses `dd.mm.yyyy` dates, **24-hour** time, period as decimal separator, and comma as thousands separator (same as US English numbering). The shekel symbol (**₪**) appears *after* the number. All of this works correctly via the browser's built-in `Intl.DateTimeFormat('he-IL')` and `Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' })`. Twenty already uses **date-fns 2.30** for date manipulation — configure it with the `he` locale from `date-fns/locale/he`. Verify that date-fns formatting functions receive the correct locale when Hebrew is active.

**Mixed-direction content (BiDi).** A CRM inherently mixes Hebrew and English: Hebrew contact descriptions alongside English company names, email addresses, URLs, and phone numbers. The critical tools are:

- `dir="auto"` on text inputs — the browser sets direction based on the first strongly-typed character, handling Hebrew/English switching gracefully.
- `<bdi>` elements around dynamically inserted values (contact names, company names, email addresses) to isolate their directionality from surrounding text.
- `dir="ltr"` explicitly on email, phone, and URL input fields, since these are always LTR content.
- `unicode-bidi: isolate` in CSS for inline elements displaying mixed-direction data.

**Input handling.** Hebrew keyboard input is straightforward (no IME complexity like CJK). Users frequently toggle between Hebrew and English layouts via OS shortcuts. Ensure placeholders display in the correct direction, cursors start on the correct side, and `dir="auto"` is set on free-text fields.

---

## Phased implementation plan minimizes risk

The entire effort breaks into three phases, ordered by impact and dependency:

**Phase 1 — RTL infrastructure (3–5 days).** Install `stylis-plugin-rtl` and `postcss-rtlcss`. Create the dual Emotion cache setup. Configure `@wyw-in-js/vite` with `keepComments: true`. Add `postcss-rtlcss` to Vite's PostCSS config. Build a `useDirection()` hook or React context that reads the current locale from Lingui and returns `'rtl'` or `'ltr'`. Wire the `<CacheProvider>` swap and `document.documentElement.dir` toggle to this context. At this point, switching to any RTL locale flips the entire layout automatically. Run through the app and catalog what breaks.

**Phase 2 — Manual fixes and Hebrew locale (1–2 weeks).** Add Hebrew to `lingui.config.ts` and Crowdin. Generate the `he.po` file and begin translation (machine-translate first, refine later). Fix the ~5–10% of UI that automatic flipping handles incorrectly: mirror directional icons, wrap charts in `dir="ltr"`, fix portal `dir` attributes, adjust animations, handle mixed-content BiDi with `<bdi>` and `dir="auto"`. Add the Rubik variable font. Register `he-IL` formatting with date-fns and verify `Intl` API output for dates, numbers, and currency. Update the `LocalePicker` to include Hebrew.

**Phase 3 — Hardening and progressive modernization (ongoing).** Write Playwright tests for RTL layout (Twenty already has `twenty-e2e-testing` with Playwright). Add a Chromatic Storybook story set that renders every `twenty-ui` component in RTL mode to catch visual regressions. Introduce a stylelint rule that warns on new physical directional properties (`margin-left`, `padding-right`, etc.) and encourages CSS logical properties in new code. Over time, convert existing physical properties to logical properties, reducing dependency on the runtime and build-time flipping plugins.

---

## Conclusion

The path to Hebrew support in a Twenty CRM fork is less daunting than it first appears, because **the hardest infrastructure problem — i18n — is already solved**. Lingui + Crowdin handle string translation; Hebrew is just another locale to register. The RTL layout challenge, while genuine, has a well-established solution in `stylis-plugin-rtl` that automatically flips ~90% of Emotion-generated CSS. The only unusual wrinkle is Twenty's ongoing migration to Linaria, which requires a parallel `postcss-rtlcss` pipeline — but the `keepComments` option on `@wyw-in-js/vite` makes this work cleanly. The total infrastructure change touches roughly **4–6 files** for the automatic flipping layer, with the remaining effort concentrated in manual fixes for icons, charts, portals, and BiDi edge cases typical of any RTL adaptation.