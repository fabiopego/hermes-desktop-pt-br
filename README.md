<p align="center">
  <img src="docs/img/banner.webp" alt="Hermes Desktop em Português — plugin não oficial" width="100%">
</p>

# Hermes Desktop em Português 🇧🇷

**A interface inteira do Hermes Desktop em português do Brasil. Um plugin. Um interruptor. E a tradução continua lá depois de cada atualização.**

> ⚠️ **Projeto da comunidade, não oficial.** Não é afiliado, mantido nem endossado pela Nous Research. O Hermes Desktop não tem português na interface (a PR [#38846](https://github.com/NousResearch/hermes-agent/pull/38846) foi fechada sem merge e a issue [#40239](https://github.com/NousResearch/hermes-agent/issues/40239) segue aberta). Este plugin preenche esse buraco enquanto isso.

---

## Por que existe

O Hermes é uma ferramenta incrível, mas a tela do app é toda em inglês. Se você configura, aprova comandos, ajusta notificações e explica o Hermes para outras pessoas em português, ler "Approval timeout" e "Reopen last chat on startup" o dia inteiro cansa e afasta quem não domina o idioma.

O que vem de fábrica em português cobre só o **terminal e as mensagens do agente**. A **tela do app** não.

Este plugin traduz a tela.

## O que você ganha

- **5.088 textos traduzidos**: Configurações, notificações, atalhos, voz, plugins, conectores, assistente, atualizações, primeiro uso. Medido contra o Hermes **0.22.2**, nenhum texto faltando (`node tools/verify.mjs`).
- **Português de produto, não de tradutor automático**: segue um glossário único (sessão, perfil, conector, skill...) e acentuação correta.
- **Plural certo**: "1 ferramenta desativada", "3 ferramentas desativadas". Frases com nome e número montadas do jeito brasileiro, não coladas.
- **Um só "Português" no seletor**: usa o mesmo idioma do backend (`pt`), então tela e mensagens do agente combinam.
- **Zero recompilação**: nada de `npm run build`, nada de mexer no código do app.

## Veja funcionando

Capturas reais do Hermes Desktop 0.22.2 com o plugin ligado.

**Configurações → Aparência → Idioma**

![Seletor de idioma em Português](docs/img/tela-idioma.webp)

**Notificações**

![Alertas do desktop em português](docs/img/tela-notificacoes.webp)

**Voz**

![Configurações de conversa por voz em português](docs/img/tela-voz.webp)

**Atalhos de teclado**

![Atalhos de teclado em português](docs/img/tela-atalhos.webp)

---

## Instalar em 2 minutos

### Opção A: pelo próprio app

1. No Hermes Desktop, abra **Recursos → Plugins → Instalar do Git**.
2. Cole `fabiopego/hermes-pt-br` e confirme.
3. Ligue o interruptor **Desktop** da linha **Português (Brasil)**.
4. **Configurações → Aparência → Idioma → Português**.

> A opção A usa o `plugin.js` na raiz deste repositório, que é o formato que o instalador do app procura. Ainda não foi testada pelo botão; a opção B é a que foi testada.

### Opção B: pelo terminal

```bash
git clone https://github.com/fabiopego/hermes-pt-br
cd hermes-pt-br
python scripts/install-plugin.py
```

Depois, os passos 3 e 4 acima.

### Por que preciso ligar o interruptor?

O Hermes instala plugins de disco **desligados**, por segurança. Um plugin não pode se ativar sozinho. É um clique, uma vez.

---

## 🛡️ Por que a tradução não some quando você atualiza

Esse é o ponto principal, e é o motivo desta versão existir.

**Como era (v1).** A primeira versão da tradução ficava **dentro do código do app**: um arquivo `pt-BR.ts` e três edições em arquivos do Hermes. Só que o `hermes update` roda `git reset --hard` nessa pasta, que devolve tudo ao estado oficial e **apaga o que não é do projeto**. Resultado: atualizou, voltou o inglês, e era preciso reaplicar e recompilar o app.

**Como é agora (v2).** A tradução virou um **plugin de desktop**, e plugin vive em outro lugar:

| | v1 (editava o app) | v2 (plugin) |
|---|---|---|
| Onde fica | dentro de `hermes-agent/apps/desktop/src` | na sua pasta de dados: `<hermes home>/desktop-plugins/hermes-pt-br` |
| O `hermes update` mexe? | **Sim**, `git reset --hard` apaga | **Não**, o update só atualiza o código do app |
| Precisa recompilar o app? | Sim | **Não**, é JavaScript puro carregado na hora |
| Como entra no app | editando arquivos internos | pela API de idioma do próprio Hermes (`registerAppLocale`) |
| Se o Hermes criar texto novo | pode quebrar | aparece em inglês até traduzir, **sem quebrar nada** |

Em uma frase: **o update troca o app, mas o plugin mora fora do app.** O Hermes carrega os plugins dessa pasta toda vez que abre.

Detalhe técnico para quem quiser conferir: o plugin só registra um catálogo de textos para o idioma `pt` por cima do catálogo em inglês. Onde faltar tradução, o app cai no inglês, nunca em tela em branco.

**Status honesto dos testes:** funciona no Hermes Desktop 0.22.2 no Windows e sobrevive a fechar e reabrir o app. Uma atualização real para uma versão *nova* ainda não foi observada; se algo mudar na API de plugins do Hermes, abra uma issue.

---

## Quando sair versão nova do Hermes

Textos novos aparecem em inglês até serem traduzidos. Para atualizar a tradução:

```bash
export HERMES_AGENT_DIR="$LOCALAPPDATA/hermes/hermes-agent"   # pasta do hermes-agent
export REPO_DIR="$PWD" WORK_DIR="$PWD/work" GAPS_OUT="$PWD/i18n/pt-BR.gaps.js"
node tools/gap.mjs          # lista o que falta (work/missing.json) e o que saiu (work/extra.json)
# traduza work/missing.json em work/out_N.js:  { id: 'texto' | (n) => `...` }
node tools/merge-gaps.mjs   # valida e gera i18n/pt-BR.gaps.js
node tools/build-plugin.mjs # gera plugin.js
node tools/verify.mjs       # precisa dar faltando:0 e tipoDiferente:0
python scripts/install-plugin.py
```

Precisa de `node` e do `esbuild` que já vem no checkout do hermes-agent.

## Como o repositório é organizado

| Caminho | O que é |
|---|---|
| `plugin.js` | O plugin pronto. É o que o app instala. |
| `i18n/pt-BR.ts` | Base da tradução (3.394 textos). |
| `i18n/pt-BR.gaps.js` | Textos adicionados para o 0.22.2 (1.826). |
| `i18n/pt-BR.obsolete.js` | Chaves antigas que saíram do inglês. |
| `tools/` | `gap`, `merge-gaps`, `build-plugin`, `verify`. |
| `scripts/install-plugin.py` | Instalador local. |
| `scripts/apply.py` | **Legado (v1).** Não funciona no 0.22. |

## Contribuir

Achou uma tradução estranha, termo inconsistente ou texto que ficou em inglês? Abra uma **issue** com um print, ou mande um pull request mexendo em `i18n/pt-BR.ts`. Sugestão de glossário também é bem-vinda: consistência vale mais que criatividade.

## Licença

[MIT](LICENSE). Use, copie e melhore à vontade.

---

<sub>Hermes é um projeto da Nous Research. Este repositório é independente e não tem vínculo com ela. A mascote "Nous Girl" que aparece no banner, em tamanho pequeno e só como referência, é arte de marca da Nous Research (criada por John Galt), usada aqui apenas para identificar o projeto ao qual o plugin se refere. Se a Nous Research preferir que seja removida, é só pedir.</sub>
