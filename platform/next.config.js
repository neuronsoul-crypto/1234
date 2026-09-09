// В проде сайт живёт на поддиректории tavrida-osmotr.ru/aifaces — задаём это только
// через переменную окружения на сервере сборки, чтобы локальная разработка (npm run dev)
// оставалась на корневом пути.
const basePath = process.env.DEPLOY_BASE_PATH || "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath,
};

module.exports = nextConfig;
