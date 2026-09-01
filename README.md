# Google Cloud Professional Data Engineer Practice Exams

A documentation-backed exam simulator for the Google Cloud Professional Data Engineer certification.

The simulator application is implemented, and 11 of 50 questions are registered in the first draft. The question set remains unavailable until all 50 questions pass source verification and independent semantic review.

## Local Development

Node.js 22.22.2 or later is required.

```sh
npm install
npm run dev
```

Run the complete documentation, type, lint, unit, build, and browser-test gate with:

```sh
make test
```

Question-bank changes must also run `make verify-sources`. The command structurally validates every registered draft section and candidate set, then fetches every unique evidence URL before activation.

## Question Authoring

The project-local [`gcp-pde-question-authoring`](.opencode/skills/gcp-pde-question-authoring/SKILL.md) skill defines the mandatory original-content, Google-source, typed-section, and author-handoff workflow. Complete sections are registered under `src/data/questionSets/sections/`; partial sections cannot enter the candidate or active registries. A separate session uses [`gcp-pde-question-review`](.opencode/skills/gcp-pde-question-review/SKILL.md) to perform final independent review and generate the content-bound acceptance record.

## Deployment

Merges to `main` build and deploy the static site to [GitHub Pages](https://bajor.github.io/gcp-de-quizzes/). Until the first set is independently accepted, the deployed page displays the review gate rather than an exam.

## Documentation

Project requirements, decisions, behavior, research, and architecture are indexed in [`docs/index.md`](docs/index.md).
