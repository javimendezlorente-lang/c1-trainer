import type { AttemptEvent } from '../domain/attempt'
import type { Skill } from '../domain/skills'
import type { ReviewEvent, ReviewRating } from '../domain/review'
import { applyReviewRating, createNewReviewCard, reviewCardId, type ReviewCardProjection } from './fsrs'
import { nowIso } from '../time/clock'

export interface ErrorBankRecord {
  itemKey: string
  exerciseId: string
  questionId: string
  part: 1
  skill: Skill
  secondarySkills: Skill[]
  explanationReference: string
  totalAttempts: number
  correctAttempts: number
  incorrectAttempts: number
  lastAttemptAt: string
  lastSelectedOptionId: string | null
  correctOptionId: string
  lastResponseCorrect: boolean
  status: 'active' | 'cleared'
}

export interface PartProgressRecord {
  part: number
  attempts: number
  questions: number
  correct: number
  score: number
  maxScore: number
  accuracy: number
}

export interface SkillProgressRecord {
  skill: Skill
  attempts: number
  correct: number
  accuracy: number
}

export interface ProgressProjection {
  attempts: number
  questions: number
  correct: number
  score: number
  maxScore: number
  accuracy: number
  byPart: PartProgressRecord[]
  bySkill: SkillProgressRecord[]
}

export interface ReviewProgressProjection {
  reviewsCompleted: number
  reviewsDue: number
  reviewedCards: number
  ratingDistribution: Record<ReviewRating, number>
}

export interface LearningProjections {
  errorBank: ErrorBankRecord[]
  progress: ProgressProjection
  review: ReviewProgressProjection
}

function percentage(correct: number, total: number): number {
  return total === 0 ? 0 : Math.round((correct / total) * 10000) / 100
}

export function rebuildErrorBank(events: readonly AttemptEvent[]): ErrorBankRecord[] {
  const records = new Map<string, ErrorBankRecord>()
  const orderedEvents = [...events].sort((left, right) => {
    const byTime = left.occurredAt.localeCompare(right.occurredAt)
    return byTime === 0 ? left.eventId.localeCompare(right.eventId) : byTime
  })

  for (const event of orderedEvents) {
    for (const result of event.grade.results) {
      const itemKey = `${event.exerciseId}:${result.questionId}`
      const existing = records.get(itemKey)
      const record: ErrorBankRecord = existing ?? {
        itemKey,
        exerciseId: event.exerciseId,
        questionId: result.questionId,
        part: event.part,
        skill: event.skills.primarySkill,
        secondarySkills: [...event.skills.secondarySkills],
        explanationReference: event.explanationReferences[result.questionId] ?? `${event.exerciseId}#${result.questionId}`,
        totalAttempts: 0,
        correctAttempts: 0,
        incorrectAttempts: 0,
        lastAttemptAt: event.occurredAt,
        lastSelectedOptionId: null,
        correctOptionId: result.correctOptionId,
        lastResponseCorrect: false,
        status: 'active',
      }

      record.totalAttempts += 1
      if (result.correct) record.correctAttempts += 1
      else record.incorrectAttempts += 1
      record.lastAttemptAt = event.occurredAt
      record.lastSelectedOptionId = result.selectedOptionId
      record.correctOptionId = result.correctOptionId
      record.lastResponseCorrect = result.correct
      record.status = result.correct ? 'cleared' : 'active'
      records.set(itemKey, record)
    }
  }

  return [...records.values()]
    .filter((record) => record.incorrectAttempts > 0)
    .sort((left, right) => right.lastAttemptAt.localeCompare(left.lastAttemptAt))
}

export function rebuildProgress(events: readonly AttemptEvent[]): ProgressProjection {
  const parts = new Map<number, PartProgressRecord>()
  const skills = new Map<Skill, SkillProgressRecord>()
  let questions = 0
  let correct = 0
  let score = 0
  let maxScore = 0

  for (const event of events) {
    const part = parts.get(event.part) ?? {
      part: event.part,
      attempts: 0,
      questions: 0,
      correct: 0,
      score: 0,
      maxScore: 0,
      accuracy: 0,
    }
    part.attempts += 1
    part.questions += event.grade.results.length
    part.correct += event.grade.results.filter((result) => result.correct).length
    part.score += event.grade.score
    part.maxScore += event.grade.maxScore
    part.accuracy = percentage(part.correct, part.questions)
    parts.set(event.part, part)

    questions += event.grade.results.length
    correct += event.grade.results.filter((result) => result.correct).length
    score += event.grade.score
    maxScore += event.grade.maxScore

    const eventSkills = [event.skills.primarySkill, ...event.skills.secondarySkills]
    for (const skill of eventSkills) {
      const skillRecord = skills.get(skill) ?? { skill, attempts: 0, correct: 0, accuracy: 0 }
      skillRecord.attempts += event.grade.results.length
      skillRecord.correct += event.grade.results.filter((result) => result.correct).length
      skillRecord.accuracy = percentage(skillRecord.correct, skillRecord.attempts)
      skills.set(skill, skillRecord)
    }
  }

  return {
    attempts: events.length,
    questions,
    correct,
    score,
    maxScore,
    accuracy: percentage(correct, questions),
    byPart: [...parts.values()].sort((left, right) => left.part - right.part),
    bySkill: [...skills.values()].sort((left, right) => left.skill.localeCompare(right.skill)),
  }
}

export function rebuildReviewCards(
  attemptEvents: readonly AttemptEvent[],
  reviewEvents: readonly ReviewEvent[] = [],
): ReviewCardProjection[] {
  const errorBank = rebuildErrorBank(attemptEvents)
  const firstIncorrect = new Map<string, { occurredAt: string; primarySkill: Skill; eventId: string }>()
  for (const event of [...attemptEvents].sort((left, right) => left.occurredAt.localeCompare(right.occurredAt) || left.eventId.localeCompare(right.eventId))) {
    for (const result of event.grade.results) {
      if (result.correct) continue
      const key = reviewCardId(event.exerciseId, result.questionId)
      if (!firstIncorrect.has(key)) firstIncorrect.set(key, { occurredAt: event.occurredAt, primarySkill: event.skills.primarySkill, eventId: event.eventId })
    }
  }

  const cards = new Map<string, ReviewCardProjection>()
  for (const record of errorBank) {
    const id = reviewCardId(record.exerciseId, record.questionId)
    const origin = firstIncorrect.get(id)
    const firstEvent = reviewEvents
      .filter((event) => event.reviewCardId === id)
      .sort((left, right) => left.reviewedAt.localeCompare(right.reviewedAt) || left.eventId.localeCompare(right.eventId))[0]
    const createdAt = origin?.occurredAt ?? firstEvent?.reviewedAt
    if (!createdAt) continue
    let card = createNewReviewCard({ id, exerciseId: record.exerciseId, questionId: record.questionId }, createdAt, record.part, record.skill)
    const history = reviewEvents
      .filter((event) => event.reviewCardId === id)
      .sort((left, right) => left.reviewedAt.localeCompare(right.reviewedAt) || left.eventId.localeCompare(right.eventId))
    for (const event of history) card = applyReviewRating(card, event.rating, event.reviewedAt)
    cards.set(id, card)
  }

  // Keep a historically reviewed card even if its attempt projection is incomplete.
  for (const event of reviewEvents) {
    if (cards.has(event.reviewCardId)) continue
    const card = createNewReviewCard(
      { id: event.reviewCardId, exerciseId: event.exerciseId, questionId: event.questionId },
      event.reviewedAt,
      1,
      event.skillSet?.primarySkill ?? 'collocation',
    )
    cards.set(event.reviewCardId, applyReviewRating(card, event.rating, event.reviewedAt))
  }

  return [...cards.values()].sort((left, right) => left.id.localeCompare(right.id))
}

export function rebuildReviewProgress(reviewEvents: readonly ReviewEvent[], cards: readonly ReviewCardProjection[], currentTimeIso = nowIso()): ReviewProgressProjection {
  const ratingDistribution: Record<ReviewRating, number> = { Again: 0, Hard: 0, Good: 0, Easy: 0 }
  for (const event of reviewEvents) ratingDistribution[event.rating] += 1
  const now = new Date(currentTimeIso).getTime()
  return {
    reviewsCompleted: reviewEvents.length,
    reviewsDue: cards.filter((card) => new Date(card.due).getTime() <= now).length,
    reviewedCards: new Set(reviewEvents.map((event) => event.reviewCardId)).size,
    ratingDistribution,
  }
}

export function rebuildLearningProjections(
  events: readonly AttemptEvent[],
  reviewEvents: readonly ReviewEvent[] = [],
  currentTimeIso = nowIso(),
): LearningProjections {
  const cards = rebuildReviewCards(events, reviewEvents)
  return {
    errorBank: rebuildErrorBank(events),
    progress: rebuildProgress(events),
    review: rebuildReviewProgress(reviewEvents, cards, currentTimeIso),
  }
}
