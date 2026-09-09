import Link from "next/link";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { signAndPay, raiseDispute, leaveReview } from "@/lib/actions";

const STATUS_LABELS: Record<string, string> = {
  REQUESTED: "Ожидает решения Talent",
  CONSENT_PENDING: "Ожидает согласия",
  SIGNED: "Договор готов — нужна оплата",
  ACTIVE: "Активна",
  EXPIRED: "Истекла",
  REVOKED: "Отозвана",
  REJECTED: "Отклонена",
  DISPUTED: "Спор",
};

export default async function BuyerDashboard() {
  const session = await getSession();
  if (!session || session.role !== "BUYER") redirect("/login");

  const licenses = await db.license.findMany({
    where: { buyerId: session.userId },
    include: { talentProfile: true, contract: true, transaction: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-ink">Мои лицензии</h1>
      {licenses.length === 0 && (
        <p className="text-sm text-slate-500">
          Заявок пока нет. Найдите подходящую внешность в <Link href="/" className="text-accent underline">каталоге</Link>.
        </p>
      )}
      <div className="space-y-4">
        {licenses.map((l) => (
          <div key={l.id} className="card">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-ink">
                  {l.talentProfile.displayName} — {l.contentType}
                </div>
                <div className="text-xs text-slate-500">
                  {l.priceRub.toLocaleString("ru-RU")} ₽ (комиссия {l.commissionRub.toLocaleString("ru-RU")} ₽) ·{" "}
                  {l.durationDays} дн. · <b>{STATUS_LABELS[l.status]}</b>
                </div>
              </div>
              <div className="flex gap-2">
                {l.status === "SIGNED" && (
                  <form action={signAndPay.bind(null, l.id)}>
                    <button className="btn btn-primary">Подписать и оплатить</button>
                  </form>
                )}
                {l.status === "ACTIVE" && (
                  <form action={raiseDispute.bind(null, l.id, "Нарушение условий лицензии")}>
                    <button className="btn btn-danger">Спор</button>
                  </form>
                )}
              </div>
            </div>
            <p className="mt-2 text-sm text-slate-600">{l.projectDescription}</p>

            {l.status === "ACTIVE" && !l.transaction && (
              <p className="mt-2 text-xs text-amber-600">Ожидает подтверждения оплаты.</p>
            )}

            {(l.status === "ACTIVE" || l.status === "EXPIRED") && (
              <form action={leaveReview} className="mt-3 flex items-end gap-2 border-t border-slate-100 pt-3">
                <input type="hidden" name="licenseId" value={l.id} />
                <div>
                  <label className="label">Оценка</label>
                  <select name="rating" className="input w-24">
                    {[5, 4, 3, 2, 1].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
                <input name="comment" placeholder="Комментарий" className="input" />
                <button type="submit" className="btn btn-secondary shrink-0">
                  Оставить отзыв
                </button>
              </form>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
