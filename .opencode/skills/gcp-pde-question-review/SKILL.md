---
name: gcp-pde-question-review
description: Use ONLY for independent semantic acceptance review of a complete Professional Data Engineer candidate question set in this repository, including final source re-checking and docs/reviews records. Do not use while authoring or editing question content.
---

# Professional Data Engineer Independent Review

Review a complete 50-question candidate without editing its questions, choices, answer keys, feedback, objectives, evidence, or author metadata. If any correction is needed, reject the affected IDs and return them to an author; a reviewer who edits content becomes an author and cannot accept that revision.

## Independence Gate

1. Choose a stable reviewer session identifier.
2. Inspect the candidate's `authors` list.
3. Stop if the reviewer identifier appears in `authors` or if this session authored or edited any candidate content.

## Required Checks

1. Re-fetch the current Professional Data Engineer certification page and exam guide version 4.2.
2. Run `make test` and `make verify-sources`. Both commands must pass before semantic review.
3. Independently open every unique evidence URL. Do not rely only on the author's claims or feedback.
4. For each question, verify all of these conditions:
   - The objective matches exam guide v4.2.
   - The prompt includes every constraint needed for a deterministic answer.
   - Exactly one single-choice answer, or exactly two multiple-select answers, satisfy all constraints.
   - Every distractor fails at least one named requirement for a documented reason.
   - Every feedback statement is supported by its referenced evidence.
   - Terminology and product behavior are current, generally available, and not deprecated.
   - The scenario is original and does not reconstruct live exam content or copy an official sample.
5. Reject any ambiguous or unsupported question. Do not create an accepted review document while any question is rejected.

## Rejection Report

If any question fails, generate a machine-readable rejection record from the exact candidate content. Pass every rejected ID and concrete reason in one JSON array:

```sh
npm run create-rejection-record -- <question-set-id> <reviewer-id> <YYYY-MM-DD> '[{"id":"<question-id>","reason":"<concrete reason>"}]'
```

Create `docs/reviews/<question-set-id>-rejected-<YYYY-MM-DD>.md` with `type: Review`, `status: Rejected`, the reviewer and author identifiers, commands run, and a concise rejection summary. Add the complete unmodified command output under the exact `## Rejection Record` heading in a `json` fence. The generated JSON is the single authoritative list of rejected IDs and reasons; do not duplicate that list elsewhere in the report. Index the rejection report in `docs/reviews/index.md`, then run `make docs`, `make test`, and `make verify-sources`. All three commands must pass after the report exists. Do not add a `## Review Record` block, activate the rejected candidate, remove its candidate registration, or edit rejected content. A separate author must create a corrected draft and candidate with a new unique question-set ID; the corrected candidate then requires a new independent review session.

## Review Record

After accepting all 50 IDs, generate the machine record from the exact candidate content:

```sh
npm run create-review-record -- <question-set-id> <reviewer-id> <YYYY-MM-DD>
```

Create `docs/reviews/<question-set-id>.md` with typed frontmatter, a concise review report, and the command output under the exact `## Review Record` heading:

````markdown
---
type: Review
title: Independent review of <question-set-id>
description: Semantic and source acceptance for all 50 questions.
status: Accepted
timestamp: YYYY-MM-DDT00:00:00Z
---

# Independent Review of <question-set-id>

## Review Summary

State the reviewer identifier, independence check, guide version, commands run, unique source count, and that all 50 questions passed the required checks.

## Review Record

```json
{
  "questionSetId": "generated value"
}
```
````

Replace the abbreviated JSON example with the complete unmodified command output. Add the review document to `docs/reviews/index.md`, then run `make docs`, `make test`, and `make verify-sources` again. The content SHA-256 digest and question-set version prevent the record from accepting later content changes.

## Acceptance Criteria

- Reviewer identity is independent of every recorded author.
- All 50 questions and every unique source were independently evaluated.
- No rejected question remains in the candidate.
- Any rejected IDs and reasons were recorded in an indexed rejection report rather than an accepted record.
- Every rejection report contains a generated `## Rejection Record` that passes machine validation.
- The generated record matches the exact candidate version and SHA-256 digest.
- The review document is typed, indexed, and accepted by activation tests.
- All repository and source-verification gates pass after the review is added.
