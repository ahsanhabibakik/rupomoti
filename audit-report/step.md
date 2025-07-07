# Rupomoti Optimization Task Plan (Step‑by‑Step with Copilot)

*Version 1.0 · Generated 07 Jul 2025*

---

## 0 » How to Use This Guide

1. **Open GitHub Copilot Chat** inside VS Code.
2. For each task below, **copy the suggested prompt** into Copilot Chat in the *root* of the repo.
3. Let Copilot propose code diffs ➝ review ➝ commit.
4. Run the *Acceptance Check* locally before merging.
5. Track progress in the **Kanban table** at the end.

> **Tip:** Always create a new branch per numbered task (e.g. `perf/01‑remove-console-logs`).

---

## 📆 Phase 1 — Quick Wins (Week 1‑2)

| #     | Task                                            | Copilot Prompt                                                                                                                                                       | Acceptance Check                                                      |                   |
| ----- | ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | ----------------- |
| **1** | **Remove all `console.log` in production code** | "Find and delete every `console.log` or `console.debug` in `/app`, `/components`, and `/lib` except inside test files. Replace with structured logger where needed." | `pnpm eslint . --max-warnings=0` passes; \`grep -R "console.log(" src | wc -l\` returns 0 |
| **2** | **Enable Bundle Analyzer**                      | "Add `@next/bundle-analyzer` with `analyze` script and update `next.config.js` so `ANALYZE=true pnpm build` opens the report."                                       | Running `ANALYZE=true pnpm build` produces `analyze/client.html`.     |                   |
| **3** | **Consolidate icon libraries to Lucide**        | "Remove `@heroicons/react` and `react-icons`. Replace their usages with equivalent `lucide-react` icons via automatic codemod."                                      | `pnpm build` bundle size shrinks ≥ 80 kB (check analyzer).            |                   |

---

## 📆 Phase 2 — Medium Effort (Week 3‑4)

| #     | Task                                | Copilot Prompt                                                                                                                                                                                             | Acceptance Check                                                          |
| ----- | ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| **4** | **Split the 1 884‑line global CSS** | "Move theme variables to `/styles/theme.css`, animations to `/styles/animations.css`, and import critical above‑the‑fold styles inline in `_app.tsx`. Remove unused classes via Tailwind `content` purge." | First load CSS ≤ 60 kB; visual regression tests pass.                     |
| **5** | **Migrate SWR to React Query**      | "Identify all `useSWR` hooks, convert them to `useQuery` with identical keys and stale‑time. Remove `swr` from `package.json` and update docs."                                                            | `pnpm test` passes; no `useSWR(` strings remain.                          |
| **6** | **Optimize Framer Motion usage**    | "Audit imports from `framer-motion`. Replace simple fade/slide animations with Tailwind CSS transitions, and convert remaining motion components to lazy‑loaded dynamic imports."                          | Bundle analyzer shows Framer Motion < 50 kB; page interactions unchanged. |

---

## 📆 Phase 3 — High Impact (Week 5‑8)

| #     | Task                                       | Copilot Prompt                                                                                                                                                                                                      | Acceptance Check                                                                            |
| ----- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| **7** | **Database query optimisation & indexing** | "For every Prisma query in `/prisma/queries/**`, replace `select *`‑like calls with explicit `select` fields. Add indexes for `order.status`, `product.categoryId`, `user.email`. Provide corresponding migration." | Prisma migration applies; `pnpm test:e2e` passes; slow‑query log shows > 50 % latency drop. |
| **8** | **Server Components migration**            | "List React components under `/app/(shop)/product/**` that do not need client‑side interactivity. Convert them to Server Components and add `'use client'` only where strictly required."                           | Lighthouse FCP improves ≥ 15 %; no hydration errors.                                        |

---

## ♻️ Ongoing / Monitoring

| Frequency    | Task                       | Copilot Prompt                                                                            | Metric                     |
| ------------ | -------------------------- | ----------------------------------------------------------------------------------------- | -------------------------- |
| CI (each PR) | **TypeScript strict mode** | "Enable `strict: true` in `tsconfig.json` and fix surfaced errors incrementally."         | `pnpm tsc --noEmit` passes |
| Weekly       | **Lighthouse CI budget**   | "Add Lighthouse CI config with budgets: LCP < 2.5 s, CLS < 0.1, total JS ≤ 160 kB."       | `lhci autorun` passes      |
| Monthly      | **Dependency audit**       | "Run `pnpm audit` and `pnpm exec npm-check -u` then patch or remove vulnerable packages." | 0 critical vulnerabilities |

---

## 📊 Kanban Overview

| Task                  | Status | Owner | ETA |
| --------------------- | ------ | ----- | --- |
| 1 Remove console logs | ☐      |       |     |
| 2 Bundle analyzer     | ☐      |       |     |
| 3 Icons consolidation | ☐      |       |     |
| 4 CSS split           | ☐      |       |     |
| 5 SWR → React Query   | ☐      |       |     |
| 6 Framer Motion slim  | ☐      |       |     |
| 7 DB optimisations    | ☐      |       |     |
| 8 Server Components   | ☐      |       |     |
| TS strict mode        | ☐      |       |     |
| Lighthouse budgets    | ☐      |       |     |
| Dependency audit      | ☐      |       |     |

*Add your initials and target dates as you pick up tasks.*
