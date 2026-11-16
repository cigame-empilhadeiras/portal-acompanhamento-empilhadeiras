"""Gera checklist/index.html (o app do checklist para os tablets) a partir do index.html do portal,
e 3d/index.html (cópia dos modelos 3D para consulta, aberta pelo checklist) a partir de modelos3d/painel.html.

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


# ---------- cópia dos modelos 3D para consulta (fora do portal, sem login) ----------
tres = (RAIZ / "modelos3d" / "painel.html").read_text(encoding="utf-8")
ini = tres.find('<div class="links">')
fim = tres.find("</div>", ini) + len("</div>")
if ini < 0:
    sys.exit("gerar_checklist: não achei os links do painel 3D")
tres = tres[:ini] + (
    '<div class="links">\n'
    '    <a href="../checklist/" onclick="if(history.length>1&&document.referrer){history.back();return false}">← VOLTAR AO CHECKLIST</a>\n'
    '  </div>'
) + tres[fim:]
TROCAS_3D = [
    ("<title>Empilhadeira 3D · Blueprint + Vista explodida</title>",
     '<title>Modelos 3D · Consulta</title>\n<meta name="robots" content="noindex">\n<link rel="icon" type="image/png" href="../icons/favicon-32.png">'),
    ("loadModel();\ntick();",
     "{const q=new URLSearchParams(location.search),i=MODELS.findIndex(m=>m.id===q.get('m'));if(i>=0)state.mi=i;}\n"
     "loadModel();\n"
     "{const p=new URLSearchParams(location.search).get('p');if(p&&PARTS.some(x=>x.id===p)){select(p);setTimeout(()=>{const w=document.querySelector('.stagewrap');if(w)w.scrollIntoView({block:'start'})},300)}}\n"
     "tick();"),
]
for velho, novo in TROCAS_3D:
    n = tres.count(velho)
    if n != 1:
        sys.exit(f"gerar_checklist: esperava 1 ocorrência de {velho[:60]!r} no 3D, achei {n}")
    tres = tres.replace(velho, novo)
d3 = RAIZ / "3d" / "index.html"
d3.parent.mkdir(exist_ok=True)
d3.write_text(tres, encoding="utf-8")
print(f"3d/index.html gerado ({len(tres) // 1024} KB)")
