import { db } from "./db";

// Каждое обращение к биометрическим данным (медиа Talent, KYC-статус) логируется —
// обязательное НФТ, см. docs/TZ.md раздел 7.
export async function logAudit(params: {
  actorUserId: string | null;
  action: string;
  targetType: string;
  targetId: string;
  reason?: string;
}) {
  await db.auditLog.create({
    data: {
      actorUserId: params.actorUserId,
      action: params.action,
      targetType: params.targetType,
      targetId: params.targetId,
      reason: params.reason,
    },
  });
}
