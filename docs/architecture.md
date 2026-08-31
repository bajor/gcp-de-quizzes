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

The browser loads a static React application from GitHub Pages. The application imports immutable TypeScript question sets, stores the current or completed attempt in browser `localStorage`, and opens cited Google Cloud documentation in external pages. There is no application server or user account. The application shell is implemented; the active registry remains empty until the first 50-question set passes [the documented activation gate](/bdr/0002-question-validation-and-activation.md).

## Module Ownership

| Module | Ownership |
|---|---|
| `src/domain/` | Owns question types, attempt state, scoring, structural validation, and persistence contracts. |
| `src/data/questionSets/` | Owns immutable, versioned question content and the active set registry. Activation joins a candidate with its independent review document. |
| `docs/reviews/` | Owns independently authored semantic review records consumed by the activation gate. |
| `src/components/` | Owns start, exam, navigation, submission, and result-review interfaces. |
| `src/App.tsx` | Owns screen transitions and restoration of the persisted attempt. |
| `scripts/` | Owns documentation checks and live question-source validation. |
| `.github/workflows/` | Owns continuous integration, visual cleanup, and GitHub Pages deployment. |

```mermaid
flowchart LR
  Pages[GitHub Pages] --> App[src/App.tsx]
  Draft[Candidate question sets] --> Verify[Structural and live-source verification]
  Verify --> Review[Independent review document]
  Review --> Registry[Active question-set registry]
  Registry --> App
  App --> Components[src/components]
  App --> Domain[src/domain]
  Domain --> Storage[Browser localStorage]
  Components --> Sources[Google Cloud documentation]
```

The Pages workflow serves the compiled application. `make verify-sources` structurally validates source-check candidates and fetches every unique evidence URL before independent review. `src/data/questionSets/index.ts` then refuses to activate a candidate unless the matching `docs/reviews/<set-id>.md` machine record passes provenance validation. `App.tsx` joins the active registry, domain behavior, and screen components. Domain persistence is the only mutable storage boundary. Result links open Google Cloud source evidence outside the application.

## Attempt Data Flow

1. The candidate starts the active question set.
2. The application creates an attempt with an absolute two-hour deadline.
3. Answer, navigation, and review-flag changes replace the immutable attempt state and persist it locally.
4. Manual submission or deadline expiration creates a completed result.
5. Scoring compares answer identifier sets exactly and calculates total and section percentages.
6. Result review joins each response with choice feedback and source evidence from the immutable question set.

```mermaid
stateDiagram-v2
  [*] --> Ready
  Ready --> InProgress: Start
  InProgress --> InProgress: Answer, navigate, or mark
  InProgress --> Completed: Confirm finish
  InProgress --> Completed: Deadline expires
  InProgress --> InProgress: Reload compatible attempt
  Completed --> Completed: Reload completed attempt
  Completed --> InProgress: Confirm new attempt
```

Every in-progress state change is saved under the versioned attempt storage key. Reload restores only state compatible with the active set; malformed or mismatched data is removed. Completed attempts remain read-only until the candidate confirms replacement.

## Deployment

Vite builds the static site with `/gcp-de-quizzes/` as its base path. After every push to `main`, `.github/workflows/pages.yml` installs the browser test runtime, runs `make test` and `make verify-sources`, uploads `dist/` only if both gates pass, and deploys the artifact to the `github-pages` environment.

## Drift Control

`make test` checks documentation structure, TypeScript, ESLint, unit and component behavior, the production build, and desktop and mobile browser flows. Question invariants are checked by `validateQuestionSet`; `make verify-sources` checks the candidate registry and live URLs. Deployment is checked by the Pages workflow and requires a live URL smoke test before the full issue closes.

## Related Decisions

- [Static typed application architecture](/adr/0001-static-typed-application.md)
- [Exam attempt and scoring behavior](/bdr/0001-exam-attempt-and-scoring.md)
