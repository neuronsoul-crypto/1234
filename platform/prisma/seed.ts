import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  await db.user.create({
    data: {
      email: "admin@platform.ru",
      passwordHash,
      role: "ADMIN",
      verificationStatus: "VERIFIED",
    },
  });

  await db.user.create({
    data: {
      email: "moderator@platform.ru",
      passwordHash,
      role: "MODERATOR",
      verificationStatus: "VERIFIED",
    },
  });

  const talents = [
    { slug: "anna", displayName: "Анна Соколова", age: 27, gender: "female", ethnicity: "славянский", genreTags: ["реклама", "мелодрама"], basePriceRub: 5000, photo: "https://picsum.photos/seed/anna/600/600" },
    { slug: "igor", displayName: "Игорь Волков", age: 34, gender: "male", ethnicity: "славянский", genreTags: ["игры", "триллер"], basePriceRub: 8000, photo: "https://picsum.photos/seed/igor/600/600" },
    { slug: "madina", displayName: "Мадина Ахметова", age: 24, gender: "female", ethnicity: "азиатский", genreTags: ["реклама", "комедия"], basePriceRub: 4500, photo: "https://picsum.photos/seed/madina/600/600" },
    { slug: "dmitry", displayName: "Дмитрий Орлов", age: 41, gender: "male", ethnicity: "славянский", genreTags: ["сериал", "драма"], basePriceRub: 12000, photo: "https://picsum.photos/seed/dmitry/600/600" },
  ];

  for (const t of talents) {
    const user = await db.user.create({
      data: {
        email: `${t.slug}@talent.ru`,
        passwordHash,
        role: "TALENT",
        verificationStatus: "VERIFIED",
        talentProfile: {
          create: {
            displayName: t.displayName,
            age: t.age,
            gender: t.gender,
            ethnicity: t.ethnicity,
            genreTags: t.genreTags,
            basePriceRub: t.basePriceRub,
            availability: "AVAILABLE",
            moderationStatus: "APPROVED",
            bio: `Модель/актёр(-риса), портфолио в жанрах: ${t.genreTags.join(", ")}.`,
            biometricConsents: { create: { textVersion: "v1.1" } },
            mediaAssets: { create: { url: t.photo, kind: "PHOTO", moderationStatus: "APPROVED", watermarked: true } },
          },
        },
      },
    });
    console.log("Создан Talent:", user.email);
  }

  const buyer = await db.user.create({
    data: {
      email: "buyer@studio.ru",
      passwordHash,
      role: "BUYER",
      companyName: "ООО «Рекламная студия»",
      verificationStatus: "VERIFIED",
    },
  });
  console.log("Создан Buyer:", buyer.email);

  console.log("\nТестовые аккаунты (пароль для всех: password123):");
  console.log(" admin@platform.ru, moderator@platform.ru, buyer@studio.ru, anna@talent.ru, igor@talent.ru, madina@talent.ru, dmitry@talent.ru");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
