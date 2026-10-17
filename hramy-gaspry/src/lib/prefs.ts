/** Настройки посетителя (тема, размер шрифта) — в localStorage, с защитой от недоступного хранилища. */
export function readPref(key: string): string | null {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

export function writePref(key: string, value: string | null) {
  try {
    if (value === null) window.localStorage.removeItem(key)
    else window.localStorage.setItem(key, value)
  } catch {
    // приватный режим или запрет хранилища — настройка просто не запомнится
  }
}

/** Скрипт в <head>: применяет настройки до отрисовки, чтобы не было мигания. */
export const PREFS_SCRIPT = `(function(){try{var d=document.documentElement;var t=localStorage.getItem('hg-theme');if(t==='dark'||t==='light')d.setAttribute('data-theme',t);var f=localStorage.getItem('hg-fs');if(f==='1'||f==='2')d.setAttribute('data-fs',f);}catch(e){}})();`
