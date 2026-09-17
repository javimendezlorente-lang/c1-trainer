/**
 * Internal Part 4 word-count policy. Whitespace separates tokens; punctuation
 * remains attached; apostrophes and hyphens inside a token do not split it.
 */
export function countTransformationWords(answer) {
  const trimmed = answer.trim()
  return trimmed === '' ? 0 : trimmed.split(/\s+/u).length
}
