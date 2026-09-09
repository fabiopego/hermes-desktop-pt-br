# Tradução pt-BR do Hermes Desktop (não-oficial)

Este repositório guarda a tradução completa (pt-BR) da interface do Hermes
Desktop (Electron/React) — cerca de 850 strings — porque o suporte oficial a
Português foi proposto (PR
[#38846](https://github.com/NousResearch/hermes-agent/pull/38846)) mas **foi
fechado sem merge**. A issue pedindo pt-BR
([#40239](https://github.com/NousResearch/hermes-agent/issues/40239)) segue
aberta sem solução.

## Por que isso quebra a cada `hermes update`

O comando `hermes update` roda `git reset --hard origin/main` no checkout
local do `hermes-agent`. Isso apaga qualquer arquivo/edição que não veio do
upstream oficial — incluindo:

- `apps/desktop/src/i18n/pt-BR.ts` (o arquivo de tradução em si)
- as edições em `types.ts`, `languages.ts`, `catalog.ts` que registram o
  idioma no seletor

Ou seja: **toda vez que você atualizar o Hermes, a tradução some** e a
interface volta para inglês (mesmo que a config interna ainda esteja com
`pt-BR` selecionado — o app só não vai encontrar o arquivo).

## Como reaplicar depois de um update

```bash
python scripts/apply.py
```

O script:
1. Copia `i18n/pt-BR.ts` deste repo para dentro do checkout do Hermes
2. Reaplica as 3 edições em `types.ts` / `languages.ts` / `catalog.ts`
   (idempotente — pode rodar de novo sem duplicar nada)
3. Roda o typecheck do TypeScript (`tsc --noEmit`) para confirmar que nada
   quebrou
4. Recompila o app (`hermes desktop --build-only --force-build`)

Por padrão ele assume o Hermes instalado em
`%LOCALAPPDATA%\hermes\hermes-agent`. Para outro caminho:

```bash
python scripts/apply.py --hermes-root "C:\caminho\outro"
```

Depois de rodar, **feche e reabra o Hermes Desktop** e vá em
`Settings > Appearance > Language > Português (Brasil)`.

## Passo a passo manual (se o script falhar)

1. Copie `i18n/pt-BR.ts` para
   `apps/desktop/src/i18n/pt-BR.ts` no checkout do Hermes.
2. Em `apps/desktop/src/i18n/types.ts`, adicione `'pt-BR'` à união `Locale`:
   ```ts
   export type Locale = 'en' | 'zh' | 'zh-hant' | 'ja' | 'ar' | 'ru' | 'pt-BR'
   ```
3. Em `apps/desktop/src/i18n/languages.ts`:
   - adicione uma entrada em `LOCALE_OPTIONS`:
     ```ts
     {
       id: 'pt-BR',
       name: 'Português (Brasil)',
       englishName: 'Portuguese (Brazil)',
       configValue: 'pt-BR'
     }
     ```
   - adicione aliases em `LOCALE_ALIASES`:
     ```ts
     'pt-br': 'pt-BR',
     pt_br: 'pt-BR',
     'pt-pt': 'pt-BR',
     pt_pt: 'pt-BR',
     pt: 'pt-BR',
     portuguese: 'pt-BR',
     português: 'pt-BR',
     portugues: 'pt-BR'
     ```
4. Em `apps/desktop/src/i18n/catalog.ts`, importe e registre:
   ```ts
   import { ptBR } from './pt-BR'
   // ...
   export const TRANSLATIONS: Record<Locale, Translations> = {
     en, zh, 'zh-hant': zhHant, ja, ar, ru,
     'pt-BR': ptBR
   }
   ```
5. Rode o typecheck: `cd apps/desktop && npx tsc --noEmit -p tsconfig.json`
6. Recompile: `hermes desktop --build-only --force-build`
7. Feche e reabra o app.

## Skill do Hermes (`hermes-pt-br-i18n`)

Este repo também guarda a skill que documenta esse fluxo pra qualquer sessão
do Hermes lembrar sozinha (`skill/SKILL.md`). Para reinstalar em outra
máquina/perfil:

```bash
mkdir -p "%LOCALAPPDATA%\hermes\skills\hermes-pt-br-i18n"
copy skill\SKILL.md "%LOCALAPPDATA%\hermes\skills\hermes-pt-br-i18n\SKILL.md"
```

Se editar a skill via `skill_manage` no Hermes, copie o `SKILL.md`
atualizado de volta pra cá (`skill/SKILL.md`) e dê commit/push.

## Estrutura do arquivo de tradução

`i18n/pt-BR.ts` usa o mecanismo `defineLocale()` do próprio Hermes: qualquer
string que faltar (ex.: uma nova feature adicionada em uma atualização e
ainda não traduzida) cai automaticamente no fallback em inglês — não quebra
o app, só aparece em inglês até a próxima tradução.

## Bugs encontrados no arquivo original (`en.ts`) durante a tradução

Três chaves do arquivo-fonte oficial em inglês tinham texto corrompido
(`***` no lugar do texto real) — bug pré-existente do upstream, não
introduzido por esta tradução:

- `openaiRejectedApiKey`
- `providers.haveApiKey`
- `onboarding.haveApiKey`
- `onboarding.pasteApiKey`

Reconstruí o texto certo por contexto (comparando com a string irmã
`openaiRejectedApiKeyWithStatus` e o nome da chave) ao traduzir. Vale reportar
isso como issue separada no `NousResearch/hermes-agent` — não fiz isso ainda.

## Manutenção

Quando o Hermes adicionar novas strings de interface (após um update), rode
o typecheck (`npx tsc --noEmit -p tsconfig.json`) dentro de
`apps/desktop` — qualquer chave nova aparece como erro de tipo apontando pro
`pt-BR.ts` só se você tentar torná-lo `Translations` completo (não é o caso
aqui, que usa `defineLocale()` com fallback). Para saber o que ainda falta
traduzir, compare `i18n/pt-BR.ts` deste repo com o `en.ts` mais recente do
Hermes.
