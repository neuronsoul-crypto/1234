import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { giveBiometricConsent } from "@/lib/actions";
import { redirect } from "next/navigation";

const CONSENT_TEXT = `Согласие на обработку биометрических персональных данных (ст. 11 152-ФЗ «О персональных данных»)

Настоящим я даю согласие оператору персональных данных на обработку моих биометрических персональных данных
(изображение лица, видеозаписи с моим участием) в целях предоставления в лицензию права использования моей внешности
для генерации ИИ-контента третьими лицами на условиях, которые я самостоятельно определяю в своём профиле.

Согласие даётся отдельно от иных соглашений платформы (пользовательского соглашения, оферты) в соответствии с
требованиями Федерального закона № 156-ФЗ (действует с 1 сентября 2025 г.).

Я понимаю, что могу отозвать это согласие в любой момент в личном кабинете. Отзыв закрывает мой профиль для новых
заявок, но не отменяет уже оплаченные и правомерно использованные на момент отзыва лицензии.`;

export default async function BiometricConsentPage() {
  const session = await getSession();
  if (!session || session.role !== "TALENT") redirect("/login");

  const profile = await db.talentProfile.findUnique({
    where: { userId: session.userId },
    include: { biometricConsents: true },
  });

  const hasActiveConsent = profile?.biometricConsents.some((c) => !c.revokedAt);
  if (hasActiveConsent) redirect("/dashboard/talent");

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-4 text-xl font-semibold text-ink">Согласие на обработку биометрии</h1>
      <div className="card whitespace-pre-line text-sm text-slate-700">{CONSENT_TEXT}</div>
      <form action={giveBiometricConsent} className="mt-4">
        <button type="submit" className="btn btn-primary w-full">
          Даю согласие
        </button>
      </form>
    </div>
  );
}
