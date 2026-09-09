"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "./db";
import { createSession, destroySession, getSession, hashPassword, verifyPassword } from "./auth";
import { logAudit } from "./audit";
import crypto from "crypto";

const COMMISSION_RATE = 0.1; // раздел 3 ТЗ — ориентир 10%
const MIN_PRICE_RUB = 1000; // защита от демпинга, раздел 3/11 ТЗ — минимальная цена на платформе

function fail(message: string): never {
  throw new Error(message);
}

async function requireSession() {
  const session = await getSession();
  if (!session) fail("Требуется вход в систему");
  return session!;
}

// ---------- Регистрация / сессия ----------

export async function registerTalent(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const displayName = String(formData.get("displayName") || "").trim();
  const age = Number(formData.get("age"));
  const gender = String(formData.get("gender") || "");

  if (!email || !password || !displayName) fail("Заполните все поля");
  if (age < 18) fail("Регистрация Talent доступна только совершеннолетним (раздел 6 ТЗ)");

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) fail("Пользователь с такой почтой уже зарегистрирован");

  const passwordHash = await hashPassword(password);
  const user = await db.user.create({
    data: {
      email,
      passwordHash,
      role: "TALENT",
      verificationStatus: "PENDING", // KYC/liveness — стаб, реальный провайдер см. docs/TZ.md 8
      talentProfile: {
        create: {
          displayName,
          age,
          gender,
          genreTags: [],
          basePriceRub: MIN_PRICE_RUB,
          availability: "HIDDEN",
          moderationStatus: "PENDING",
        },
      },
    },
  });

  await logAudit({ actorUserId: user.id, action: "user_registered", targetType: "User", targetId: user.id });
  await createSession({ userId: user.id, role: "TALENT" });
  redirect("/consent/biometric");
}

export async function registerBuyer(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const companyName = String(formData.get("companyName") || "").trim();

  if (!email || !password || !companyName) fail("Заполните все поля");

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) fail("Пользователь с такой почтой уже зарегистрирован");

  const passwordHash = await hashPassword(password);
  const user = await db.user.create({
    data: {
      email,
      passwordHash,
      role: "BUYER",
      companyName,
      verificationStatus: "PENDING", // проверка по ЕГРЮЛ/ЕГРИП — стаб
    },
  });

  await logAudit({ actorUserId: user.id, action: "user_registered", targetType: "User", targetId: user.id });
  await createSession({ userId: user.id, role: "BUYER" });
  redirect("/dashboard/buyer");
}

export async function login(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  const user = await db.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    fail("Неверная почта или пароль");
  }

  await createSession({ userId: user!.id, role: user!.role });
  if (user!.role === "TALENT") redirect("/dashboard/talent");
  if (user!.role === "BUYER") redirect("/dashboard/buyer");
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/");
}

// ---------- Биометрическое согласие (ст. 11 152-ФЗ, отдельно от согласия на лицензию) ----------

export async function giveBiometricConsent() {
  const session = await requireSession();
  const profile = await db.talentProfile.findUnique({ where: { userId: session.userId } });
  if (!profile) fail("Профиль Talent не найден");

  await db.biometricConsent.create({
    data: { talentProfileId: profile.id, textVersion: "v1.1" },
  });
  await logAudit({
    actorUserId: session.userId,
    action: "biometric_consent_given",
    targetType: "TalentProfile",
    targetId: profile.id,
  });
  revalidatePath("/dashboard/talent");
  redirect("/dashboard/talent");
}

export async function revokeBiometricConsent(consentId: string) {
  const session = await requireSession();
  const profile = await db.talentProfile.findUnique({ where: { userId: session.userId } });
  if (!profile) fail("Профиль Talent не найден");

  await db.biometricConsent.update({
    where: { id: consentId },
    data: { revokedAt: new Date() },
  });
  // Отзыв закрывает профиль для новых заявок, но не отменяет уже оплаченные лицензии — раздел 0.3 ТЗ
  await db.talentProfile.update({ where: { id: profile.id }, data: { availability: "HIDDEN" } });
  await logAudit({
    actorUserId: session.userId,
    action: "biometric_consent_revoked",
    targetType: "TalentProfile",
    targetId: profile.id,
  });
  revalidatePath("/dashboard/talent");
}

// ---------- Профиль Talent ----------

export async function updateTalentProfile(formData: FormData) {
  const session = await requireSession();
  const profile = await db.talentProfile.findUnique({ where: { userId: session.userId } });
  if (!profile) fail("Профиль Talent не найден");

  const basePriceRub = Math.max(MIN_PRICE_RUB, Number(formData.get("basePriceRub")) || MIN_PRICE_RUB);
  const genreTags = String(formData.get("genreTags") || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  await db.talentProfile.update({
    where: { id: profile.id },
    data: {
      bio: String(formData.get("bio") || ""),
      ethnicity: String(formData.get("ethnicity") || ""),
      genreTags,
      basePriceRub,
      moderationStatus: "PENDING", // изменения уходят на повторную модерацию
    },
  });
  await logAudit({ actorUserId: session.userId, action: "profile_updated", targetType: "TalentProfile", targetId: profile.id });
  revalidatePath("/dashboard/talent");
}

export async function addMediaAsset(formData: FormData) {
  const session = await requireSession();
  const profile = await db.talentProfile.findUnique({ where: { userId: session.userId } });
  if (!profile) fail("Профиль Talent не найден");

  const url = String(formData.get("url") || "").trim();
  const kind = String(formData.get("kind") || "PHOTO") as "PHOTO" | "VIDEO";
  if (!url) fail("Укажите ссылку на файл");

  // MVP-стаб: ссылка на файл вместо реальной загрузки в объектное хранилище (docs/TZ.md 8.1)
  const asset = await db.mediaAsset.create({
    data: { talentProfileId: profile.id, url, kind, moderationStatus: "PENDING" },
  });
  await logAudit({ actorUserId: session.userId, action: "media_uploaded", targetType: "MediaAsset", targetId: asset.id });
  revalidatePath("/dashboard/talent");
}

export async function setAvailability(available: boolean) {
  const session = await requireSession();
  const profile = await db.talentProfile.findUnique({
    where: { userId: session.userId },
    include: { biometricConsents: true },
  });
  if (!profile) fail("Профиль Talent не найден");

  const hasActiveConsent = profile.biometricConsents.some((c) => !c.revokedAt);
  if (available && (!hasActiveConsent || profile.moderationStatus !== "APPROVED")) {
    fail("Публикация в каталоге требует действующего биометрического согласия и одобрения модератором");
  }

  await db.talentProfile.update({
    where: { id: profile.id },
    data: { availability: available ? "AVAILABLE" : "HIDDEN" },
  });
  revalidatePath("/dashboard/talent");
  revalidatePath("/");
}

// ---------- Лицензии ----------

export async function requestLicense(formData: FormData) {
  const session = await requireSession();
  if (session.role !== "BUYER") fail("Запрос лицензии доступен только Buyer");

  const talentProfileId = String(formData.get("talentProfileId") || "");
  const projectDescription = String(formData.get("projectDescription") || "").trim();
  const contentType = String(formData.get("contentType") || "").trim();
  const durationDays = Number(formData.get("durationDays")) || 30;
  const exclusivity = formData.get("exclusivity") === "on";

  if (!talentProfileId || !projectDescription || !contentType) fail("Заполните все поля заявки");

  const profile = await db.talentProfile.findUnique({ where: { id: talentProfileId } });
  if (!profile || profile.availability !== "AVAILABLE") fail("Профиль недоступен для лицензирования");

  const priceRub = Math.round(profile.basePriceRub * (exclusivity ? 2 : 1));
  const commissionRub = Math.round(priceRub * COMMISSION_RATE);

  const license = await db.license.create({
    data: {
      talentProfileId,
      buyerId: session.userId,
      projectDescription,
      contentType,
      exclusivity,
      durationDays,
      priceRub,
      commissionRub,
      status: "REQUESTED",
    },
  });

  await db.notification.create({
    data: {
      userId: profile.userId,
      type: "license_requested",
      message: `Новая заявка на лицензию: ${contentType} — ${projectDescription.slice(0, 80)}`,
    },
  });
  await logAudit({ actorUserId: session.userId, action: "license_requested", targetType: "License", targetId: license.id });
  revalidatePath("/dashboard/buyer");
  redirect("/dashboard/buyer");
}

export async function respondToLicenseRequest(licenseId: string, approve: boolean) {
  const session = await requireSession();
  const license = await db.license.findUnique({ where: { id: licenseId }, include: { talentProfile: true } });
  if (!license) fail("Заявка не найдена");
  if (license.talentProfile.userId !== session.userId) fail("Нет доступа к этой заявке");
  if (license.status !== "REQUESTED") fail("Заявка уже обработана");

  if (!approve) {
    await db.license.update({ where: { id: licenseId }, data: { status: "REJECTED" } });
    await logAudit({ actorUserId: session.userId, action: "license_rejected", targetType: "License", targetId: licenseId });
    revalidatePath("/dashboard/talent");
    return;
  }

  // Согласие на конкретное использование — отдельно от биометрического (раздел 0.2 ТЗ)
  const contractText = `Лицензионный договор №${licenseId}. Тип контента: ${license.contentType}. Территория: ${license.territory}. Срок: ${license.durationDays} дн. Эксклюзивность: ${license.exclusivity ? "да" : "нет"}. Цена: ${license.priceRub} ₽.`;
  const contentHash = crypto.createHash("sha256").update(contractText).digest("hex");

  await db.$transaction([
    db.licenseConsent.create({ data: { licenseId } }),
    db.contract.create({
      data: { licenseId, textVersion: contractText, contentHash, signedByTalent: true },
    }),
    db.license.update({ where: { id: licenseId }, data: { status: "SIGNED" } }),
    db.notification.create({
      data: {
        userId: license.buyerId,
        type: "license_approved",
        message: `Talent одобрил заявку. Договор готов к подписанию и оплате.`,
      },
    }),
  ]);

  await logAudit({ actorUserId: session.userId, action: "license_consent_given", targetType: "License", targetId: licenseId });
  revalidatePath("/dashboard/talent");
}

export async function signAndPay(licenseId: string) {
  const session = await requireSession();
  const license = await db.license.findUnique({ where: { id: licenseId }, include: { contract: true } });
  if (!license || !license.contract) fail("Договор не найден");
  if (license.buyerId !== session.userId) fail("Нет доступа к этой заявке");
  if (license.status !== "SIGNED") fail("Договор ещё не готов к оплате");

  const expiresAt = new Date(Date.now() + license.durationDays * 24 * 60 * 60 * 1000);

  // Эскроу — упрощённая статусная модель на MVP (docs/TZ.md 8, 5.5): резерв средств до подтверждения условий
  await db.$transaction([
    db.contract.update({ where: { licenseId }, data: { signedByBuyer: true, signedAt: new Date() } }),
    db.transaction.create({
      data: {
        licenseId,
        amountRub: license.priceRub,
        commissionRub: license.commissionRub,
        escrowStatus: "HELD",
        paidAt: new Date(),
      },
    }),
    db.license.update({ where: { id: licenseId }, data: { status: "ACTIVE", expiresAt } }),
  ]);

  await logAudit({ actorUserId: session.userId, action: "license_paid", targetType: "License", targetId: licenseId });
  revalidatePath("/dashboard/buyer");
}

export async function raiseDispute(licenseId: string, reason: string) {
  const session = await requireSession();
  if (!reason.trim()) fail("Укажите причину спора");

  const license = await db.license.findUnique({ where: { id: licenseId } });
  if (!license) fail("Лицензия не найдена");

  await db.$transaction([
    db.dispute.create({ data: { licenseId, raisedByUserId: session.userId, reason } }),
    db.license.update({ where: { id: licenseId }, data: { status: "DISPUTED" } }),
  ]);
  await logAudit({ actorUserId: session.userId, action: "dispute_raised", targetType: "License", targetId: licenseId });
  revalidatePath("/dashboard/buyer");
  revalidatePath("/dashboard/talent");
}

export async function leaveReview(formData: FormData) {
  const session = await requireSession();
  const licenseId = String(formData.get("licenseId") || "");
  const rating = Number(formData.get("rating"));
  const comment = String(formData.get("comment") || "");

  const license = await db.license.findUnique({ where: { id: licenseId } });
  if (!license || license.buyerId !== session.userId) fail("Нет доступа");
  if (!["ACTIVE", "EXPIRED"].includes(license.status)) fail("Отзыв можно оставить только по действующей или завершённой лицензии");

  await db.review.create({
    data: { licenseId, talentProfileId: license.talentProfileId, rating, comment },
  });
  revalidatePath("/dashboard/buyer");
}

// ---------- Модерация (moderator/admin) ----------

export async function moderateProfile(talentProfileId: string, approve: boolean) {
  const session = await requireSession();
  if (session.role !== "MODERATOR" && session.role !== "ADMIN") fail("Доступ только модераторам");

  await db.talentProfile.update({
    where: { id: talentProfileId },
    data: { moderationStatus: approve ? "APPROVED" : "REJECTED" },
  });
  await logAudit({
    actorUserId: session.userId,
    action: approve ? "profile_approved" : "profile_rejected",
    targetType: "TalentProfile",
    targetId: talentProfileId,
  });
  revalidatePath("/admin");
}

export async function moderateMedia(mediaAssetId: string, approve: boolean) {
  const session = await requireSession();
  if (session.role !== "MODERATOR" && session.role !== "ADMIN") fail("Доступ только модераторам");

  await db.mediaAsset.update({
    where: { id: mediaAssetId },
    data: { moderationStatus: approve ? "APPROVED" : "REJECTED" },
  });
  await logAudit({
    actorUserId: session.userId,
    action: approve ? "media_approved" : "media_rejected",
    targetType: "MediaAsset",
    targetId: mediaAssetId,
  });
  revalidatePath("/admin");
}

export async function resolveDispute(disputeId: string, resolutionNote: string, release: boolean) {
  const session = await requireSession();
  if (session.role !== "MODERATOR" && session.role !== "ADMIN") fail("Доступ только модераторам");

  const dispute = await db.dispute.findUnique({ where: { id: disputeId } });
  if (!dispute) fail("Спор не найден");

  await db.$transaction([
    db.dispute.update({ where: { id: disputeId }, data: { status: "RESOLVED", resolutionNote } }),
    db.license.update({
      where: { id: dispute.licenseId },
      data: { status: release ? "ACTIVE" : "REVOKED" },
    }),
    db.transaction.update({
      where: { licenseId: dispute.licenseId },
      data: { escrowStatus: release ? "RELEASED" : "REFUNDED" },
    }),
  ]);
  await logAudit({ actorUserId: session.userId, action: "dispute_resolved", targetType: "Dispute", targetId: disputeId });
  revalidatePath("/admin");
}
