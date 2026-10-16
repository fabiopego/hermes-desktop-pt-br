---
name: hermes-pt-br-i18n
description: Reaplica pt-BR do Hermes Desktop apos hermes update.
---

# Traducao pt-BR do Hermes Desktop (plugin, v2)

O Hermes Desktop nao tem portugues na interface (PR upstream #38846 fechada,
issue #40239 aberta). So o backend/terminal vem em pt (`locales/pt.yaml`).
Mantemos uma traducao propria como **plugin de desktop**:

**https://github.com/fabiopego/hermes-pt-br** (privado)

## Por que plugin

No 0.22+ o idioma entra por `<hermes home>/desktop-plugins/hermes-pt-br/plugin.js`
(`ctx.i18n.registerAppLocale`). Nao toca no checkout do hermes-agent, nao
recompila, e o `hermes update` (git reset --hard) nao apaga. O metodo antigo
(`scripts/apply.py`, editar types/languages/catalog + rebuild) quebrou no 0.22.
Registra o id `pt` (mesmo do backend, endonym "Portugues"), nao `pt-br`: assim
nao aparece um segundo "Portugues" duplicado no seletor.

## Reinstalar (plugin sumiu ou maquina nova)

```bash
git clone https://github.com/fabiopego/hermes-pt-br && cd hermes-pt-br
python scripts/install-plugin.py
```
Reabrir o Desktop; Settings > Appearance > Language > Portugues.

## Apos hermes update: textos novos em ingles

O plugin cobre o en.ts do 0.22.2 (5.088/5.088). Update novo pode trazer chaves
novas (ficam em ingles, sem quebrar). Fluxo (detalhes no README do repo):
`tools/gap.mjs` (lista o que falta) -> traduzir `work/missing.json` em
`work/out_N.js` (subagentes em paralelo, lotes de ~200, funcao fica funcao,
plural com ternario) -> `tools/merge-gaps.mjs` -> `tools/build-plugin.mjs` ->
`tools/verify.mjs` (exigir faltando:0 e tipoDiferente:0) ->
`scripts/install-plugin.py` -> commit e push no repo.
Variaveis: HERMES_AGENT_DIR (checkout), REPO_DIR, WORK_DIR, GAPS_OUT (caminhos
Windows com `C:/...`, node nao entende `/tmp` do bash).

## Pegadinhas

- Funcao no pt onde o en agora e string (e vice-versa) quebra o texto: o verify
  acusa em `tipoDiferente`. Corrigir no `i18n/pt-BR.ts`.
- Funcoes validas que nao retornam string: `intro.custom` (lista) e
  `settings.vault.identifierShown` (devolve o argumento).
- 3 chaves do en.ts oficial com `***` corrompido foram reconstruidas por contexto.
