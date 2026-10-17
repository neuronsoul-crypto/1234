import '@fontsource-variable/onest/index.css'

import { LogoMark } from '../ui/Logo'

export function Logo() {
  return (
    <div className="hg-admin-logo">
      <LogoMark size={56} />
      <div>
        <div className="hg-admin-logo__name">Храмы Гаспры</div>
        <div className="hg-admin-logo__sub">Управление сайтом</div>
      </div>
    </div>
  )
}

export function Icon() {
  return <LogoMark size={28} />
}
