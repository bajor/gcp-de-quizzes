---
type: PRD
title: Documentation-backed exam simulator
description: A timed and recoverable 50-question simulator with cited answer review.
status: Accepted
superseded_by:
tags: [exam, practice]
timestamp: 2026-08-31T00:00:00Z
---

# 0001. Documentation-backed exam simulator

## Problem / Motivation

A candidate preparing for the Professional Data Engineer exam on September 17, 2026 needs realistic full-length practice without learning incorrect, outdated, or leaked material. Official sample questions demonstrate format but do not provide a complete, repeatable simulator with documentation-backed explanations.

## Goals

- Provide a realistic maximum-length attempt within Google's published 40-50 question range.
- Explain every answer and distractor using current Google-owned documentation.
- Preserve progress through accidental refreshes while keeping all data on the candidate's device.
- Make additional independently verified question sets straightforward to add.

## Non-goals

- Predict Google's pass or fail result.
- Duplicate official samples or third-party practice banks.
- Provide identity, synchronization, analytics, or administrative interfaces.

## Requirements

1. An attempt contains 50 questions and lasts two hours.
2. Questions appear one at a time with previous, next, direct-number, and mark-for-review navigation.
3. The interface distinguishes answered, unanswered, current, and marked questions without relying only on color.
4. The deadline auto-submits the attempt at zero.
5. Refreshing or reopening the browser restores a compatible active attempt without resetting its deadline.
6. Manual submission confirms the number of unanswered and marked questions.
7. Exact-match scoring reports a total percentage and section percentages.
8. Results show the response, correct choice or choices, feedback for every choice, and cited source links.
9. The application does not display a passing threshold.
10. The first set uses the selected practice distribution of 11, 12, 10, 8, and 9 questions across sections 1 through 5, closely approximating the official guide weights.
11. The application works from the GitHub Pages project path on desktop and mobile.

## Quality Requirements

| Quality attribute | Scenario | Verified by |
|---|---|---|
| Correctness | A question author changes a set; during validation, unsupported or malformed content blocks activation; every active question passes structural and independent evidence review. | Question-bank tests, `make verify-sources`, and reviewer record. |
| Recoverability | A candidate refreshes during an attempt; the browser reloads compatible state; answers and the original absolute deadline are retained. | Component and end-to-end restoration tests. |
| Accessibility | A keyboard or screen-reader user takes an attempt in a current browser; controls expose names, states, and focus order without color-only meaning. | Semantic component tests and Playwright keyboard checks. |
| Portability | GitHub Pages requests the project subpath after a production deployment; static assets resolve and the start screen renders. | Production build and deployed URL smoke test. |

## Acceptance Criteria

- A candidate can complete and review a 50-question timed attempt at the deployed URL.
- The score and each question's correctness are reproducible from answer identifier sets.
- Every active question carries choice feedback, Google-owned sources, and a verification date.
- A 390 by 844 pixel mobile viewport and a 1280 by 720 pixel desktop viewport expose all attempt controls without horizontal page scrolling.
- `make test` and `make verify-sources` pass before release.

## Success Metrics

The static application collects no analytics. Success is therefore assessed by the candidate: at least one complete 50-question attempt can be finished and reviewed before September 17, 2026 without encountering an unsupported answer or broken source link.

## Behavior

- [Exam attempt and scoring behavior](/bdr/0001-exam-attempt-and-scoring.md)
- [Question validation and activation behavior](/bdr/0002-question-validation-and-activation.md)

## Open Questions

None.

## Decision Log

- [Static typed application architecture](/adr/0001-static-typed-application.md)
- [Exam attempt and scoring behavior](/bdr/0001-exam-attempt-and-scoring.md)
- [Question validation and activation behavior](/bdr/0002-question-validation-and-activation.md)

## Related

- Constitution: [/constitution.md](/constitution.md)
- Issue: [/issues/0001-build-and-deploy-simulator.md](/issues/0001-build-and-deploy-simulator.md)
- Research: [/research/0001-exam-format-and-content-policy.md](/research/0001-exam-format-and-content-policy.md)
