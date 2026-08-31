---
name: gcp-pde-question-authoring
description: Use when authoring, adding, revising, or sourcing Professional Data Engineer practice questions, question sections, answer choices, distractors, or question-set content in this repository. Do not use for independent acceptance review.
---

# Professional Data Engineer Question Authoring

Create original practice content for the current Google Cloud Professional Data Engineer exam guide. Never use exam dumps, remembered live questions, reconstructed exam content, or unauthorized question collections.

## Required Inputs

Before editing content, identify:

1. The target exam-guide section and required repository count: `design` 11, `ingest` 12, `store` 10, `analyze` 8, or `operate` 9.
2. A stable author identifier for the current agent or session. The identifier must differ from the later independent reviewer identifier.
3. The current date in `YYYY-MM-DD` format. Use it only for sources fetched successfully during the current authoring session.

## Source Rules

1. Re-fetch the official version 4.2 exam guide before drafting. Map every question to one explicit guide objective.
2. Search existing section modules before writing. Do not repeat an existing scenario, decision, or tested fact.
3. Use only current Google-owned technical documentation from hosts accepted by `src/domain/questions.ts`.
4. Support the correct answer and every distractor explanation with cited evidence. Each choice must name why it satisfies or fails a scenario requirement.
5. Reject content that depends on preview-only, deprecated, undocumented, or ambiguous behavior.
6. Use the official sample questions only to understand public format and style. Never copy or paraphrase their scenarios or choices.

## Question Design

- State all constraints needed to choose one exact answer or, for multiple-select, exactly two answers.
- Prefer architecture decisions involving reliability, security, latency, cost, scale, or operational effort over trivia.
- Use four choices for `single` questions and five choices for `multiple` questions.
- For `multiple`, state "Choose two" in the prompt and set `requiredSelections: 2`.
- Make distractors plausible but wrong for one documented reason. Do not use joke answers, vague wording, or overlapping choices.
- Keep product names and terminology current with the fetched documentation.
- Use stable IDs in the form `pde-v42-<section>-NN` for questions and short question-local IDs for evidence.

## Typed Template

Create or update `src/data/questionSets/sections/<section>.ts` and export one typed section:

```ts
import type { QuestionSection } from "../../../domain/questions";

export const designSection = {
  section: "design",
  author: "author-session-id",
  questions: [
    {
      id: "pde-v42-design-01",
      kind: "single",
      section: "design",
      objective: "1.1 Example objective from exam guide v4.2",
      prompt: "Original scenario with all decision constraints. What should you do?",
      verifiedOn: "YYYY-MM-DD",
      evidence: [
        {
          id: "product-behavior",
          title: "Google Cloud documentation title",
          url: "https://cloud.google.com/...",
          claim: "The specific documented fact used to evaluate the choices.",
        },
      ],
      choices: [
        {
          id: "a",
          text: "Candidate action.",
          feedback: "Why this action satisfies or fails a named requirement.",
          evidenceIds: ["product-behavior"],
        },
        // Add b, c, and d. Multiple-select questions also require e.
      ],
      correctChoiceId: "a",
    },
  ],
} satisfies QuestionSection<"design">;
```

Register the export in `src/data/questionSets/sections/index.ts`. Do not add a partial set to `candidateQuestionSets`, set `activeQuestionSetId`, or author the independent review record.

## Verification

Run these commands after registering the complete section:

```sh
make test
make verify-sources
```

Both commands must pass. `make verify-sources` structurally validates every registered draft section and performs a live fetch of each unique evidence URL.

## Reviewer Handoff

Provide section reviewers with the section name, author identifier, question IDs, objective mappings, unique source URLs, and source-verification result. Section review may identify corrections, but it does not produce the final acceptance artifact. After all five sections assemble into one candidate, a separate session must use the `gcp-pde-question-review` skill to re-fetch every source, evaluate all 50 questions, and create `docs/reviews/<set-id>.md`. The author must not accept their own questions or create that record.

If final independent review rejects a candidate, keep that candidate and its draft registered unchanged so the rejection record remains verifiable. Make corrections under a new unique draft and candidate ID, reusing unchanged section modules where possible. Never overwrite or remove content bound to an indexed rejection report.

## Acceptance Criteria

- The section has exactly its required question count.
- Every question is original and mapped to exam guide v4.2.
- Every choice has non-empty feedback and at least one valid evidence reference.
- All evidence was fetched from an accepted Google-owned host on `verifiedOn`.
- Structural tests and live source verification pass.
- An independent reviewer, not the author, is identified for semantic review.
