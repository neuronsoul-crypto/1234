import Link from "next/link";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import {
  updateTalentProfile,
  addMediaAsset,
  setAvailability,
  revokeBiometricConsent,
  respondToLicenseRequest,
  raiseDispute,
} from "@/lib/actions";

const STATUS_LABELS: Record<string, string> = {
  REQUESTED: "Ожидает вашего решения",
  CONSENT_PENDING: "Ожидает согласия",
  SIGNED: "Подписан, ждёт оплаты",
  ACTIVE: "Активна",
  EXPIRED: "Истекла",
  REVOKED: "Отозвана",
  REJECTED: "Отклонена",
  DISPUTED: "Спор",
};

export default async function TalentDashboard() {
  const session = await getSession();
  if (!session || session.role !== "TALENT") redirect("/login");

  const profile = await db.talentProfile.findUnique({
    where: { userId: session.userId },
    include: {
      mediaAssets: true,
      biometricConsents: { orderBy: { givenAt: "desc" } },
      licenses: { include: { buyer: true }, orderBy: { createdAt: "desc" } },
    },
  });
  if (!profile) redirect("/register");

  const activeConsent = profile.biometricConsents.find((c) => !c.revokedAt);

  return (
    <div className="grid gap-8 md:grid-cols-3">
      <div className="space-y-6 md:col-span-2">
        <section className="card">
          <h2 className="mb-3 font-semibold text-ink">Профиль</h2>
          <p className="mb-3 text-xs text-slate-500">
            Статус модерации: <b>{profile.moderationStatus}</b> · Видимость:{" "}
            <b>{profile.availability === "AVAILABLE" ? "в каталоге" : "скрыт"}</b>
          </p>
          <form action={updateTalentProfile} className="space-y-3">
            <div>
              <label className="label">О себе</label>
              <textarea name="bio" defaultValue={profile.bio ?? ""} className="input" rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Этнический типаж</label>
                <input name="ethnicity" defaultValue={profile.ethnicity ?? ""} className="input" />
              </div>
              <div>
                <label className="label">Базовая цена, ₽</label>
                <input name="basePriceRub" type="number" defaultValue={profile.basePriceRub} className="input" />
              </div>
            </div>
            <div>
              <label className="label">Жанры (через запятую)</label>
              <input name="genreTags" defaultValue={profile.genreTags.join(", ")} className="input" />
            </div>
            <button type="submit" className="btn btn-primary">
              Сохранить (уйдёт на повторную модерацию)
            </button>
          </form>

          <form
            action={async () => {
              "use server";
              await setAvailability(profile!.availability !== "AVAILABLE");
            }}
            className="mt-3"
          >
            <button type="submit" className="btn btn-secondary">
              {profile.availability === "AVAILABLE" ? "Скрыть из каталога" : "Опубликовать в каталоге"}
            </button>
          </form>
        </section>

        <section className="card">
          <h2 className="mb-3 font-semibold text-ink">Фото и видео</h2>
          <div className="mb-3 grid grid-cols-3 gap-2">
            {profile.mediaAssets.map((m) => (
              // eslint-disable-next-line @next/next/no-img-element
              <div key={m.id} className="relative">
                <img src={m.url} alt="" className="aspect-square w-full rounded object-cover" />
                <span className="badge absolute bottom-1 left-1 bg-white/90">{m.moderationStatus}</span>
              </div>
            ))}
          </div>
          <form action={addMediaAsset} className="flex gap-2">
            <input name="url" placeholder="https://…" required className="input" />
            <select name="kind" className="input w-32">
              <option value="PHOTO">Фото</option>
              <option value="VIDEO">Видео</option>
            </select>
            <button type="submit" className="btn btn-secondary shrink-0">
              Добавить
            </button>
          </form>
        </section>

        <section className="card">
          <h2 className="mb-3 font-semibold text-ink">Заявки на лицензию</h2>
          {profile.licenses.length === 0 && <p className="text-sm text-slate-500">Пока нет заявок.</p>}
          <div className="space-y-3">
            {profile.licenses.map((l) => (
              <div key={l.id} className="rounded-lg border border-slate-200 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-ink">
                      {l.contentType} — {l.buyer.companyName ?? l.buyer.email}
                    </div>
                    <div className="text-xs text-slate-500">
                      {l.priceRub.toLocaleString("ru-RU")} ₽ · {l.durationDays} дн. · {STATUS_LABELS[l.status]}
                    </div>
                  </div>
                  {l.status === "REQUESTED" && (
                    <div className="flex gap-2">
                      <form
                        action={async () => {
                          "use server";
                          await respondToLicenseRequest(l.id, true);
                        }}
                      >
                        <button className="btn btn-primary">Одобрить</button>
                      </form>
                      <form
                        action={async () => {
                          "use server";
                          await respondToLicenseRequest(l.id, false);
                        }}
                      >
                        <button className="btn btn-danger">Отклонить</button>
                      </form>
                    </div>
                  )}
                  {l.status === "ACTIVE" && (
                    <form action={raiseDispute.bind(null, l.id, "Нарушение условий лицензии")}>
                      <button className="btn btn-danger">Спор</button>
                    </form>
                  )}
                </div>
                <p className="mt-2 text-sm text-slate-600">{l.projectDescription}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <aside className="space-y-6">
        <section className="card">
          <h2 className="mb-2 font-semibold text-ink">Биометрическое согласие</h2>
          {activeConsent ? (
            <>
              <p className="mb-3 text-sm text-emerald-700">Действует с {activeConsent.givenAt.toLocaleDateString("ru-RU")}</p>
              <form action={revokeBiometricConsent.bind(null, activeConsent.id)}>
                <button className="btn btn-danger w-full">Отозвать согласие</button>
              </form>
              <p className="mt-2 text-xs text-slate-400">
                Отзыв закроет профиль для новых заявок. Уже оплаченные лицензии останутся в силе.
              </p>
            </>
          ) : (
            <Link href="/consent/biometric" className="btn btn-primary w-full">
              Дать согласие
            </Link>
          )}
        </section>
      </aside>
    </div>
  );
}
