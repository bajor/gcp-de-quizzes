---
type: BDR
title: Question validation and activation
description: Observable evidence, structural validation, independent review, and activation behavior for question sets.
status: Superseded
superseded_by: 0003
tags: [questions, sources]
timestamp: 2026-08-31T00:00:00Z
---

# 0002. Question validation and activation

Superseded by [BDR 0003](/bdr/0003-content-bound-question-activation.md).

## Context

The [constitution](/constitution.md) prohibits unsupported questions. The [product requirements](/prd/0001-documentation-backed-exam-simulator.md) require every choice explanation to be grounded in current Google-owned documentation before a set becomes active.

## Behavior Flow

| State | Trigger | Next state | Observable result |
|---|---|---|---|
| Draft section | Author adds questions | Structurally checked | Invalid identifiers, counts, mappings, or evidence fail the quality gate. |
| Structurally checked | Source verifier fetches cited URLs | Source checked | Non-Google, unreachable, or missing evidence fails the quality gate. |
| Source checked | Independent reviewer evaluates every choice | Reviewed or rejected | A review record identifies every accepted question or a required correction. |
| Reviewed | Registry includes complete set | Active | Exactly one complete 50-question set is available to the application. |

## Textual Description

Every question declares an exam-guide objective, four or five choices, correct answer identifiers, feedback for each choice, source evidence, and one authoritative `verifiedOn` date. Choice feedback references the evidence identifiers that support it. Structural validation rejects duplicate identifiers, invalid answer references, wrong section counts, missing feedback, missing evidence references, non-Google URLs, and multiple-select counts that do not match the answer key.

Live source verification re-fetches every unique URL and rejects failures. A reviewer other than the authoring agent then re-fetches the cited pages and evaluates whether the prompt has enough information, exactly the declared number of choices satisfy every requirement, each distractor fails a named requirement, terminology is current, and no required behavior is preview-only or deprecated.

The reviewer records their agent or session identifier, the distinct authoring identifiers, review date, source-check command and result, reviewed source count, accepted question identifiers, and any rejected identifiers with reasons in `docs/reviews/<set-id>.md`. Validation rejects a missing reviewer identifier, an identifier also listed as an author, a stale review date older than any question's `verifiedOn`, a failed source result, or an accepted list that does not exactly equal all 50 question identifiers. The registry cannot import the set until this provenance check passes.

## Scenarios

**Scenario 1: Reject malformed content**

- Given a question with an answer identifier absent from its choices
- When question-bank validation runs
- Then validation fails and the set cannot become active

**Scenario 2: Reject unsupported content**

- Given a choice explanation with no cited supporting evidence
- When source and semantic review run
- Then review rejects the question and identifies the missing support

**Scenario 3: Activate a reviewed set**

- Given 50 structurally valid questions with reachable sources and an independent record accepting every identifier
- When the set is added to the active registry
- Then application tests pass and the set appears on the ready screen

## Test Design

| Case | Level | Input or scenario | Observable assertion | Proves |
|---|---|---|---|---|
| Invalid answer | Unit | Unknown correct choice identifier | Validation error names question | Invalid keys cannot activate. |
| Missing evidence | Unit | Feedback with no evidence reference | Validation error names choice | Unsupported feedback cannot activate. |
| Distribution | Unit | Section count differs from 11/12/10/8/9 | Validation fails | Set follows its declared blueprint. |
| URL policy | Unit | Non-Google source host | Validation fails | Technical evidence stays Google-owned. |
| Live source | Integration | Unique evidence URLs | All return successful responses | Links resolved at verification time. |
| Independent record | Integration | Missing or incomplete review record | Registry validation fails | Authoring alone cannot activate content. |
| Review provenance | Integration | Reviewer also appears as an author, stale date, or failed source result | Registry validation fails | Review is separate, current, and evidence-backed. |
| Duplicate identifier | Unit | Repeated question, choice, source, or set identifier | Validation fails with the duplicate | Identifiers remain unambiguous. |
| Choice cardinality | Unit | Single-choice with five choices or choose-two with four choices | Validation fails | Published variants use the documented format. |
| Complete provenance | Integration | Missing reviewer, author, date, command result, source count, or ID list | Validation fails | Activation requires auditable review metadata. |
## Related

- PRD: [/prd/0001-documentation-backed-exam-simulator.md](/prd/0001-documentation-backed-exam-simulator.md)
- ADR: [/adr/0001-static-typed-application.md](/adr/0001-static-typed-application.md)
- Issue: [/issues/0001-build-and-deploy-simulator.md](/issues/0001-build-and-deploy-simulator.md)
- Research: [/research/0001-exam-format-and-content-policy.md](/research/0001-exam-format-and-content-policy.md)
