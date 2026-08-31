---
type: Context
title: Project Glossary
description: Canonical definitions for the practice exam domain and project modules.
status: Accepted
timestamp: 2026-08-31T00:00:00Z
---

# Project Glossary

## ADR

Architecture Decision Record. An append-only record of a structural or implementation decision and its rejected alternatives.

## AI

Artificial Intelligence. Software capabilities that perform tasks commonly associated with human reasoning or content understanding.

## API

Application Programming Interface. A defined interface through which software components communicate.

## Attempt

The local state of one candidate working through one question set, including answers, review flags, position, and deadline.

An attempt is compatible with the application only when its schema version, question-set identifier and version, answer identifiers, timestamps, and status pass runtime validation.

## BDR

Behavior Decision Record. An append-only specification of observable behavior and how that behavior is tested.

## Choice feedback

The explanation attached to one answer choice. It states why that choice does or does not satisfy the scenario and references the source-evidence identifiers that support the explanation.

## COI

Conflict of Interest. A source relationship that could influence a claim; project research flags vendor-owned statements with this marker.

## Exam guide

Google's official Professional Data Engineer certification exam guide. Question coverage uses version 4.2 until a later version is explicitly researched and adopted.

## Multiple-select

A question that states the required number of choices and is correct only when the selected identifier set exactly equals the correct identifier set.

## PDF

Portable Document Format. The file format used by the official exam guide.

## PRD

Product Requirements Document. An append-only specification of the user problem, product outcomes, requirements, and acceptance criteria.

## Question bank

All question sets present in the repository, including sets that are not yet active.

## Question set

An immutable, versioned collection of exactly 50 original practice questions with a declared exam-guide version. One active question set is offered by the application.

## Source evidence

A Google-owned documentation URL, document title, and supported claim used to justify choice feedback. Each question's `verifiedOn` date is the authoritative date on which all evidence attached to that question was re-fetched and checked.

## UI

User Interface. The visible and interactive controls through which a candidate takes and reviews an attempt.

## URL

Uniform Resource Locator. The web address used for the deployed application or cited documentation.
