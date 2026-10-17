import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionConfig,
  GlobalAfterChangeHook,
} from 'payload'

const titleOf = (doc: Record<string, unknown>, field?: string) => {
  const value = (field && doc[field]) || doc.title || doc.name || doc.email || doc.id
  return String(value ?? '').slice(0, 200)
}

const userId = (user: unknown) => (user as { id?: number } | null)?.id ?? null

/** Журнал действий: кто создал, изменил или удалил запись. */
export const auditHooks = (
  collection: string,
  titleField?: string,
): NonNullable<CollectionConfig['hooks']> => {
  const afterChange: CollectionAfterChangeHook = async ({ doc, operation, req, previousDoc }) => {
    if (req.context?.skipAudit || !req.user) return doc
    let action: string = operation === 'create' ? 'create' : 'update'
    if (operation === 'update' && doc?.deletedAt && !previousDoc?.deletedAt) action = 'trash'
    if (operation === 'update' && doc?._status === 'published' && previousDoc?._status !== 'published')
      action = 'publish'
    await req.payload.create({
      collection: 'audit-log',
      data: {
        action: action as 'create',
        collectionSlug: collection,
        docId: String(doc.id),
        docTitle: titleOf(doc, titleField),
        user: userId(req.user),
      },
      req,
      overrideAccess: true,
    })
    return doc
  }

  const afterDelete: CollectionAfterDeleteHook = async ({ doc, req }) => {
    if (req.context?.skipAudit || !req.user) return doc
    await req.payload.create({
      collection: 'audit-log',
      data: {
        action: 'delete',
        collectionSlug: collection,
        docId: String(doc.id),
        docTitle: titleOf(doc, titleField),
        user: userId(req.user),
      },
      req,
      overrideAccess: true,
    })
    return doc
  }

  return { afterChange: [afterChange], afterDelete: [afterDelete] }
}

export const auditGlobal =
  (slug: string): GlobalAfterChangeHook =>
  async ({ doc, req }) => {
    if (req.context?.skipAudit || !req.user) return doc
    await req.payload.create({
      collection: 'audit-log',
      data: { action: 'update', collectionSlug: slug, docId: '-', docTitle: 'Настройки сайта', user: userId(req.user) },
      req,
      overrideAccess: true,
    })
    return doc
  }
