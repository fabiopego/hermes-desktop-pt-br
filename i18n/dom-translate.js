// Traduz na tela os textos que o BACKEND do Hermes manda em inglês (modelos de automação etc.).
// Só troca quando o idioma ativo do app é português (<html lang="pt...">) e só texto que bate EXATAMENTE
// com o dicionário. Não grava nada no backend. shortcut: observer global simples; se pesar, restringir à tela de tarefas.
export function startDomTranslator(phrases, words, patterns = []) {
  if (typeof document === 'undefined' || typeof MutationObserver === 'undefined') return () => {}
  const norm = s => s.replace(/\s+/g, ' ').trim()
  const P = new Map(Object.entries(phrases).map(([k, v]) => [norm(k), v]))
  const W = new Map(Object.entries(words))
  const LIST = '[role="combobox"],[role="option"],[role="listbox"],[role="menuitem"]'
  const active = () => /^pt/i.test(document.documentElement.lang || '')
  const lookup = (text, el) => {
    const n = norm(text)
    if (!n) return null
    const hit = P.get(n)
    if (hit) return hit
    for (const [re, to] of patterns) if (re.test(n)) return n.replace(re, to)
    return el && el.closest && el.closest(LIST) ? W.get(n) || W.get(n.toLowerCase()) || null : null
  }
  const fixText = node => {
    const v = lookup(node.nodeValue, node.parentElement)
    if (!v) return
    const raw = node.nodeValue
    node.nodeValue = raw.match(/^\s*/)[0] + v + raw.match(/\s*$/)[0]
  }
  const ATTRS = ['placeholder', 'title', 'aria-label']
  const fixAttrs = el => {
    for (const a of ATTRS) {
      const cur = el.getAttribute && el.getAttribute(a)
      if (!cur) continue
      const v = lookup(cur, el)
      if (v) el.setAttribute(a, v)
    }
  }
  const walk = root => {
    if (root.nodeType === 3) return fixText(root)
    if (root.nodeType !== 1) return
    fixAttrs(root)
    const tw = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT)
    for (let n = tw.nextNode(); n; n = tw.nextNode()) n.nodeType === 3 ? fixText(n) : fixAttrs(n)
  }
  let queue = new Set(), scheduled = false
  const flush = () => {
    scheduled = false
    const items = [...queue]
    queue = new Set()
    if (!active()) return
    for (const n of items) if (n.isConnected !== false) walk(n)
  }
  const enqueue = n => {
    queue.add(n)
    if (!scheduled) { scheduled = true; requestAnimationFrame(flush) }
  }
  const mo = new MutationObserver(muts => {
    for (const m of muts) {
      if (m.type === 'childList') m.addedNodes.forEach(enqueue)
      else if (m.type === 'characterData') enqueue(m.target)
      else enqueue(m.target)
    }
  })
  const root = document.body || document.documentElement
  mo.observe(root, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS })
  enqueue(root)
  // reavalia tudo quando o idioma do app muda
  const lo = new MutationObserver(() => enqueue(root))
  lo.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] })
  return () => { mo.disconnect(); lo.disconnect() }
}
