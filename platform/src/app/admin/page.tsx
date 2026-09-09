import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { moderateProfile, moderateMedia, resolveDispute } from "@/lib/actions";

export default async function AdminPage() {
  const session = await getSession();
  if (!session || (session.role !== "MODERATOR" && session.role !== "ADMIN")) redirect("/login");

  const [pendingProfiles, pendingMedia, disputes, stats] = await Promise.all([
    db.talentProfile.findMany({ where: { moderationStatus: "PENDING" }, include: { user: true } }),
    db.mediaAsset.findMany({ where: { moderationStatus: "PENDING" }, include: { talentProfile: true } }),
    db.dispute.findMany({ where: { status: "OPEN" }, include: { license: { include: { talentProfile: true, buyer: true } } } }),
    Promise.all([
      db.talentProfile.count({ where: { availability: "AVAILABLE" } }),
      db.license.count({ where: { status: "ACTIVE" } }),
      db.transaction.aggregate({ _sum: { commissionRub: true } }),
    ]),
  ]);

  const [activeTalent, activeLicenses, commissionSum] = stats;

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-semibold text-ink">Админ-панель</h1>

      <div className="grid grid-cols-3 gap-4">
        <div className="card">
          <div className="text-xs text-slate-500">Talent в каталоге</div>
          <div className="text-2xl font-semibold text-ink">{activeTalent}</div>
        </div>
        <div className="card">
          <div className="text-xs text-slate-500">Активных лицензий</div>
          <div className="text-2xl font-semibold text-ink">{activeLicenses}</div>
        </div>
        <div className="card">
          <div className="text-xs text-slate-500">Комиссия платформы</div>
          <div className="text-2xl font-semibold text-ink">
            {(commissionSum._sum.commissionRub ?? 0).toLocaleString("ru-RU")} ₽
          </div>
        </div>
      </div>

      <section className="card">
        <h2 className="mb-3 font-semibold text-ink">Профили на модерации ({pendingProfiles.length})</h2>
        {pendingProfiles.map((p) => (
          <div key={p.id} className="flex items-center justify-between border-b border-slate-100 py-2 last:border-0">
            <div>
              <div className="font-medium text-ink">{p.displayName}</div>
              <div className="text-xs text-slate-500">{p.user.email} · {p.age} лет</div>
            </div>
            <div className="flex gap-2">
              <form action={moderateProfile.bind(null, p.id, true)}>
                <button className="btn btn-primary">Одобрить</button>
              </form>
              <form action={moderateProfile.bind(null, p.id, false)}>
                <button className="btn btn-danger">Отклонить</button>
              </form>
            </div>
          </div>
        ))}
        {pendingProfiles.length === 0 && <p className="text-sm text-slate-500">Нет профилей на проверке.</p>}
      </section>

      <section className="card">
        <h2 className="mb-3 font-semibold text-ink">Медиа на модерации ({pendingMedia.length})</h2>
        <div className="grid grid-cols-4 gap-3">
          {pendingMedia.map((m) => (
            <div key={m.id} className="space-y-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={m.url} alt="" className="aspect-square w-full rounded object-cover" />
              <div className="text-xs text-slate-500">{m.talentProfile.displayName}</div>
              <div className="flex gap-1">
                <form action={moderateMedia.bind(null, m.id, true)}>
                  <button className="btn btn-primary w-full text-xs">OK</button>
                </form>
                <form action={moderateMedia.bind(null, m.id, false)}>
                  <button className="btn btn-danger w-full text-xs">Отклонить</button>
                </form>
              </div>
            </div>
          ))}
        </div>
        {pendingMedia.length === 0 && <p className="text-sm text-slate-500">Нет медиа на проверке.</p>}
      </section>

      <section className="card">
        <h2 className="mb-3 font-semibold text-ink">Открытые споры ({disputes.length})</h2>
        {disputes.map((d) => (
          <div key={d.id} className="border-b border-slate-100 py-3 last:border-0">
            <div className="font-medium text-ink">
              {d.license.talentProfile.displayName} ↔ {d.license.buyer.companyName ?? d.license.buyer.email}
            </div>
            <p className="text-sm text-slate-600">{d.reason}</p>
            <div className="mt-2 flex gap-2">
              <form action={resolveDispute.bind(null, d.id, "Средства выплачены Talent", true)}>
                <button className="btn btn-primary">Выплатить Talent</button>
              </form>
              <form action={resolveDispute.bind(null, d.id, "Средства возвращены Buyer", false)}>
                <button className="btn btn-danger">Вернуть Buyer</button>
              </form>
            </div>
          </div>
        ))}
        {disputes.length === 0 && <p className="text-sm text-slate-500">Открытых споров нет.</p>}
      </section>
    </div>
  );
}
