export function splitChars(el) {
  const text = el.textContent
  el.textContent = ''
  el.setAttribute('aria-label', text)
  const chars = [...text].map(char => {
    const span = document.createElement('span')
    span.className = 'char'
    span.style.cssText = 'display:inline-block;overflow:hidden;vertical-align:bottom;'
    const inner = document.createElement('span')
    inner.className = 'char-inner'
    inner.style.cssText = 'display:inline-block;'
    inner.textContent = char === ' ' ? ' ' : char
    span.appendChild(inner)
    return span
  })
  chars.forEach(c => el.appendChild(c))
  return chars.map(c => c.querySelector('.char-inner'))
}

export function splitWords(el) {
  const text = el.textContent
  el.textContent = ''
  el.setAttribute('aria-label', text)
  const words = text.split(' ')
  const spans = words.map((word, i) => {
    const span = document.createElement('span')
    span.className = 'word'
    span.style.cssText = 'display:inline-block;overflow:hidden;vertical-align:bottom;margin-right:0.28em;'
    const inner = document.createElement('span')
    inner.className = 'word-inner'
    inner.style.cssText = 'display:inline-block;'
    inner.textContent = word
    span.appendChild(inner)
    return { span, inner }
  })
  spans.forEach(({ span }) => el.appendChild(span))
  return spans.map(s => s.inner)
}
