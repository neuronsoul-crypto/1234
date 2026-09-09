import { registerTalent, registerBuyer } from "@/lib/actions";

export default function RegisterPage() {
  return (
    <div className="mx-auto grid max-w-3xl gap-8 md:grid-cols-2">
      <form action={registerTalent} className="card space-y-3">
        <h2 className="text-lg font-semibold text-ink">Я — Talent</h2>
        <p className="text-xs text-slate-500">
          Сдаю в лицензию своё лицо. Доступно только совершеннолетним (раздел 6 ТЗ). После регистрации потребуется
          отдельное согласие на обработку биометрии.
        </p>
        <div>
          <label className="label">Имя/псевдоним</label>
          <input name="displayName" required className="input" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Возраст</label>
            <input name="age" type="number" min={18} required className="input" />
          </div>
          <div>
            <label className="label">Пол</label>
            <select name="gender" required className="input">
              <option value="female">Женский</option>
              <option value="male">Мужской</option>
            </select>
          </div>
        </div>
        <div>
          <label className="label">Email</label>
          <input name="email" type="email" required className="input" />
        </div>
        <div>
          <label className="label">Пароль</label>
          <input name="password" type="password" required minLength={6} className="input" />
        </div>
        <button type="submit" className="btn btn-primary w-full">
          Зарегистрироваться как Talent
        </button>
      </form>

      <form action={registerBuyer} className="card space-y-3">
        <h2 className="text-lg font-semibold text-ink">Я — продюсер/студия</h2>
        <p className="text-xs text-slate-500">Ищу внешность для ИИ-генерации контента.</p>
        <div>
          <label className="label">Название компании / ИП</label>
          <input name="companyName" required className="input" />
        </div>
        <div>
          <label className="label">Email</label>
          <input name="email" type="email" required className="input" />
        </div>
        <div>
          <label className="label">Пароль</label>
          <input name="password" type="password" required minLength={6} className="input" />
        </div>
        <button type="submit" className="btn btn-primary w-full">
          Зарегистрироваться как Buyer
        </button>
      </form>
    </div>
  );
}
