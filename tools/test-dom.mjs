// Teste do tradutor de tela com jsdom (usa o jsdom do checkout do hermes-agent).
import { createRequire } from 'node:module'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
const AGENT = process.env.HERMES_AGENT_DIR, ROOT = process.env.REPO_DIR
const { JSDOM } = createRequire(AGENT + '/package.json')('jsdom')
const dom = new JSDOM('<!doctype html><html lang="pt"><body></body></html>', { pretendToBeVisual: true })
Object.assign(globalThis, { document: dom.window.document, MutationObserver: dom.window.MutationObserver, NodeFilter: dom.window.NodeFilter, requestAnimationFrame: cb => setTimeout(cb, 0) })
const { startDomTranslator } = await import(pathToFileURL(path.join(ROOT, 'i18n/dom-translate.js')).href)
const { phrases, words, patterns } = await import(pathToFileURL(path.join(ROOT, 'i18n/pt-BR.backend.js')).href)
const body = document.body
body.innerHTML = `<h2>Important-mail monitor</h2><p>Check your inbox periodically and ping you ONLY about mail that actually needs attention.</p>
<label>How often?</label><input placeholder="Only notify me if the mail…"><span>medium</span><i class="f">every 15m</i><i class="b">Bot Chat (default)</i><i class="c">Bot Chat (claudio)</i>
<button role="combobox"><span>Weekly review</span></button><div role="listbox"><div role="option">sunday</div><div role="option">quick</div></div>`
const stop = startDomTranslator(phrases, words, patterns)
const wait = ms => new Promise(r => setTimeout(r, ms))
await wait(50)
// conteudo inserido depois (como o React faz)
const late = document.createElement('div'); late.innerHTML = '<h3>Morning briefing</h3><div role="option">weekends</div>'; body.appendChild(late)
await wait(50)
const t = s => document.querySelector(s)
const out = {
  titulo: t('h2').textContent, desc: t('p').textContent, label: t('label').textContent,
  placeholder: t('input').getAttribute('placeholder'), palavraSolta_fora_de_lista: t('span').textContent,
  combobox: t('button span').textContent, opcoes: [...document.querySelectorAll('[role=option]')].map(x => x.textContent),
  freq: t('.f').textContent, bot: t('.b').textContent, botNomeProprio: t('.c').textContent,
  tardio: t('h3').textContent,
}
console.log(JSON.stringify(out, null, 1))
// idioma ingles: nao pode traduzir
document.documentElement.lang = 'en'; const h = document.createElement('h4'); h.textContent = 'Weekly review'; body.appendChild(h); await wait(50)
console.log('em ingles fica:', h.textContent)
stop()
