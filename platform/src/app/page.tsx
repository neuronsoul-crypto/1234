import { db } from "@/lib/db";
import TalentCard from "@/components/TalentCard";

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: { gender?: string; genre?: string; maxPrice?: string };
}) {
  const { gender, genre, maxPrice } = searchParams;

  const profiles = await db.talentProfile.findMany({
    where: {
      availability: "AVAILABLE",
      moderationStatus: "APPROVED",
      ...(gender ? { gender } : {}),
      ...(genre ? { genreTags: { has: genre } } : {}),
      ...(maxPrice ? { basePriceRub: { lte: Number(maxPrice) } } : {}),
    },
    include: { mediaAssets: { where: { moderationStatus: "APPROVED" }, take: 1 } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-ink">Каталог внешности</h1>
        <p className="mt-1 text-sm text-slate-500">
          Легальное лицензирование лица для ИИ-генерации рекламы, игр и микросериалов. Все Talent прошли верификацию и дали
          отдельное согласие на обработку биометрии (ст. 11 152-ФЗ).
        </p>
      </div>

      <form className="card mb-8 flex flex-wrap items-end gap-4" method="get">
        <div>
          <label className="label">Пол</label>
          <select name="gender" defaultValue={gender ?? ""} className="input">
            <option value="">Любой</option>
            <option value="male">Мужской</option>
            <option value="female">Женский</option>
          </select>
        </div>
        <div>
          <label className="label">Жанр</label>
          <input name="genre" defaultValue={genre ?? ""} placeholder="реклама, игры…" className="input" />
        </div>
        <div>
          <label className="label">Цена до, ₽</label>
          <input name="maxPrice" type="number" defaultValue={maxPrice ?? ""} className="input" />
        </div>
        <button type="submit" className="btn btn-primary">
          Применить
        </button>
      </form>

      {profiles.length === 0 ? (
        <p className="text-slate-500">Пока нет доступных профилей по этим фильтрам.</p>
      ) : (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4">
          {profiles.map((p) => (
            <TalentCard
              key={p.id}
              id={p.id}
              displayName={p.displayName}
              age={p.age}
              gender={p.gender}
              genreTags={p.genreTags}
              basePriceRub={p.basePriceRub}
              photoUrl={p.mediaAssets[0]?.url}
            />
          ))}
        </div>
      )}
    </div>
  );
}
