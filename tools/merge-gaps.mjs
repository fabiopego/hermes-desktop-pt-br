// Junta work/out_N.js (traducoes dos buracos) em i18n/pt-BR.gaps.js, validando contra work/missing.json.
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
const WORK = process.env.WORK_DIR
const OUTFILE = process.env.GAPS_OUT
const items = JSON.parse(fs.readFileSync(path.join(WORK, 'missing.json'), 'utf8'))
const byId = new Map(items.map(i => [i.id, i]))
const got = new Map()
for (const f of fs.readdirSync(WORK).filter(f => /^out_\d+\.js$/.test(f))) {
  const mod = (await import(pathToFileURL(path.join(WORK, f)).href + '?t=' + Date.now())).default
  for (const [id, v] of Object.entries(mod)) got.set(Number(id), v)
}
const problems = []
const lines = []
for (const it of items) {
  const v = got.get(it.id)
  if (v === undefined) { problems.push(`faltando ${it.key}`); continue }
  if (it.isFn !== (typeof v === 'function')) { problems.push(`tipo errado ${it.key}`); continue }
  if (it.isFn) {
    try { const r = v('X', 'Y', 'Z'); const r2 = v(1, 3, 2); if (!['intro.custom','settings.vault.identifierShown'].includes(it.key) && (typeof r !== 'string' || typeof r2 !== 'string')) throw new Error('nao retornou string') } catch (e) { problems.push(`fn quebrada ${it.key}: ${e.message}`); continue }
  } else if (typeof v !== 'string' || !v.trim()) { problems.push(`vazio ${it.key}`); continue }
  else {
    const ph = s => (s.match(/\{\d+\}|\{[a-zA-Z]+\}/g) || []).sort().join()
    if (ph(it.en) !== ph(v)) problems.push(`placeholder diferente ${it.key}`)
  }
  lines.push(`  [${JSON.stringify(it.path)}, ${it.isFn ? v.toString() : JSON.stringify(v)}]`)
}
console.log(JSON.stringify({ itens: items.length, ok: lines.length, problemas: problems.length }))
if (problems.length) console.log(problems.slice(0, 40).join('\n'))
fs.writeFileSync(OUTFILE, `// GERADO por tools/merge-gaps.mjs -- traducoes das chaves que o pt-BR.ts ainda nao cobria.\n// Formato: [caminho, texto | funcao]. Nao editar a mao; edite e rode de novo, ou mova para pt-BR.ts.\nexport default [\n${lines.join(',\n')}\n]\n`)
