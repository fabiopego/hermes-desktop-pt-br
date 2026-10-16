# Tradução pt-BR do Hermes Desktop (não-oficial)

O Hermes Desktop **não traz português na interface** (a PR upstream
[#38846](https://github.com/NousResearch/hermes-agent/pull/38846) foi fechada
sem merge; issue [#40239](https://github.com/NousResearch/hermes-agent/issues/40239)
segue aberta). O português que vem de fábrica cobre só o backend/terminal
(`locales/pt.yaml`), não a tela do app.

## v2: plugin de desktop (sobrevive ao `hermes update`)

Desde o Hermes 0.22 o idioma pode entrar por **plugin** em
`<hermes home>/desktop-plugins/`. Não mexe no código do app, não recompila e
o `hermes update` não apaga. Este repo gera esse plugin.

- Registra o idioma **`pt`** ("Português"), o mesmo id do backend, então a
  tela e as mensagens do agente ficam alinhadas.
- Cobertura medida contra o `en.ts` do **0.22.2**: **5.088 de 5.088** textos
  (`node tools/verify.mjs`).
- Plurais e `${nome}` funcionam (são funções JS, algo que YAML não permite).

### Instalar / reinstalar

```bash
git clone https://github.com/fabiopego/hermes-pt-br && cd hermes-pt-br
python scripts/install-plugin.py      # copia dist/plugin.js (já versionado)
```

Depois reabra o Hermes Desktop e vá em Settings > Appearance > Language >
Português. (Se quiser o backend também em português: `display.language: pt`.)

### Depois de um `hermes update` (textos novos em inglês)

```bash
export HERMES_AGENT_DIR="$LOCALAPPDATA/hermes/hermes-agent"   # checkout do hermes-agent
export REPO_DIR="$PWD" WORK_DIR="$PWD/work" GAPS_OUT="$PWD/i18n/pt-BR.gaps.js"
node tools/gap.mjs            # lista o que falta: work/missing.json (+ extra.json = obsoletas)
# traduzir work/missing.json -> work/out_N.js  ({ id: 'texto' | (n) => `...` })
node tools/merge-gaps.mjs     # valida e gera i18n/pt-BR.gaps.js
node tools/build-plugin.mjs   # gera dist/plugin.js
node tools/verify.mjs         # tem que dar faltando:0, tipoDiferente:0
python scripts/install-plugin.py
```

Arquivos: `i18n/pt-BR.ts` (base antiga), `i18n/pt-BR.gaps.js` (1.826 textos do
0.22.2), `i18n/pt-BR.obsolete.js` (132 chaves que saíram do inglês).
Requer `node` e o `esbuild` que já vem no checkout do hermes-agent.

## v1 (legado)

`scripts/apply.py` copiava o `pt-BR.ts` para dentro do app e recompilava.
**Não funciona no 0.22** (o registro de idiomas mudou) e era apagado a cada
update. Mantido só como histórico.
