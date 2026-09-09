import Link from "next/link";

type Props = {
  id: string;
  displayName: string;
  age: number;
  gender: string;
  genreTags: string[];
  basePriceRub: number;
  photoUrl?: string;
};

export default function TalentCard({ id, displayName, age, gender, genreTags, basePriceRub, photoUrl }: Props) {
  return (
    <Link href={`/talent/${id}`} className="card block hover:shadow-md transition-shadow">
      <div className="mb-3 aspect-square w-full overflow-hidden rounded-lg bg-slate-100">
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photoUrl} alt={displayName} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-400 text-sm">Нет фото</div>
        )}
      </div>
      <div className="font-medium text-ink">{displayName}</div>
      <div className="text-sm text-slate-500">
        {age} лет · {gender === "male" ? "мужской" : gender === "female" ? "женский" : gender}
      </div>
      <div className="mt-2 flex flex-wrap gap-1">
        {genreTags.slice(0, 3).map((tag) => (
          <span key={tag} className="badge bg-slate-100 text-slate-600">
            {tag}
          </span>
        ))}
      </div>
      <div className="mt-3 text-sm font-semibold text-accent">от {basePriceRub.toLocaleString("ru-RU")} ₽</div>
    </Link>
  );
}
