import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

BLACK_RGB = RGBColor(0, 0, 0)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
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

def create_docx_document():
    doc = docx.Document()
    for section in doc.sections:
        section.top_margin = Inches(0.8)
        section.bottom_margin = Inches(0.8)
        section.left_margin = Inches(0.8)
        section.right_margin = Inches(0.8)

    # Configure Normal Style
    normal_style = doc.styles['Normal']
    normal_style.font.name = 'Arial'
    normal_style.font.size = Pt(10)
    normal_style.font.color.rgb = BLACK_RGB

    # Configure Heading Styles (All strictly pure black)
    for h_name, pt_size in [('Heading 1', 14), ('Heading 2', 12), ('Heading 3', 11), ('Title', 18), ('Subtitle', 12)]:
        if h_name in doc.styles:
            st = doc.styles[h_name]
            st.font.name = 'Arial'
            st.font.size = Pt(pt_size)
            st.font.bold = True
            st.font.color.rgb = BLACK_RGB

    return doc

def add_docx_header(doc, title, subtitle=None, doc_category=None):
    if doc_category:
        p_cat = doc.add_paragraph()
        p_cat.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r_cat = p_cat.add_run(doc_category.upper())
        r_cat.font.size = Pt(9)
        r_cat.font.bold = True
        r_cat.font.color.rgb = BLACK_RGB
        p_cat.paragraph_format.space_after = Pt(2)

    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_title = p_title.add_run(title)
    r_title.font.size = Pt(18)
    r_title.font.bold = True
    r_title.font.color.rgb = BLACK_RGB
    p_title.paragraph_format.space_after = Pt(4)

    if subtitle:
        p_sub = doc.add_paragraph()
        p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r_sub = p_sub.add_run(subtitle)
        r_sub.font.size = Pt(11)
        r_sub.font.italic = True
        r_sub.font.color.rgb = BLACK_RGB
        p_sub.paragraph_format.space_after = Pt(12)

def add_docx_heading(doc, text, level=1):
    p = doc.add_paragraph()
    r = p.add_run(text)
    r.font.bold = True
    r.font.color.rgb = BLACK_RGB
    if level == 1:
        r.font.size = Pt(13)
        p.paragraph_format.space_before = Pt(12)
        p.paragraph_format.space_after = Pt(4)
    elif level == 2:
        r.font.size = Pt(11.5)
        p.paragraph_format.space_before = Pt(8)
        p.paragraph_format.space_after = Pt(3)
    else:
        r.font.size = Pt(10.5)
        p.paragraph_format.space_before = Pt(6)
        p.paragraph_format.space_after = Pt(2)
    return p

def add_docx_paragraph(doc, text, bold_prefix=None, space_after=4, bullet=False):
    p = doc.add_paragraph(style='List Bullet' if bullet else 'Normal')
    p.paragraph_format.space_after = Pt(space_after)
    p.paragraph_format.line_spacing = 1.15
    if bold_prefix:
        r_b = p.add_run(bold_prefix)
        r_b.font.bold = True
        r_b.font.color.rgb = BLACK_RGB
    r_t = p.add_run(text)
    r_t.font.color.rgb = BLACK_RGB
    return p

def add_docx_table(doc, headers, data, col_widths=None):
    table = doc.add_table(rows=len(data) + 1, cols=len(headers))
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False

    # Header Row
    hdr_cells = table.rows[0].cells
    for i, title in enumerate(headers):
        hdr_cells[i].text = title
        set_cell_shading(hdr_cells[i], 'F1F5F9')
        set_cell_margins(hdr_cells[i], top=120, bottom=120, left=140, right=140)
        p = hdr_cells[i].paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        for run in p.runs:
            run.font.bold = True
            run.font.size = Pt(9.5)
            run.font.color.rgb = BLACK_RGB

    # Data Rows
    for row_idx, row_data in enumerate(data):
        row_cells = table.rows[row_idx + 1].cells
        bg_color = 'FFFFFF' if row_idx % 2 == 0 else 'F8FAFC'
        for col_idx, cell_value in enumerate(row_data):
            row_cells[col_idx].text = str(cell_value)
            set_cell_shading(row_cells[col_idx], bg_color)
            set_cell_margins(row_cells[col_idx], top=100, bottom=100, left=140, right=140)
            p = row_cells[col_idx].paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.LEFT
            for run in p.runs:
                run.font.size = Pt(9)
                run.font.color.rgb = BLACK_RGB

    # Apply widths if provided
    if col_widths:
        for row in table.rows:
            for idx, w in enumerate(col_widths):
                if idx < len(row.cells):
                    row.cells[idx].width = Inches(w)

    doc.add_paragraph().paragraph_format.space_after = Pt(6)
    return table

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
            self.draw_header_footer(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_header_footer(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setStrokeColor(colors.HexColor('#CBD5E1'))
        self.setLineWidth(0.5)

        # Header (Pages > 1)
        if self._pageNumber > 1:
            self.drawString(54, 755, "Expenzo — CSCR2600 PBL-1 Academic Documentation")
            self.line(54, 750, 558, 750)

        # Footer
        self.line(54, 45, 558, 45)
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(558, 32, page_str)
        self.drawString(54, 32, "Confidential — Academic Review & Evaluation Deliverable")
        self.restoreState()

def get_reportlab_styles():
    styles = getSampleStyleSheet()

    # Modify / Add styles ensuring all headings and titles are pure black
    styles.add(ParagraphStyle(
        name='DocTitleBlack',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        alignment=1, # Center
        textColor=colors.black,
        spaceAfter=6
    ))

    styles.add(ParagraphStyle(
        name='DocSubTitleBlack',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=11,
        leading=14,
        alignment=1,
        textColor=colors.black,
        spaceAfter=14
    ))

    styles.add(ParagraphStyle(
        name='SectionHeading1Black',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=16,
        textColor=colors.black,
        spaceBefore=12,
        spaceAfter=4,
        keepWithNext=True
    ))

    styles.add(ParagraphStyle(
        name='SectionHeading2Black',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=14,
        textColor=colors.black,
        spaceBefore=8,
        spaceAfter=3,
        keepWithNext=True
    ))

    styles.add(ParagraphStyle(
        name='SectionHeading3Black',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=13,
        textColor=colors.black,
        spaceBefore=6,
        spaceAfter=2,
        keepWithNext=True
    ))

    styles.add(ParagraphStyle(
        name='BodyBlack',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13,
        textColor=colors.black,
        spaceAfter=5
    ))

    styles.add(ParagraphStyle(
        name='BulletBlack',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13,
        textColor=colors.black,
        leftIndent=15,
        firstLineIndent=-10,
        spaceAfter=3
    ))

    styles.add(ParagraphStyle(
        name='TableHeaderBlack',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.black,
        alignment=0
    ))

    styles.add(ParagraphStyle(
        name='TableCellBlack',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=10.5,
        textColor=colors.black,
        alignment=0
    ))

    styles.add(ParagraphStyle(
        name='InstitutionalHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=12,
        alignment=1,
        textColor=colors.black,
        spaceAfter=2
    ))

    return styles

def build_pdf_document(filepath, story):
    doc = SimpleDocTemplate(
        filepath,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )
    doc.build(story, canvasmaker=NumberedCanvas)
