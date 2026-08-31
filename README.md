# Google Cloud Professional Data Engineer Practice Exams

A documentation-backed exam simulator for the Google Cloud Professional Data Engineer certification.

The simulator application is implemented. The first question set remains unavailable until all 50 questions pass source verification and independent semantic review.

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

Question-bank changes must also run `make verify-sources`. The command structurally validates every candidate set and fetches every unique evidence URL before the registry can activate that set.

## Deployment

Merges to `main` build and deploy the static site to [GitHub Pages](https://bajor.github.io/gcp-de-quizzes/). Until the first set is independently accepted, the deployed page displays the review gate rather than an exam.

## Documentation

Project requirements, decisions, behavior, research, and architecture are indexed in [`docs/index.md`](docs/index.md).
