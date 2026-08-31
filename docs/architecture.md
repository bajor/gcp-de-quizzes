---
type: Architecture View
title: Practice Exam Architecture
description: Static application modules, runtime data flow, persistence boundary, and deployment ownership.
status: Accepted
tags: [architecture]
timestamp: 2026-08-31T00:00:00Z
---

# Practice Exam Architecture

## Target Context

This view specifies the target created by [issue 0001](/issues/0001-build-and-deploy-simulator.md); implementation is pending until that issue closes. The browser will load a static React application from GitHub Pages. The application will import immutable TypeScript question sets, store the current or completed attempt in browser `localStorage`, and open cited Google Cloud documentation in external pages. There will be no application server or user account.

## Module Ownership

| Module | Ownership |
|---|---|
| `src/domain/` | Will own question types, attempt state, scoring, validation, and persistence contracts. |
| `src/data/questionSets/` | Will own immutable, versioned question content and the active set registry. |
| `src/components/` | Will own start, exam, navigation, submission, and result-review interfaces. |
| `src/App.tsx` | Will own screen transitions and restoration of the persisted attempt. |
| `scripts/` | Owns documentation checks and will own question-bank and live source validation. |
| `.github/workflows/` | Owns visual cleanup and will own continuous integration and GitHub Pages deployment. |

## Attempt Data Flow

1. The candidate starts the active question set.
2. The application creates an attempt with an absolute two-hour deadline.
3. Answer, navigation, and review-flag changes replace the immutable attempt state and persist it locally.
4. Manual submission or deadline expiration creates a completed result.
5. Scoring compares answer identifier sets exactly and calculates total and section percentages.
6. Result review joins each response with choice feedback and source evidence from the immutable question set.

## Deployment

Vite will build the static site with `/gcp-de-quizzes/` as its base path. GitHub Actions will upload `dist/` as a Pages artifact and deploy it to the `github-pages` environment.

## Drift Control

Documentation structure is checked now by `make docs`. Once implementation lands, module boundaries will be checked by TypeScript, question invariants by automated bank validation, runtime flow by component and browser tests, and deployment by the Pages workflow plus a live URL smoke test.

## Related Decisions

- [Static typed application architecture](/adr/0001-static-typed-application.md)
- [Exam attempt and scoring behavior](/bdr/0001-exam-attempt-and-scoring.md)
