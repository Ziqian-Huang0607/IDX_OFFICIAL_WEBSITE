# AGENTS.md — IDX Academic Support Hub

Guidance for AI coding agents working in this repository. Everything below reflects the actual current state of the codebase (verify against the source before relying on details).

## Project Overview

`idx-hub` is a single-page Vue 3 application that serves PDF study guides to SHSID students. It is a fully static, client-side site — there is **no backend, no router library, and no state-management library**. The site has four views ("Study Hub", "Archive", "What's Coming Up", and "Toolbox") switched via conditional rendering (`v-if` / `v-else-if`) driven by a `currentView` ref. The Study Hub is the home view (latest PA Tech tools + quick links); the Archive hosts the study guides and the GPA Calculator promo; What's Coming Up lists future IDX plans.

The defining architectural idea is **filesystem-as-database**: study guides are not registered in any data file. Instead, PDF files are dropped into a folder convention under `src/guides/` and discovered at build time via Vite's `import.meta.glob`. See "Adding a study guide" below.

## Technology Stack

- **Vue 3** (`^3.5.24`) with `<script setup lang="ts">` SFCs, Composition API only
- **TypeScript** (`~5.9.3`) in strict mode
- **Vite via `rolldown-vite@7.2.5`** — note: `package.json` aliases `vite` to `npm:rolldown-vite` (both as devDependency and as an `overrides` entry). This is the Rolldown-based Vite, not stock esbuild/rollup Vite.
- **`@vitejs/plugin-vue`** for SFC compilation
- **`vue-tsc`** for type checking (part of the build script)
- **`@vercel/analytics`** — `inject()` is called in `src/main.ts`; deployment target is Vercel (no `vercel.json` in repo; config lives in the Vercel dashboard)

There is **no test framework, no linter, and no formatter** configured (no Vitest/Jest/ESLint/Prettier files exist).

## Build and Run Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Type-check with `vue-tsc -b`, then produce a static site in `dist/` |
| `npm run preview` | Serve the production `dist/` build locally |

`npm run build` is the only verification gate: it fails on any TypeScript error (strict mode, `noUnusedLocals`, `noUnusedParameters`, `noUncheckedSideEffectImports`, etc. — see `tsconfig.app.json`, which extends `@vue/tsconfig/tsconfig.dom.json`).

## Code Organization

```
index.html                 Entry HTML; mounts #app, loads /src/main.ts
src/main.ts                createApp(App) + Vercel Analytics inject()
src/App.vue                The entire application: all logic + template + scoped styles
src/types.ts               Shared interfaces: Guide, ExternalLink
src/data/links.ts          Registries of external links: `externalLinks` (Toolbox view) and `ecosystemTools` (PA Tech "Latest Tools" cards on the Study Hub home view)
src/guides/                PDF study guides (content, not code — see convention below)
src/assets/style.css       Global stylesheet: CSS variables, glassmorphism design system
src/components/HelloWorld.vue   UNUSED Vite scaffold leftover — not imported anywhere
public/                    Static assets served at root (logos: idx-logo.png, idx-icon.png, …)
```

### Architecture: Data–View separation

- **Data layer**: `src/guides/` (PDFs, auto-discovered) and `src/data/links.ts` (external links, manually maintained arrays typed by `ExternalResource` and `EcosystemTool`).
- **Logic layer**: the `<script setup>` block of `src/App.vue` — the auto-loader, `currentView`, subject/year filters, search query, spotlight mouse-tracking.
- **Presentation layer**: the `<template>` of `src/App.vue` plus global styles in `src/assets/style.css` (imported inside `App.vue`, deliberately **not** in `main.ts`) and scoped styles in `App.vue`'s `<style scoped>` block.

## The Guide Auto-Loader (core mechanism)

`src/App.vue` scans `src/guides/**/*.*` with `import.meta.glob(..., { eager: true, as: 'url' })` and parses each file path positionally:

```
src/guides/<year>/<subject>/<level>/<file>.pdf
        e.g. src/guides/28 IDX/Chemistry/H/IDX Study Guide S1 Finals Chemistry H.pdf
```

- `year` = first folder under `guides/` (e.g. `28 IDX` → displayed as "Class of 2028")
- `subject` = second folder (e.g. `Chemistry`)
- `level` = third folder (e.g. `H`, `S`, `H+`, `AP Calc`)
- Display name = filename minus extension, with `_` replaced by spaces

### Adding a study guide

Just drop the PDF into the correctly nested folder and commit — no code change, no registry edit. The file is bundled as a hashed asset and gets a download URL automatically. Folder names are `.trim()`ed, but avoid leading/trailing spaces anyway.

**Important consequence**: PDFs inside `src/` are processed by the bundler (content-hashed URLs). Do not move them to `public/` expecting stable paths, and do not reference them with hand-written URLs.

## View Management

No router. `const currentView = ref('hub')` in `App.vue` toggles views with `v-if` / `v-else-if` / `v-else`: `'hub'` = Study Hub (home), `'archive'` = Archive (study guides + GPA Calculator promo), `'upcoming'` = What's Coming Up (future plans), anything else = Toolbox. To add a page: extend the ref's possible values, add a `<div v-else-if="currentView === '...'">` block in `<main>` (insert it before the final `v-else` Toolbox block), and add a nav button in the header.

## Code Style Guidelines

- TypeScript strict mode is enforced by the build; keep everything typed. If a guide/tool gains a field, update the interface in `src/types.ts` (or `src/data/links.ts`) — the README insists on this.
- Vue SFCs use `<script setup lang="ts">`; stick to Composition API (`ref`, `computed`, `onMounted`).
- Filtering/search comparisons are always lowercased (`.toLowerCase()`) — preserve this for robustness.
- Global styles live in `src/assets/style.css` using CSS variables defined in `:root` (`--primary`, `--accent`, `--bg-dark`, `--glass`, `--glass-border`). The design system is dark "glassmorphism" (translucent cards + `backdrop-filter: blur()`). Component-specific styles go in `App.vue`'s `<style scoped>`.
- Comments in the codebase are in English; write all code, comments, and docs in English.
- Numbered section banners (`// 1. THE AUTO-LOADER`, `// 2. STATE MANAGEMENT`, …) organize the `App.vue` script — keep that convention when extending it.

## Testing Instructions

There is no test suite. Verification is:

1. `npm run build` must pass (type check + production bundle).
2. Manual smoke test with `npm run dev`: check that guide cards render, subject/year filters and search work, and PDF "GET" links open.

## Deployment

Static site: `npm run build` → `dist/`. Deployed on Vercel (implied by `@vercel/analytics`; no config file in the repo). If deploying under a subdirectory, set `base` in `vite.config.ts` (currently unset → defaults to `/`).

## Gotchas and Known Quirks

- **`README.md` is partially outdated**: it describes a `src/data/guides.ts` registry, `/public/guides/` PDF paths, and a `base: './'` in `vite.config.ts` — none of these exist anymore. The auto-loader in `App.vue` is the current mechanism. Trust the code over the README where they conflict.
- `index.html` references the favicon as `public/idx-icon.png`; the canonical Vite form for files in `public/` is `/idx-icon.png`. Be aware if touching the head tags.
- `src/components/HelloWorld.vue` is dead scaffold code (safe to delete, but nothing breaks if left).
- The spotlight effect depends on the global `mousemove` listener registered in `App.vue`'s `onMounted`; removing it silently kills the background effect.
- Guide folder/file names flow directly into the UI (subject grouping, filters, display names). Typos or inconsistent casing in folder names create duplicate/fragmented subject cards (grouping normalizes case, but display names are derived from folder names).
- Emoji icons are used in UI data (e.g. `quickTools` in `App.vue`); match the existing style if editing those lists.

## Contact / Ownership

Maintained by @Ziqian-Huang0607 for SHSID students (see README footer).
