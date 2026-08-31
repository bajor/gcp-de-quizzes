.PHONY: docs test verify-sources

docs:
	node --test scripts/lint-docs.test.mjs
	node scripts/lint-docs.mjs

test: docs
	npm run typecheck
	npm run lint
	npm run test:unit
	npm run build
	npm run test:e2e

verify-sources:
	npm run test:sources
