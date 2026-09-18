# Личный органайзер — Android (MVP-каркас)

Каркас Android-приложения по ТЗ: Kotlin + Jetpack Compose + Room + Material 3,
4 модуля на Bottom Navigation Bar (Рейсы / Покупки / Задачи / Заметки).

На этом этапе экраны — заготовки (пустое состояние + кнопка добавления),
слой данных Room (сущности/DAO) реализован полностью по схемам из ТЗ.
Серверная часть трекера рейсов (Node.js) и логика Firebase Cloud Messaging
в этот каркас пока не входят — следующий этап.

## Структура

```
app/src/main/java/com/personalapp/mvp/
  MainActivity.kt, PersonalApp.kt
  navigation/        — Bottom Navigation Bar + NavHost
  ui/theme/          — тема Material 3 (авто светлая/тёмная, Material You)
  ui/screens/        — экраны 4 модулей
  data/              — Room: entities, DAO, AppDatabase
```

## Сборка

Требуется Android Studio (Ladybug+) с установленным Android SDK
(compileSdk/targetSdk 35, minSdk 26) — либо `./gradlew assembleDebug`
при наличии SDK и переменной `ANDROID_HOME`.

APK для этого коммита также собирается автоматически через
GitHub Actions (`.github/workflows/android-build.yml`) и доступен
во вкладке Actions → артефакт `app-debug`.
