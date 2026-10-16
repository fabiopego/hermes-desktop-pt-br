import path from 'node:path'; import { pathToFileURL } from 'node:url'; import { createRequire } from 'node:module'
const AGENT = process.env.HERMES_AGENT_DIR, ROOT = process.env.REPO_DIR
const { build } = createRequire(AGENT + '/apps/desktop/package.json')('esbuild')
const SRC = path.join(AGENT, 'apps/desktop/src'), out = path.join(process.env.TMPDIR || '.', 'ptgap/en2.mjs')
await build({ entryPoints: [path.join(SRC, 'i18n/en.ts')], bundle: true, format: 'esm', platform: 'node', outfile: out, alias: { '@': SRC, '@hermes/shared/i18n': path.join(AGENT, 'apps/shared/src/i18n.ts'), '@hermes/shared': path.join(AGENT, 'apps/shared/src') }, logLevel: 'error' })
const en = (await import(pathToFileURL(out).href)).en
const plugin = (await import(pathToFileURL(path.join(ROOT, 'plugin.js')).href)).default
let reg = null
plugin.register({ i18n: { registerAppLocale: (id, r) => { reg = { id, ...r }; return () => {} } }, onDispose() {} })
const isObj = v => v && typeof v === 'object' && !Array.isArray(v)
const leaves = (o, p = [], out = {}) => { for (const [k, v] of Object.entries(o)) isObj(v) ? leaves(v, [...p, k], out) : out[[...p, k].join('.')] = v; return out }
const E = leaves(en), P = leaves(reg.translations)
const missing = Object.keys(E).filter(k => !(k in P)), extra = Object.keys(P).filter(k => !(k in E))
const typeMismatch = Object.keys(E).filter(k => k in P && typeof E[k] !== typeof P[k])
console.log(JSON.stringify({ id: reg.id, endonym: reg.endonym, en: Object.keys(E).length, pt: Object.keys(P).length, faltando: missing.length, sobrando: extra.length, tipoDiferente: typeMismatch.length }))
if (missing.length) console.log('faltando:', missing.slice(0, 10)); if (typeMismatch.length) console.log('tipo:', typeMismatch.slice(0, 10))
