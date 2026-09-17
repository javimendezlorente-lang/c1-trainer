# Product specification

Status: v0.1 draft

## Product goal

C1 Trainer helps one learner practise C1 Advanced English in short, repeatable sessions. It should answer one question clearly: **what should I practise now, and why?**

## Target user

A self-directed C1 Advanced learner using an iPhone as the primary device and a Mac or iPad as a secondary device. The initial product is single-user and local-first.

## v0.1 in scope

- Installable mobile PWA.
- Reading and Use of English Parts 1–4.
- Exercise selection, answer changes before submission, checking, raw score, and per-item feedback.
- Explanations for the correct answer and, where relevant, distractors.
- Local attempt history and basic part/tag statistics.
- Error Bank with review metadata.
- Offline operation for bundled approved content and already-created local data.
- Accessible controls, readable long-form text, and resilient empty/error states.

## Explicitly out of scope

- User accounts, synchronisation, payments, social features, or a hosted API.
- Runtime exercise generation or runtime LLM calls.
- Native iOS or macOS apps.
- Listening audio, Speaking recording, pronunciation analysis, and AI writing assessment.
- Cambridge score prediction or claims of official exam equivalence.
- Copyrighted Cambridge past-paper reproduction.

## Product principles

1. Accuracy before breadth: a smaller bank of high-quality original items is preferable to a large unchecked bank.
2. Specification before implementation: exam rules and data contracts are explicit.
3. Feedback is part of the exercise: an answer without a useful explanation is incomplete.
4. Local-first: the learner owns their history and can practise without a network.
5. Small increments: each milestone is testable and deployable.

## Success criteria

- The deployed URL loads on iPhone Safari and can be added to the Home Screen.
- The app shell and approved v0.1 content remain usable offline after the first load.
- A learner can complete a Part 1 activity, receive a deterministic result, and see the attempt in history and the Error Bank.
- A fresh clone can validate all approved content with one documented command.
- No user answer data is sent to a server in v0.1.

## Non-goals for metrics

Accuracy percentages are learning metrics, not Cambridge marks or grades. The product must label them as internal practice statistics.

