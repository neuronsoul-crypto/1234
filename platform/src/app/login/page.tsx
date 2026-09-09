import { login } from "@/lib/actions";

export default function LoginPage() {
  return (
    <form action={login} className="card mx-auto max-w-sm space-y-3">
      <h1 className="text-lg font-semibold text-ink">Вход</h1>
      <div>
        <label className="label">Email</label>
        <input name="email" type="email" required className="input" />
      </div>
      <div>
        <label className="label">Пароль</label>
        <input name="password" type="password" required className="input" />
      </div>
      <button type="submit" className="btn btn-primary w-full">
        Войти
      </button>
    </form>
  );
}
