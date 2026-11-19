"""
Comprehensive Project Design Report Generator (CSCR2600 Rubric 1)
Author: Devanshi Singh (Sole Student Author)
Course: CSCR2600 — Project Based Learning 1 (PBL-1)
Institution: Sharda University, School of Engineering & Technology, Department of CSE
Target: docs/academic/Expenzo_Project_Design_Report.docx & .pdf (~35-45 pages)
"""

import os
import sys
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, Image as RLImage, HRFlowable
)
from reportlab.pdfgen import canvas

BLACK_RGB = RGBColor(0, 0, 0)
FIGURES_DIR = os.path.abspath("docs/academic/figures")

# -------------------------------------------------------------
# XML Formatting Utilities for python-docx
# -------------------------------------------------------------
def set_cell_margins(cell, top=100, bottom=100, left=140, right=140):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def set_cell_shading(cell, color_hex):
    shading_elm = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{color_hex}"/>')
    cell._tc.get_or_add_tcPr().append(shading_elm)

def create_styled_document():
    doc = docx.Document()
    for section in doc.sections:
        section.page_width = Inches(8.27)   # A4
        section.page_height = Inches(11.69) # A4
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)

        # Header & Footer setup
        footer = section.footer
        p_ftr = footer.paragraphs[0]
        p_ftr.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        r_ftr = p_ftr.add_run("Sharda University • Department of CSE | CSCR2600 PBL-1")
        r_ftr.font.name = "Times New Roman"
        r_ftr.font.size = Pt(8.5)
        r_ftr.font.color.rgb = RGBColor(100, 116, 139)

    normal_style = doc.styles['Normal']
    normal_style.font.name = 'Times New Roman'
    normal_style.font.size = Pt(12)
    normal_style.font.color.rgb = BLACK_RGB

    return doc

def add_p(doc, text="", bold_prefix=None, italic_prefix=None, space_after=6, line_spacing=1.5, bullet=False, align=WD_ALIGN_PARAGRAPH.JUSTIFY):
    p = doc.add_paragraph(style='List Bullet' if bullet else 'Normal')
    p.alignment = align
    p.paragraph_format.space_after = Pt(space_after)
    p.paragraph_format.line_spacing = line_spacing

    if bold_prefix:
        r_b = p.add_run(bold_prefix)
        r_b.font.name = 'Times New Roman'
        r_b.font.bold = True
        r_b.font.color.rgb = BLACK_RGB
    if italic_prefix:
        r_i = p.add_run(italic_prefix)
        r_i.font.name = 'Times New Roman'
        r_i.font.italic = True
        r_i.font.color.rgb = BLACK_RGB
    if text:
        r_t = p.add_run(text)
        r_t.font.name = 'Times New Roman'
        r_t.font.color.rgb = BLACK_RGB
    return p

def add_heading(doc, text, level=1):
    p = doc.add_paragraph()
    p.paragraph_format.keep_with_next = True
    r = p.add_run(text)
    r.font.name = 'Times New Roman'
    r.font.bold = True
    r.font.color.rgb = BLACK_RGB

    if level == 1:
        r.font.size = Pt(15)
        p.paragraph_format.space_before = Pt(16)
        p.paragraph_format.space_after = Pt(6)
    elif level == 2:
        r.font.size = Pt(13)
        p.paragraph_format.space_before = Pt(12)
        p.paragraph_format.space_after = Pt(4)
    else:
        r.font.size = Pt(12)
        p.paragraph_format.space_before = Pt(8)
        p.paragraph_format.space_after = Pt(3)
    return p

def add_table(doc, headers, data, col_widths=None, caption=None):
    if caption:
        p_cap = doc.add_paragraph()
        p_cap.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p_cap.paragraph_format.space_before = Pt(8)
        p_cap.paragraph_format.space_after = Pt(3)
        p_cap.paragraph_format.keep_with_next = True
        r_cap = p_cap.add_run(caption)
        r_cap.font.name = 'Times New Roman'
        r_cap.font.bold = True
        r_cap.font.size = Pt(10.5)
        r_cap.font.color.rgb = BLACK_RGB

    table = doc.add_table(rows=len(data) + 1, cols=len(headers))
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False

    # Header Row
    hdr_cells = table.rows[0].cells
    for i, title in enumerate(headers):
        hdr_cells[i].text = title
        set_cell_shading(hdr_cells[i], 'F1F5F9')
        set_cell_margins(hdr_cells[i], top=100, bottom=100, left=120, right=120)
        p = hdr_cells[i].paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        for run in p.runs:
            run.font.name = 'Times New Roman'
            run.font.bold = True
            run.font.size = Pt(9.5)
            run.font.color.rgb = BLACK_RGB

    # Data Rows
    for r_idx, row in enumerate(data):
        row_cells = table.rows[r_idx + 1].cells
        bg_col = 'FFFFFF' if r_idx % 2 == 0 else 'F8FAFC'
        for c_idx, cell_val in enumerate(row):
            row_cells[c_idx].text = str(cell_val)
            set_cell_shading(row_cells[c_idx], bg_col)
            set_cell_margins(row_cells[c_idx], top=80, bottom=80, left=120, right=120)
            p = row_cells[c_idx].paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.LEFT
            for run in p.runs:
                run.font.name = 'Times New Roman'
                run.font.size = Pt(9.0)
                run.font.color.rgb = BLACK_RGB

    if col_widths:
        for row in table.rows:
            for idx, w in enumerate(col_widths):
                if idx < len(row.cells):
                    row.cells[idx].width = Inches(w)

    p_spc = doc.add_paragraph()
    p_spc.paragraph_format.space_after = Pt(6)
    return table

def add_figure(doc, img_rel_path, caption, width_in=6.0):
    full_path = os.path.join(FIGURES_DIR, img_rel_path) if not os.path.isabs(img_rel_path) else img_rel_path
    if os.path.exists(full_path):
        p_img = doc.add_paragraph()
        p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_img.paragraph_format.space_before = Pt(8)
        p_img.paragraph_format.space_after = Pt(3)
        run = p_img.add_run()
        run.add_picture(full_path, width=Inches(width_in))

        p_cap = doc.add_paragraph()
        p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_cap.paragraph_format.space_after = Pt(8)
        r_cap = p_cap.add_run(caption)
        r_cap.font.name = 'Times New Roman'
        r_cap.font.italic = True
        r_cap.font.bold = True
        r_cap.font.size = Pt(10)
        r_cap.font.color.rgb = BLACK_RGB
    else:
        add_p(doc, f"[Figure Missing: {img_rel_path}] - {caption}", italic_prefix="Note: ")

# -------------------------------------------------------------
# Numbered Canvas for ReportLab PDF
# -------------------------------------------------------------
class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_page_decorations(self, total_pages):
        self.saveState()
        self.setFont("Times-Roman", 8.5)
        self.setStrokeColor(colors.HexColor('#CBD5E1'))
        self.setLineWidth(0.5)

        # Header (Pages > 1)
        if self._pageNumber > 1:
            self.drawString(54, 792, "CSCR2600 — Project Based Learning 1 | Expenzo Project Design Report")
            self.line(54, 786, 541, 786)

        # Footer
        self.line(54, 45, 541, 45)
        self.drawString(54, 32, "Sharda University • School of Engineering & Technology • Department of CSE")
        page_str = f"Page {self._pageNumber} of {total_pages}"
        self.drawRightString(541, 32, page_str)
        self.restoreState()

print("Base document utilities initialized.")

