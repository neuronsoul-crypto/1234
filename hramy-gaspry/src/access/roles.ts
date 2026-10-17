import type { Access, FieldAccess, PayloadRequest } from 'payload'

export type Role = 'admin' | 'editor' | 'clergy'

type MaybeUser = PayloadRequest['user'] | { role?: unknown } | null | undefined

export const roleOf = (user: MaybeUser): Role | undefined =>
  (user as { role?: Role } | null | undefined)?.role

export const hasRole = (user: MaybeUser, ...roles: Role[]): boolean => {
  const role = roleOf(user)
  return Boolean(role && roles.includes(role))
}

export const isAdmin = (user: MaybeUser) => hasRole(user, 'admin')

/** Доступ только для перечисленных ролей. */
export const allow =
  (...roles: Role[]): Access =>
  ({ req }) =>
    hasRole(req.user, ...roles)

export const allowField =
  (...roles: Role[]): FieldAccess =>
  ({ req }) =>
    hasRole(req.user, ...roles)

export const anyone: Access = () => true

/** Опубликованное — всем, черновики — только вошедшим. */
export const publishedOrLoggedIn: Access = ({ req }) => {
  if (req.user) return true
  return { _status: { equals: 'published' } }
}

/** Скрыть раздел в меню админки, если у роли нет доступа. */
export const hiddenUnless =
  (...roles: Role[]) =>
  ({ user }: { user: unknown }) =>
    !hasRole(user as MaybeUser, ...roles)
