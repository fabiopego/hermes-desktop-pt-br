#!/usr/bin/env python3
"""Lista textos do BACKEND do Hermes (modelos de automacao e sugestoes) que ainda NAO estao em
i18n/pt-BR.backend.js. Rode com o python do hermes-agent (venv), a partir da raiz deste repo:
  <hermes-agent>/venv/Scripts/python.exe tools/extract-backend.py <pasta do hermes-agent>
Saida: JSON com o que falta traduzir (acrescente em phrases/words e rode build + test-dom)."""
import json, re, sys
from pathlib import Path
agent = Path(sys.argv[1]); sys.path.insert(0, str(agent))
from cron.blueprint_catalog import list_blueprints, blueprint_form_schema
from cron.suggestion_catalog import CATALOG
src = (Path(__file__).parent.parent / "i18n/pt-BR.backend.js").read_text(encoding="utf-8")
skip = {"origin", "local", "telegram", "discord", "email", "15", "30", "60"}
items = []
for b in list_blueprints():
    f = blueprint_form_schema(b)
    items += [f["title"], f["description"]]
    for fl in f["fields"]:
        items += [fl["label"], fl["help"], *fl["options"]]
for e in CATALOG:
    items += [e.title, e.description]
missing = [x for x in dict.fromkeys(items) if isinstance(x, str) and x.strip() and x not in skip and not x.isdigit()
           and json.dumps(x, ensure_ascii=False)[1:-1] not in src and x.replace("'", "\'") not in src and x not in src]
print(json.dumps(missing, ensure_ascii=False, indent=1)); print(len(missing), "sem traducao", file=sys.stderr)
