# Fija título, autor, asunto, palabras clave e idioma del PDF (Chromium no permite autor).
import sys
from pypdf import PdfReader, PdfWriter
from pypdf.generic import NameObject, TextStringObject

path, lang = sys.argv[1], sys.argv[2]
meta = {
    'es': ('Rodrigo Negrete Aros - AI Product Designer - CV (ES)', 'CV de Rodrigo Negrete Aros, Product Designer UX/UI y AI Product Designer', 'AI Product Designer, UX/UI, Figma, design systems, IA generativa, automatización, n8n, Make'),
    'en': ('Rodrigo Negrete Aros - AI Product Designer - CV (EN)', 'Resume of Rodrigo Negrete Aros, UX/UI Product Designer and AI Product Designer', 'AI Product Designer, UX/UI, Figma, design systems, generative AI, automation, n8n, Make'),
}[lang]
w = PdfWriter(clone_from=PdfReader(path))
w.add_metadata({'/Title': meta[0], '/Author': 'Rodrigo Negrete Aros', '/Subject': meta[1], '/Keywords': meta[2]})
w._root_object[NameObject('/Lang')] = TextStringObject(lang)
with open(path, 'wb') as f:
    w.write(f)
