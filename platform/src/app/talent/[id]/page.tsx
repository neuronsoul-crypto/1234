import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { requestLicense } from "@/lib/actions";
import { notFound } from "next/navigation";

export default async function TalentDetailPage({ params }: { params: { id: string } }) {
  const session = await getSession();

  const profile = await db.talentProfile.findUnique({
    where: { id: params.id },
    include: {
      mediaAssets: { where: { moderationStatus: "APPROVED" } },
      reviews: true,
    },
  });

  if (!profile || profile.availability !== "AVAILABLE" || profile.moderationStatus !== "APPROVED") {
    notFound();
  }

  const avgRating = profile.reviews.length
    ? (profile.reviews.reduce((s, r) => s + r.rating, 0) / profile.reviews.length).toFixed(1)
    : null;

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div>
        <div className="grid grid-cols-2 gap-3">
          {profile.mediaAssets.length === 0 && (
            <div className="col-span-2 flex aspect-video items-center justify-center rounded-lg bg-slate-100 text-slate-400">
              Нет одобренных материалов
            </div>
          )}
          {profile.mediaAssets.map((m) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={m.id} src={m.url} alt={profile.displayName} className="aspect-square w-full rounded-lg object-cover" />
          ))}
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-semibold text-ink">{profile.displayName}</h1>
        <p className="mt-1 text-slate-500">
          {profile.age} лет · {profile.gender === "male" ? "мужской" : "женский"}
          {profile.ethnicity ? ` · ${profile.ethnicity}` : ""}
        </p>
        {avgRating && <p className="mt-1 text-sm text-amber-600">★ {avgRating} ({profile.reviews.length} отзывов)</p>}
        {profile.bio && <p className="mt-4 text-sm text-slate-700">{profile.bio}</p>}

        <div className="mt-4 flex flex-wrap gap-1">
          {profile.genreTags.map((tag) => (
            <span key={tag} className="badge bg-slate-100 text-slate-600">
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-4 text-lg font-semibold text-accent">
          от {profile.basePriceRub.toLocaleString("ru-RU")} ₽ за использование
        </div>
        <p className="mt-1 text-xs text-slate-400">
          Эксклюзивная лицензия — по договорённости (обычно от x2 базовой цены).
        </p>

        {session?.role === "BUYER" ? (
          <form action={requestLicense} className="card mt-6 space-y-3">
            <input type="hidden" name="talentProfileId" value={profile.id} />
            <h2 className="font-medium text-ink">Запросить лицензию</h2>
            <div>
              <label className="label">Тип контента</label>
              <input name="contentType" required placeholder="реклама / игра / сериал" className="input" />
            </div>
            <div>
              <label className="label">Описание проекта</label>
              <textarea name="projectDescription" required className="input" rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Срок, дней</label>
                <input name="durationDays" type="number" defaultValue={30} className="input" />
              </div>
              <div className="flex items-end gap-2 pb-2">
                <input id="exclusivity" name="exclusivity" type="checkbox" />
                <label htmlFor="exclusivity" className="text-sm text-slate-600">
                  Эксклюзивность
                </label>
              </div>
            </div>
            <button type="submit" className="btn btn-primary w-full">
              Отправить заявку
            </button>
          </form>
        ) : (
          <p className="card mt-6 text-sm text-slate-500">
            Чтобы запросить лицензию, войдите под аккаунтом продюсера/студии.
          </p>
        )}
      </div>
    </div>
  );
}
