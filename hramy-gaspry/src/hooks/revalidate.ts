import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
  PayloadRequest,
} from 'payload'

/**
 * Сайт небольшой, поэтому после любого сохранения в CMS сбрасываем кэш
 * всех страниц сразу (on-demand revalidation). Вне Next.js (сид, скрипты) — пропускаем.
 */
async function revalidateSite(req: PayloadRequest) {
  if (req.context?.disableRevalidate) return
  try {
    const { revalidatePath } = await import('next/cache')
    revalidatePath('/', 'layout')
  } catch {
    // вызов вне контекста Next.js
  }
}

export const revalidateAfterChange: CollectionAfterChangeHook = async ({ doc, req }) => {
  await revalidateSite(req)
  return doc
}

export const revalidateAfterDelete: CollectionAfterDeleteHook = async ({ doc, req }) => {
  await revalidateSite(req)
  return doc
}

export const revalidateGlobal: GlobalAfterChangeHook = async ({ doc, req }) => {
  await revalidateSite(req)
  return doc
}
