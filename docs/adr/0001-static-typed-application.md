---
type: ADR
title: Static typed application architecture
description: Use React, TypeScript, Vite, local browser persistence, and GitHub Pages.
status: Accepted
supersedes:
superseded_by:
tags: [frontend, deployment]
timestamp: 2026-08-31T00:00:00Z
---

# 0001. Static typed application architecture

## Context

The [product requirements](/prd/0001-documentation-backed-exam-simulator.md) need multiple interactive screens, strict question-data invariants, automated browser tests, no server-side features, and deployment to GitHub Pages. [Exam research](/research/0001-exam-format-and-content-policy.md) establishes the current format constraints. The candidate explicitly selected React with TypeScript and Vite, fixed 50-question attempts, two-hour auto-submission, and browser-local attempt recovery.

## Decision

Use React, TypeScript, and Vite for a static application. Model questions with discriminated unions, keep question sets in compiled TypeScript modules, persist the active attempt in `localStorage`, and deploy the generated `dist/` directory through GitHub Pages Actions.

## Alternatives Considered

Plain TypeScript with Vite was rejected because the reduced dependency count did not outweigh more manual screen lifecycle, state, and accessible component code. A server-backed application was rejected because accounts and cross-device state are outside scope. No persistence was rejected because an accidental refresh would invalidate a two-hour practice attempt. A random 40-50 count and fixed 40 count were rejected in favor of the selected maximum-length 50-question practice.

## Consequences

Easier or gained:

- Compile-time question modeling and direct reuse of immutable content in validation and UI.
- Focused component tests and mature browser testing.
- Zero application-server operations and low-cost static hosting.

Harder or accepted trade-offs:

- Correct answers are present in the downloaded client bundle and are not secret.
- Attempts remain on one browser profile and are cleared with browser storage.
- React and test tooling add development dependencies.

Follow-ups:

- Implement [the simulator issue](/issues/0001-build-and-deploy-simulator.md).
- Use the question-authoring skill for future sets.

## Verification

Implementation impact: `src/`, `scripts/`, `vite.config.ts`, and `.github/workflows/`.

Verification criteria:

- TypeScript rejects mismatched question variants and answer shapes.
- Production assets resolve below `/gcp-de-quizzes/`.
- Browser tests restore an attempt without extending its deadline.

# References

[1] GITHUB. **Using custom workflows with GitHub Pages**. Available at: <https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages>. Accessed on: 2026-08-31.
