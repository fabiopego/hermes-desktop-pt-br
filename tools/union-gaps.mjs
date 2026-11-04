// Une work/gaps.new.js ao i18n/pt-BR.gaps.js e acrescenta work/extra.json em pt-BR.obsolete.js.
import fs from 'node:fs'; import { pathToFileURL } from 'node:url'
const R = process.env.REPO_DIR, imp = f => import(pathToFileURL(R + '/' + f).href + '?t=' + Date.now()).then(m => m.default)
const old = await imp('i18n/pt-BR.gaps.js'), nw = await imp('work/gaps.new.js'), ob = await imp('i18n/pt-BR.obsolete.js')
const ex = JSON.parse(fs.readFileSync(R + '/work/extra.json', 'utf8'))
const all = [...new Map([...ob, ...ex].map(p => [p.join('.'), p])).values()]
const dead = new Set(all.map(p => p.join('.')))
const map = new Map(old.map(([p, v]) => [p.join('.'), [p, v]])); for (const [p, v] of nw) map.set(p.join('.'), [p, v])
const lines = [...map.values()].filter(([p]) => !dead.has(p.join('.'))).map(([p, v]) => '  [' + JSON.stringify(p) + ', ' + (typeof v === 'function' ? v.toString() : JSON.stringify(v)) + ']')
fs.writeFileSync(R + '/i18n/pt-BR.gaps.js', '// GERADO por tools/merge-gaps.mjs + tools/union-gaps.mjs\nexport default [\n' + lines.join(',\n') + '\n]\n')
fs.writeFileSync(R + '/i18n/pt-BR.obsolete.js', '// GERADO: chaves que sairam do en.ts\nexport default ' + JSON.stringify(all) + '\n')
console.log('gaps', lines.length, 'obsoletas', all.length)
