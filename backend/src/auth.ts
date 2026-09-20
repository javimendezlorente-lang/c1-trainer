function constantTimeEqual(left: string, right: string): boolean {
  const encoder = new TextEncoder()
  const a = encoder.encode(left)
  const b = encoder.encode(right)
  const length = Math.max(a.length, b.length)
  let difference = a.length ^ b.length
  for (let index = 0; index < length; index += 1) difference |= (a[index] ?? 0) ^ (b[index] ?? 0)
  return difference === 0
}

export function hasValidBearerToken(request: Request, expectedToken: string | undefined): boolean {
  if (!expectedToken) return false
  const header = request.headers.get('Authorization') ?? ''
  const match = /^Bearer\s+(.+)$/i.exec(header)
  return match ? constantTimeEqual(match[1], expectedToken) : false
}
