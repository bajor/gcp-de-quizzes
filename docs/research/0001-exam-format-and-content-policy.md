---
type: Research
title: Professional Data Engineer exam format and content policy
description: Current official sources support a 50-question maximum-length simulator built from original, documentation-backed content.
status: complete
tags: [exam, sources]
timestamp: 2026-08-31T00:00:00Z
---

# Professional Data Engineer Exam Format and Content Policy

## Method

The research inspected Google's current certification page, version 4.2 exam guide, official public sample form, certification misconduct policy, preparation guidance, and current product documentation. The official sample form was analyzed for structure and topic coverage, not copied. No blocked sources affected the selected design. A binary PDF fetch required conversion with `pdftotext`; its title identifies it as exam guide v4.2.

## Findings

Documented owner fact, continuity unverified: Google describes the standard exam as two hours with 40-50 multiple-choice and multiple-select questions on the access date. [COI: Google] [unverified - single source] [1]

Documented owner fact, continuity unverified: Exam guide v4.2 assigns approximate weights of 22%, 25%, 20%, 15%, and 18% to five sections. The guide explicitly includes topics such as AI data enrichment, embeddings, retrieval-augmented generation, BigQuery Editions, and reservations. [COI: Google] [unverified - single source] [2]

Documented owner fact, continuity unverified: Google's official sample form contains 26 assessment questions: 25 single-choice and one choose-two item. The form warns that samples do not represent the full range or difficulty. [COI: Google] [unverified - single source] [3]

Documented owner policy: Google identifies distributing reconstructed exam content and using brain dumps or unauthorized question publications as misconduct. [COI: Google] [4]

Medium confidence: The public sample's scenario style favors architecture decisions constrained by cost, reliability, security, latency, or operational overhead. This is an inference from one official sample set rather than a published scoring blueprint. [inference] [3]

## Contradictions

A Google community article published in 2023 states 50-60 questions, while the certification page accessed on 2026-08-31 states 40-50. The current exam-owner page controls the simulator design; the older article remains useful only for general preparation advice. [5]

## Analysis

A fixed 50-question attempt is within the published range accessed on 2026-08-31 and exercises the maximum expected workload. Applying the five approximate guide weights to 50 questions produces two equally close whole-number allocations. The selected practice allocation is 11, 12, 10, 8, and 9. The reviewed official pages do not state a question-type ratio or passing percentage, so the simulator must identify its type mix as a practice choice and must not display a purported official threshold.

The official sample alone cannot establish technical correctness for new scenarios. Each original question therefore needs current product documentation for every choice explanation plus an independent re-fetch and ambiguity review.

## Recommendations

- Use 50 questions and a two-hour timer, while stating that Google publishes a 40-50 range.
- Use the official sample only to understand style; link to it instead of reproducing it.
- Accept only original questions with current Google-owned product documentation and a verification date.
- Remove any question for which more than the declared number of choices can satisfy all requirements.
- Re-research the certification page and guide before every new set because format and branding can change.

Accepted recommendations are specified by [PRD 0001](/prd/0001-documentation-backed-exam-simulator.md), [ADR 0001](/adr/0001-static-typed-application.md), [BDR 0001](/bdr/0001-exam-attempt-and-scoring.md), and [BDR 0002](/bdr/0002-question-validation-and-activation.md), and tracked by [issue 0001](/issues/0001-build-and-deploy-simulator.md).

# References

[1] GOOGLE CLOUD. **Professional Data Engineer Certification**. Available at: <https://cloud.google.com/learn/certification/data-engineer>. Accessed on: 2026-08-31.

[2] GOOGLE CLOUD. **Professional Data Engineer Certification Exam Guide, version 4.2**. Available at: <https://services.google.com/fh/files/misc/professional_data_engineer_exam_guide_english.pdf>. Accessed on: 2026-08-31.

[3] GOOGLE CLOUD. **Professional Data Engineer Sample Questions**. Available at: <https://docs.google.com/forms/d/e/1FAIpQLSfkWEzBCP0wQ09ZuFm7G2_4qtkYbfmk_0getojdnPdCYmq37Q/viewform>. Accessed on: 2026-08-31.

[4] GOOGLE CLOUD. **Identifying and Preventing Misconduct**. Available at: <https://support.google.com/cloud-certification/answer/9908051?hl=en>. Accessed on: 2026-08-31.

[5] GOOGLE CLOUD COMMUNITY. **Your guide to preparing for the Google Cloud Professional Data Engineer Certification**. 2023. Available at: <https://discuss.google.dev/t/your-guide-to-preparing-for-the-google-cloud-professional-data-engineer-certification/107505>. Accessed on: 2026-08-31.
