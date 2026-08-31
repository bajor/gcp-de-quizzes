---
type: Constitution
title: Professional Data Engineer Practice Exam Constitution
description: Foundational scope, data model, and non-negotiables for the practice exam simulator.
status: Ratified
timestamp: 2026-08-31T00:00:00Z
---

# Product Constitution

## Product

The product is a personal practice exam simulator for candidates preparing for the Google Cloud Professional Data Engineer certification. It provides realistic, original questions with explanations grounded in current Google-owned documentation.

## Scope Boundaries

In scope:

- Timed 50-question practice attempts.
- Single-choice and multiple-select questions.
- Local attempt recovery, scoring, section breakdowns, and answer review.
- Original question sets mapped to the current official exam guide.
- Documentation evidence for every answer and distractor.

Explicitly out of scope:

- Exam dumps, reconstructed live exam content, or unauthorized question collections.
- Claims that a practice percentage predicts Google's pass or fail decision.
- Accounts, remote persistence, analytics, payments, or a server-side API.
- Reproduction of Google's official sample form inside this application.

## Data Model Foundation

A question set contains exactly 50 questions. Each question belongs to one exam-guide section, has either single-choice or multiple-select answer semantics, and cites one or more Google-owned sources. An attempt records answers, review flags, position, start time, and deadline for one question set. A completed attempt produces a result without changing the source question set.

Invalid question states must be rejected by TypeScript types and question-bank validation. In particular, answer identifiers must exist among the choices, multiple-select questions must declare the required selection count, and every choice must have feedback supported by cited evidence.

## Non-negotiables

- Every published question is original and mapped to the current official exam guide.
- Every correct answer and distractor explanation is supported by current Google-owned documentation.
- Every question records the date on which its sources were verified.
- Ambiguous, deprecated, preview-dependent, or unsupported questions are rejected.
- A separate reviewer re-fetches the evidence before a question set is activated.
- The application never presents a practice percentage as Google's unpublished passing score.
- The deployed application remains usable on current desktop and mobile browsers.

## Amendment Log

No amendments.
