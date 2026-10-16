#!/usr/bin/env python3
"""Instala dist/plugin.js como plugin de desktop do Hermes (idioma 'pt').

Nao precisa recompilar o app nem mexer no checkout do hermes-agent, entao
sobrevive ao `hermes update`. Depois: reabra o Hermes Desktop (ou recarregue
os plugins) e escolha Settings > Appearance > Language > Portugues.
"""
import json, os, shutil, sys
from pathlib import Path

root = Path(__file__).resolve().parent.parent
src = root / "dist" / "plugin.js"
if not src.exists():
    sys.exit("dist/plugin.js nao existe -- rode: node tools/build-plugin.mjs (ver README)")
home = Path(os.environ.get("HERMES_HOME") or Path(os.environ.get("LOCALAPPDATA", Path.home() / ".hermes")) / "hermes")
dest = home / "desktop-plugins" / "hermes-pt-br"
dest.mkdir(parents=True, exist_ok=True)
shutil.copy2(src, dest / "plugin.js")
version = json.loads((root / "package.json").read_text(encoding="utf-8"))["version"]
(dest / ".hermes-package.json").write_text(json.dumps({
    "package": "hermes-pt-br", "source": str(root), "version": version,
    "repo": "https://github.com/fabiopego/hermes-pt-br"}, indent=2), encoding="utf-8")
print(f"instalado em {dest} (v{version}, {src.stat().st_size} bytes)")
