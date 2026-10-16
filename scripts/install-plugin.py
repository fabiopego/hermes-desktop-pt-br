#!/usr/bin/env python3
"""Instala o plugin Hermes Desktop em Portugues (pt-BR), TUDO automatico.

1. Copia plugin.js para <hermes home>/desktop-plugins/hermes-desktop-pt-br/
   SEM o arquivo .hermes-package.json: pasta com esse marcador entra DESLIGADA
   (opt-in) no app; sem ele o plugin entra LIGADO.
2. Define o idioma com o comando oficial: `hermes config set display.language pt`
   (o app aplica sozinho quando o plugin registra o idioma).

Nao precisa recompilar o app nem mexer no checkout do hermes-agent, entao
sobrevive ao `hermes update`. Se o Hermes Desktop ja estiver aberto, o plugin
carrega na hora (a pasta e monitorada); se a tela nao trocar, reabra o app.

Uso:  python scripts/install-plugin.py [--sem-idioma]
"""
import json, os, shutil, subprocess, sys
from pathlib import Path

root = Path(__file__).resolve().parent.parent
src = root / "plugin.js"
if not src.exists():
    sys.exit("plugin.js nao existe na raiz do repositorio (rode: node tools/build-plugin.mjs)")

home = Path(os.environ.get("HERMES_HOME") or Path(os.environ.get("LOCALAPPDATA", Path.home() / ".hermes")) / "hermes")
plugins = home / "desktop-plugins"
dest = plugins / "hermes-desktop-pt-br"

# limpa a pasta do nome antigo (mesmo plugin id) e qualquer marcador que deixaria o plugin desligado
legacy = plugins / "hermes-pt-br"
if legacy.is_dir():
    shutil.rmtree(legacy)
dest.mkdir(parents=True, exist_ok=True)
marker = dest / ".hermes-package.json"
if marker.exists():
    marker.unlink()
shutil.copy2(src, dest / "plugin.js")
version = json.loads((root / "package.json").read_text(encoding="utf-8"))["version"]
print(f"[1/2] plugin instalado e LIGADO por padrao em {dest} (v{version}, {src.stat().st_size // 1024} KB)")


def find_hermes():
    for cand in (shutil.which("hermes"), home / "hermes-agent" / ".hermes" / "bin" / "hermes.exe",
                 home / "hermes-agent" / "venv" / "Scripts" / "hermes.exe"):
        if cand and Path(cand).exists():
            return str(cand)
    return None


if "--sem-idioma" in sys.argv:
    print("[2/2] idioma: pulado (--sem-idioma)")
else:
    exe = find_hermes()
    if not exe:
        print("[2/2] AVISO: comando `hermes` nao encontrado. Rode manualmente: hermes config set display.language pt")
    else:
        r = subprocess.run([exe, "config", "set", "display.language", "pt"], capture_output=True, text=True)
        got = subprocess.run([exe, "config", "get", "display.language"], capture_output=True, text=True).stdout.strip()
        if r.returncode == 0 and got.endswith("pt"):
            print("[2/2] idioma definido: display.language = pt")
        else:
            print("[2/2] AVISO: nao consegui definir o idioma:", (r.stderr or r.stdout).strip()[:200])
            print("      Rode manualmente: hermes config set display.language pt")

print("\nPronto. Se o Hermes Desktop estiver aberto, a tela troca em instantes; se nao trocar, feche e abra o app.")
