// Lista chaves do en.ts que faltam no pt-BR.ts (ou que ainda estao iguais ao ingles).
import { createRequire } from 'node:module'
const { build } = createRequire(process.env.HERMES_AGENT_DIR + '/apps/desktop/package.json')('esbuild')
import path from 'node:path'
import fs from 'node:fs'
import { pathToFileURL } from 'node:url'

const AGENT = process.env.HERMES_AGENT_DIR
const SRC = path.join(AGENT, 'apps/desktop/src')
const SHARED = path.join(AGENT, 'apps/shared/src')
const OUT = path.join(process.env.TMPDIR || '.', 'ptgap')
fs.mkdirSync(OUT, { recursive: true })

const identityDefineLocale = {
  name: 'identity-define-locale',
  setup(b) {
    b.onResolve({ filter: /define-locale$/ }, () => ({ path: 'dl', namespace: 'stub' }))
    b.onLoad({ filter: /.*/, namespace: 'stub' }, () => ({ contents: 'export const defineLocale = x => x', loader: 'js' }))
  }
}
const alias = { '@': SRC, '@hermes/shared/i18n': path.join(SHARED, 'i18n.ts'), '@hermes/shared': SHARED }

async function load(entry, name, plugins = []) {
  const outfile = path.join(OUT, name + '.mjs')
  await build({ entryPoints: [entry], bundle: true, format: 'esm', platform: 'node', outfile, alias, plugins, logLevel: 'error', loader: { '.ts': 'ts', '.tsx': 'tsx' } })
  return import(pathToFileURL(outfile).href + '?t=' + Date.now())
}

const pt = (await load(path.join(SRC, 'i18n/pt-BR.ts'), 'pt', [identityDefineLocale])).ptBR
const en = (await load(path.join(SRC, 'i18n/en.ts'), 'en')).en

const isObj = v => v && typeof v === 'object' && !Array.isArray(v)
const PATHS = {}
function leaves(o, p = [], out = {}) {
  for (const [k, v] of Object.entries(o)) {
    const arr = [...p, k]
    if (isObj(v)) leaves(v, arr, out); else { const key = arr.join('.'); out[key] = v; PATHS[key] = arr }
  }
  return out
}
const E = leaves(en), P = leaves(pt)
const missing = Object.keys(E).filter(k => !(k in P))
const extra = Object.keys(P).filter(k => !(k in E))
const same = Object.keys(E).filter(k => k in P && typeof E[k] === 'string' && E[k] === P[k] && /[A-Za-z]{4,}/.test(E[k]))
console.log(JSON.stringify({ enKeys: Object.keys(E).length, ptKeys: Object.keys(P).length, missing: missing.length, extra: extra.length, sameAsEnglish: same.length }))
const items = missing.map((k, i) => ({ id: i, key: k, path: PATHS[k], isFn: typeof E[k] === 'function', en: typeof E[k] === 'function' ? E[k].toString() : E[k] }))
const WORK = process.env.WORK_DIR || OUT
fs.mkdirSync(WORK, { recursive: true })
fs.writeFileSync(path.join(WORK, 'missing.json'), JSON.stringify(items, null, 1))
fs.writeFileSync(path.join(WORK, 'extra.json'), JSON.stringify(extra.map(k => PATHS[k]), null, 1))
fs.writeFileSync(path.join(OUT, 'missing_old.json'), '[]')
fs.writeFileSync(path.join(OUT, 'same.json'), JSON.stringify(same.map(k => ({ key: k, en: E[k] })), null, 1))
