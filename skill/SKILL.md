---
name: hermes-pt-br-i18n
description: Reaplica pt-BR do Hermes Desktop apos hermes update.
---

# Traducao pt-BR do Hermes Desktop (fork nao-oficial)

O Hermes Desktop nao tem portugues oficialmente (a PR upstream #38846 foi
fechada sem merge, issue #40239 segue aberta). Construimos uma traducao
completa (~850 strings) como fork local, versionada em:

**https://github.com/fabiopego/hermes-pt-br** (privado)

## Por que quebra a cada `hermes update`

`hermes update` roda `git reset --hard origin/main` no checkout de
`hermes-agent`, apagando qualquer arquivo/edicao que nao veio do upstream
oficial: `apps/desktop/src/i18n/pt-BR.ts` e as edicoes em `types.ts` /
`languages.ts` / `catalog.ts` que registram o idioma no seletor.

**Sintoma:** depois de atualizar o Hermes, a interface volta pra ingles e
"Portugues" some do dropdown de idioma em Settings > Appearance > Language.

## Como reaplicar (sempre que isso acontecer)

```bash
git clone https://github.com/fabiopego/hermes-pt-br "$env:TEMP\hermes-pt-br"
cd "$env:TEMP\hermes-pt-br"
python scripts/apply.py
```

O script copia `pt-BR.ts`, reaplica as 3 edicoes (idempotente, seguro
rodar 2x), roda `tsc --noEmit` pra confirmar que nada quebrou, e recompila
com `hermes desktop --build-only --force-build`. Termina com: feche e reabra
o Hermes Desktop, va em Settings > Appearance > Language > Portugues (Brasil).

Se ja tiver o repo clonado localmente, so `git pull` antes de rodar
`apply.py` pra garantir a versao mais recente da traducao.

## Quando NAO precisa disso

Se `hermes update` nao rodou `git reset --hard` (updates menores, sem
divergencia de historico), os arquivos podem ter sobrevivido -- confirme
abrindo Settings > Appearance > Language antes de rodar o script a toa.

## Se aparecerem strings novas em ingles apos um update

Normal: o arquivo usa `defineLocale()` com fallback automatico -- qualquer
chave nova do Hermes (feature adicionada no update) aparece em ingles ate
ser traduzida, sem quebrar o app. Para traduzir o que falta: comparar
`i18n/pt-BR.ts` do repo com o `en.ts` mais novo em
`apps/desktop/src/i18n/en.ts`, adicionar as chaves faltantes, commitar e dar
push no repo `hermes-pt-br`.

## Bugs conhecidos no en.ts oficial (nao sao nossos)

Tres chaves do arquivo-fonte oficial tem texto corrompido (`***` no lugar
de texto real): `openaiRejectedApiKey`, `providers.haveApiKey`,
`onboarding.haveApiKey`, `onboarding.pasteApiKey`. Reconstruidas por
contexto na traducao. Vale abrir issue no NousResearch/hermes-agent -- ainda
nao foi feito.
