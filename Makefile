.PHONY: docs test

docs:
	node --test scripts/lint-docs.test.mjs
	node scripts/lint-docs.mjs

test: docs
