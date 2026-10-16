// Gera dist/plugin.js: plugin de desktop (ESM puro, sem imports externos) que registra o idioma 'pt'.
// Carrega sem recompilar o app e sobrevive ao `hermes update`.
import { createRequire } from 'node:module'
import path from 'node:path'
import fs from 'node:fs'
const AGENT = process.env.HERMES_AGENT_DIR
const { build } = createRequire(AGENT + '/apps/desktop/package.json')('esbuild')
const SRC = path.join(AGENT, 'apps/desktop/src')
const ROOT = process.env.REPO_DIR
const stub = {
  name: 'identity-define-locale',
  setup(b) {
    b.onResolve({ filter: /define-locale$/ }, () => ({ path: 'dl', namespace: 'stub' }))
    b.onLoad({ filter: /.*/, namespace: 'stub' }, () => ({ contents: 'export const defineLocale = x => x', loader: 'js' }))
  }
}
const version = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')).version
const P = f => JSON.stringify(path.join(ROOT, f).split(path.sep).join('/'))
const entry = `
import { ptBR } from ${P('i18n/pt-BR.ts')}
import gaps from ${P('i18n/pt-BR.gaps.js')}
import obsolete from ${P('i18n/pt-BR.obsolete.js')}
const isObj = v => v && typeof v === 'object' && !Array.isArray(v)
const tree = structuredCloneWithFns(ptBR)
function structuredCloneWithFns(o) { const r = {}; for (const [k, v] of Object.entries(o)) r[k] = isObj(v) ? structuredCloneWithFns(v) : v; return r }
for (const p of obsolete) { let c = tree; for (let i = 0; i < p.length - 1 && c; i++) c = c[p[i]]; if (c) delete c[p[p.length - 1]] }
for (const [p, v] of gaps) { let c = tree; for (let i = 0; i < p.length - 1; i++) c = c[p[i]] = isObj(c[p[i]]) ? c[p[i]] : {}; c[p[p.length - 1]] = v }
export default {
  id: 'hermes-pt-br',
  name: 'Português (Brasil)',
  description: 'Traduz a interface do Hermes Desktop para português do Brasil. v${version}',
  defaultEnabled: true,
  register(ctx) {
    const dispose = ctx.i18n.registerAppLocale('pt', { endonym: 'Português', englishName: 'Portuguese (Brazil)', translations: tree })
    if (typeof ctx.onDispose === 'function') ctx.onDispose(dispose)
  }
}
`
fs.mkdirSync(path.join(ROOT, 'dist'), { recursive: true })
await build({
  stdin: { contents: entry, resolveDir: ROOT, loader: 'js' },
  bundle: true, format: 'esm', platform: 'neutral', target: 'es2022', charset: 'utf8',
  outfile: path.join(ROOT, 'dist/plugin.js'), alias: { '@': SRC }, plugins: [stub], logLevel: 'error',
  loader: { '.ts': 'ts' }
})
console.log('ok', fs.statSync(path.join(ROOT, 'dist/plugin.js')).size, 'bytes')
