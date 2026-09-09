import Link from "next/link";
import { getSession } from "@/lib/auth";
import { logout } from "@/lib/actions";

export default async function Navbar() {
  const session = await getSession();

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold text-ink">
          Лицо<span className="text-accent">Лицензия</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/" className="text-slate-600 hover:text-ink">
            Каталог
          </Link>
          {!session && (
            <>
              <Link href="/login" className="text-slate-600 hover:text-ink">
                Войти
              </Link>
              <Link href="/register" className="btn btn-primary">
                Регистрация
              </Link>
            </>
          )}
          {session?.role === "TALENT" && (
            <Link href="/dashboard/talent" className="btn btn-secondary">
              Кабинет Talent
            </Link>
          )}
          {session?.role === "BUYER" && (
            <Link href="/dashboard/buyer" className="btn btn-secondary">
              Кабинет Buyer
            </Link>
          )}
          {(session?.role === "MODERATOR" || session?.role === "ADMIN") && (
            <Link href="/admin" className="btn btn-secondary">
              Админ-панель
            </Link>
          )}
          {session && (
            <form action={logout}>
              <button className="btn btn-secondary" type="submit">
                Выйти
              </button>
            </form>
          )}
        </nav>
      </div>
    </header>
  );
}
