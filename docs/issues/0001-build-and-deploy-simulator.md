---
type: Issue
title: Build and deploy the documentation-backed simulator
description: Implement, verify, and deploy the first complete practice exam.
status: in-progress
labels: [feature, content]
blocked_by: []
tracker: "#1"
timestamp: 2026-08-31T00:00:00Z
---

## Build and deploy the documentation-backed simulator

Implement [PRD 0001](/prd/0001-documentation-backed-exam-simulator.md), [ADR 0001](/adr/0001-static-typed-application.md), [BDR 0001](/bdr/0001-exam-attempt-and-scoring.md), and [BDR 0003](/bdr/0003-content-bound-question-activation.md), based on [exam-format research](/research/0001-exam-format-and-content-policy.md).

### Scope

Create the static application, all 50 independently sourced questions, test and source-verification gates, question-authoring skill, GitHub Pages workflow, README instructions, and live deployment.

### Acceptance

- The application behavior and question distribution satisfy PRD 0001.
- Every question passes structural, source, and independent semantic review.
- `make test` and `make verify-sources` pass.
- The README links to a working GitHub Pages deployment.

### Plan

Deliver focused foundation, exam-section content, authoring workflow, and deployment changes. Merge each change only after its quality gates and review succeed.

### Progress

- The simulator foundation, authoring workflow, and GitHub Pages deployment are complete.
- The `design` section contributes 11 structurally valid, source-verified questions authored by `gpt-5.6-sol-design-20260901` and accepted in independent section review by `reviewer-design-20260901-c`.
- The remaining `ingest`, `store`, `analyze`, and `operate` sections contribute 0 of their required 39 questions.
- Candidate assembly, final independent review, and activation remain blocked until all five sections are complete.
