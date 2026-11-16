"""Gera checklist/index.html (o app do checklist para os tablets) a partir do index.html do portal.

O app usa o mesmo código, o mesmo login e o mesmo banco do portal, mas abre só a tela do checklist,
para qualquer papel. Rode depois de mudar o index.html:  python3 tools/gerar_checklist.py
O fluxo de publicação do GitHub Pages também roda este script antes de publicar.
"""
import pathlib
import sys

RAIZ = pathlib.Path(__file__).resolve().parent.parent
src = (RAIZ / "index.html").read_text(encoding="utf-8")

TROCAS = [
    ("<title>Controle de Empilhadeiras e Gastos</title>", "<title>Checklist Empilhadeiras</title>"),
    ('href="portal.webmanifest"', 'href="checklist.webmanifest"'),
    ('<meta name="apple-mobile-web-app-title" content="Frota">', '<meta name="apple-mobile-web-app-title" content="Checklist">'),
    ('href="icons/favicon-32.png"', 'href="../icons/favicon-32.png"'),
    ('href="icons/apple-touch-icon.png"', 'href="../icons/apple-touch-icon.png"'),
    ('<script src="firebase-config.js"></script>', '<script src="../firebase-config.js"></script>'),
    ('<script src="fb-adapter.js"></script>', '<script src="../fb-adapter.js"></script>'),
    ('href=\\"app/checklist-empilhadeiras.apk\\"', 'href=\\"../app/checklist-empilhadeiras.apk\\"'),
    ("<script>window.APPMODE=", "<script>window.CHECKLIST_ONLY=true;window.APPMODE="),
]

out = src
for velho, novo in TROCAS:
    n = out.count(velho)
    if n != 1:
        sys.exit(f"gerar_checklist: esperava 1 ocorrência de {velho[:60]!r}, achei {n}")
    out = out.replace(velho, novo)

destino = RAIZ / "checklist" / "index.html"
destino.parent.mkdir(exist_ok=True)
destino.write_text(out, encoding="utf-8")
print(f"checklist/index.html gerado ({len(out) // 1024} KB)")
