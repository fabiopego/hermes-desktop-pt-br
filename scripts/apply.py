#!/usr/bin/env python3
"""
Reaplica a traducao pt-BR do Hermes Desktop apos um `hermes update`.

O `hermes update` faz `git reset --hard origin/main` no checkout de
hermes-agent, o que apaga qualquer arquivo/edicao nao oficial (incluindo
este pt-BR.ts e os 3 arquivos de registro do idioma). Rode este script
sempre que voce atualizar o Hermes e quiser reaplicar a traducao.

Uso:
    python apply.py
    python apply.py --hermes-root "C:\\Users\\fabio\\AppData\\Local\\hermes\\hermes-agent"
"""
import argparse
import re
import shutil
import subprocess
import sys
from pathlib import Path

DEFAULT_HERMES_ROOT = Path.home() / "AppData" / "Local" / "hermes" / "hermes-agent"


def find_i18n_dir(hermes_root: Path) -> Path:
    i18n_dir = hermes_root / "apps" / "desktop" / "src" / "i18n"
    if not i18n_dir.is_dir():
        sys.exit(f"Nao encontrei {i18n_dir} -- verifique --hermes-root")
    return i18n_dir


def copy_ptbr(repo_root: Path, i18n_dir: Path) -> None:
    src = repo_root / "i18n" / "pt-BR.ts"
    dst = i18n_dir / "pt-BR.ts"
    shutil.copyfile(src, dst)
    print(f"copiado: {src} -> {dst}")


def patch_types(i18n_dir: Path) -> None:
    path = i18n_dir / "types.ts"
    text = path.read_text(encoding="utf-8")
    if "'pt-BR'" in text:
        print("types.ts: ja tem pt-BR, ok")
        return
    new_text, n = re.subn(
        r"export type Locale = ('[^']+'(?: \| '[^']+')*)",
        lambda m: f"export type Locale = {m.group(1)} | 'pt-BR'",
        text,
        count=1,
    )
    if n == 0:
        sys.exit("types.ts: nao encontrei a linha 'export type Locale = ...' -- edite manualmente")
    path.write_text(new_text, encoding="utf-8")
    print("types.ts: pt-BR adicionado ao union Locale")


def patch_languages(i18n_dir: Path) -> None:
    path = i18n_dir / "languages.ts"
    text = path.read_text(encoding="utf-8")
    if "id: 'pt-BR'" in text:
        print("languages.ts: ja tem entrada pt-BR, ok")
    else:
        # insere a entrada pt-BR antes do fechamento do array LOCALE_OPTIONS
        marker = "] as const satisfies readonly"
        idx = text.find(marker)
        if idx == -1:
            sys.exit("languages.ts: nao encontrei o fechamento de LOCALE_OPTIONS -- edite manualmente")
        # remove a virgula/quebra do item anterior e insere o novo bloco
        insert = (
            "  },\n"
            "  {\n"
            "    id: 'pt-BR',\n"
            "    name: 'Português (Brasil)',\n"
            "    englishName: 'Portuguese (Brazil)',\n"
            "    configValue: 'pt-BR'\n  }\n"
        )
        # localizar o ultimo '  }' antes do marker e substituir por insert
        before = text[:idx]
        last_close = before.rfind("  }\n")
        if last_close == -1:
            sys.exit("languages.ts: estrutura inesperada -- edite manualmente")
        text = text[:last_close] + insert + text[idx:]
        print("languages.ts: entrada pt-BR adicionada a LOCALE_OPTIONS")

    if "'pt-br': 'pt-BR'" not in text:
        marker2 = "\n}\n\nexport function isLocale"
        idx2 = text.find(marker2)
        if idx2 == -1:
            sys.exit("languages.ts: nao encontrei o fim de LOCALE_ALIASES -- edite manualmente")
        aliases = (
            ",\n  'pt-br': 'pt-BR',\n  pt_br: 'pt-BR',\n  'pt-pt': 'pt-BR',\n"
            "  pt_pt: 'pt-BR',\n  pt: 'pt-BR',\n  portuguese: 'pt-BR',\n"
            "  português: 'pt-BR',\n  portugues: 'pt-BR'"
        )
        text = text[:idx2] + aliases + text[idx2:]
        print("languages.ts: aliases pt-br/pt/português adicionados")

    path.write_text(text, encoding="utf-8")


def patch_catalog(i18n_dir: Path) -> None:
    path = i18n_dir / "catalog.ts"
    text = path.read_text(encoding="utf-8")
    if "ptBR" in text:
        print("catalog.ts: ja registra ptBR, ok")
        return
    text = text.replace(
        "import { ja } from './ja'\n",
        "import { ja } from './ja'\nimport { ptBR } from './pt-BR'\n",
    )
    text = re.sub(r"(\n\s*ru\n)}", r"\1  'pt-BR': ptBR\n}", text)
    if "ptBR" not in text:
        sys.exit("catalog.ts: nao consegui inserir automaticamente -- edite manualmente")
    path.write_text(text, encoding="utf-8")
    print("catalog.ts: ptBR importado e registrado em TRANSLATIONS")


def typecheck(hermes_root: Path) -> None:
    desktop_dir = hermes_root / "apps" / "desktop"
    print("\nRodando typecheck (pode levar 1-2 min)...")
    result = subprocess.run(
        ["npx", "tsc", "--noEmit", "-p", "tsconfig.json"],
        cwd=desktop_dir,
        capture_output=True,
        text=True,
        shell=True,
    )
    if result.returncode != 0:
        print(result.stdout[-4000:])
        print(result.stderr[-2000:])
        sys.exit("\nTypecheck falhou -- corrija os erros acima antes de compilar.")
    print("Typecheck OK — sem erros.")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--hermes-root", default=str(DEFAULT_HERMES_ROOT))
    parser.add_argument("--skip-typecheck", action="store_true")
    parser.add_argument("--skip-build", action="store_true")
    args = parser.parse_args()

    hermes_root = Path(args.hermes_root)
    repo_root = Path(__file__).resolve().parent.parent
    i18n_dir = find_i18n_dir(hermes_root)

    copy_ptbr(repo_root, i18n_dir)
    patch_types(i18n_dir)
    patch_languages(i18n_dir)
    patch_catalog(i18n_dir)

    if not args.skip_typecheck:
        typecheck(hermes_root)

    if not args.skip_build:
        print("\nCompilando o Hermes Desktop (hermes desktop --build-only --force-build)...")
        subprocess.run(["hermes", "desktop", "--build-only", "--force-build"], shell=True, check=False)

    print(
        "\nPronto. Feche e reabra o Hermes Desktop, depois va em "
        "Settings > Appearance > Language > Português (Brasil)."
    )


if __name__ == "__main__":
    main()
