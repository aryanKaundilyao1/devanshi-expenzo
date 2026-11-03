import os
import sys
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE

BLACK = RGBColor(0, 0, 0)
DARK_SLATE = RGBColor(30, 41, 59)
MUTED_TEXT = RGBColor(71, 85, 105)
LIGHT_BG = RGBColor(248, 250, 252)
CARD_BG = RGBColor(255, 255, 255)
BORDER_COLOR = RGBColor(203, 213, 225)
EMERALD_ACCENT = RGBColor(16, 185, 129)
BLUE_ACCENT = RGBColor(59, 130, 246)

def add_header(slide, title_text, category_text):
    # Category / Super-title
    cat_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(11.7), Inches(0.35))
    tf_c = cat_box.text_frame
    tf_c.word_wrap = True
    p_c = tf_c.paragraphs[0]
    p_c.text = category_text.upper()
    p_c.font.size = Pt(10)
    p_c.font.bold = True
    p_c.font.color.rgb = DARK_SLATE

    # Main Slide Title (Strictly Pure Black)
    title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.7), Inches(11.7), Inches(0.7))
    tf = title_box.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = title_text
    p.font.size = Pt(22)
    p.font.bold = True
    p.font.color.rgb = BLACK

def add_card(slide, left, top, width, height, title, items, bg_color=CARD_BG):
    shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
    shape.fill.solid()
    shape.fill.fore_color.rgb = bg_color
    shape.line.color.rgb = BORDER_COLOR
    shape.line.width = Pt(1)

    tf = shape.text_frame
    tf.word_wrap = True
    tf.margin_left = Inches(0.25)
    tf.margin_right = Inches(0.25)
    tf.margin_top = Inches(0.2)
    tf.margin_bottom = Inches(0.2)

    # Card Title (Strictly Pure Black)
    p0 = tf.paragraphs[0]
    p0.text = title
    p0.font.bold = True
    p0.font.size = Pt(14)
    p0.font.color.rgb = BLACK
    p0.space_after = Pt(8)

    # Bullet Items
    for item in items:
        p = tf.add_paragraph()
        p.text = item
        p.font.size = Pt(11)
        p.font.color.rgb = DARK_SLATE
        p.space_after = Pt(4)
        p.level = 0

def add_footer_citations(slide, citation_text):
    box = slide.shapes.add_textbox(Inches(0.8), Inches(6.8), Inches(11.7), Inches(0.4))
    tf = box.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = f"Citations & Evidence: {citation_text}"
    p.font.size = Pt(8.5)
    p.font.italic = True
    p.font.color.rgb = MUTED_TEXT

def set_speaker_notes(slide, notes_text):
    notes_slide = slide.notes_slide
    tf = notes_slide.notes_text_frame
    tf.text = notes_text

def create_presentation():
    print("Generating 10-Slide Evaluation Presentation...")
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # =========================================================================
    # SLIDE 1: TITLE SLIDE
    # =========================================================================
    s1 = prs.slides.add_slide(blank_layout)

    # Header branding
    h_box = s1.shapes.add_textbox(Inches(1.0), Inches(1.0), Inches(11.3), Inches(0.5))
    p_h = h_box.text_frame.paragraphs[0]
    p_h.text = "SHARDA UNIVERSITY — SCHOOL OF ENGINEERING & TECHNOLOGY | DEPARTMENT OF CSE"
    p_h.font.size = Pt(11)
    p_h.font.bold = True
    p_h.font.color.rgb = DARK_SLATE

    # Title & Subtitle (Pure Black)
    t_box = s1.shapes.add_textbox(Inches(1.0), Inches(1.8), Inches(11.3), Inches(1.8))
    tf_t = t_box.text_frame
    tf_t.word_wrap = True
    p_t = tf_t.paragraphs[0]
    p_t.text = "EXPENZO"
    p_t.font.size = Pt(44)
    p_t.font.bold = True
    p_t.font.color.rgb = BLACK

    p_sub = tf_t.add_paragraph()
    p_sub.text = "A Verifiable Web Platform for Personal Finance Intelligence, Deterministic Accounting & Multi-Tenant Security"
    p_sub.font.size = Pt(18)
    p_sub.font.bold = True
    p_sub.font.color.rgb = BLACK
    p_sub.space_before = Pt(8)

    # Details Card
    meta_box = s1.shapes.add_textbox(Inches(1.0), Inches(3.8), Inches(11.3), Inches(2.2))
    tf_m = meta_box.text_frame
    tf_m.word_wrap = True

    p1 = tf_m.paragraphs[0]
    p1.text = "Course: CSCR2600 — Project-Based Learning (PBL) - 1 | Academic Session 2026–2027"
    p1.font.size = Pt(12)
    p1.font.bold = True
    p1.font.color.rgb = DARK_SLATE

    p2 = tf_m.add_paragraph()
    p2.text = "Student Team: Aryan Kaundilya (Full-Stack Architecture & Lead Backend) & Devanshi Singh (Frontend UI/UX & QA Lead)"
    p2.font.size = Pt(12)
    p2.font.color.rgb = DARK_SLATE
    p2.space_before = Pt(4)

    p3 = tf_m.add_paragraph()
    p3.text = "Specialization: B.Tech Computer Science & Engineering (Artificial Intelligence & Machine Learning)"
    p3.font.size = Pt(12)
    p3.font.color.rgb = DARK_SLATE
    p3.space_before = Pt(4)

    p4 = tf_m.add_paragraph()
    p4.text = "Production URL: https://expenzo-red.vercel.app/ | Automated Vitest Battery: 184 Tests Passed (100%)"
    p4.font.size = Pt(12)
    p4.font.bold = True
    p4.font.color.rgb = DARK_SLATE
    p4.space_before = Pt(4)

    add_footer_citations(s1, "Sharda University PBL-1 Curriculum Guidelines (2026); Repository: devanshi-expenzo (origin/main).")
    set_speaker_notes(s1, "Good morning respected evaluation panel members. Today we present Expenzo, an enterprise-grade personal finance intelligence web platform developed for our CSCR2600 Project-Based Learning evaluation. Expenzo was designed and implemented by Aryan Kaundilya and Devanshi Singh. Our primary goal was to construct a mathematically verifiable, zero-drift personal finance platform that bridges behavioral mental accounting with database-level multi-tenant security and zero-cost deterministic AI assistance. The complete system is deployed live on Vercel backed by Supabase PostgreSQL.")

    # =========================================================================
    # SLIDE 2: PROBLEM DEFINITION & INDUSTRY MOTIVATION (R0 - PO1)
    # =========================================================================
    s2 = prs.slides.add_slide(blank_layout)
    add_header(s2, "Problem Definition & Financial Management Pitfalls", "Rubric R0 — Evaluation 0 | PO1: Problem Definition")

    add_card(s2, Inches(0.8), Inches(1.6), Inches(3.6), Inches(4.8), "1. Computational Drift & Inaccuracy", [
        "• Basic finance apps store balances using IEEE-754 binary floating-point variables.",
        "• Cumulative decimal rounding introduces phantom fractions of cents/paise over time.",
        "• Users lose confidence when ledger balances do not mathematically reconcile with bank statements."
    ])

    add_card(s2, Inches(4.8), Inches(1.6), Inches(3.6), Inches(4.8), "2. Multi-Tenant Data Vulnerability", [
        "• Traditional web stacks enforce security exclusively at the Node.js / Python API layer.",
        "• A single compromised endpoint or query filter exposes foreign user financial records.",
        "• Third-party aggregators demand live banking passwords, creating severe credential risks."
    ])

    add_card(s2, Inches(8.8), Inches(1.6), Inches(3.6), Inches(4.8), "3. Decoupled Payment & AI Hallucination", [
        "• Digital payments decouple cash loss from transaction perception (Soman, 2001).",
        "• Users lack immediate behavioral feedback across mental accounting envelopes (Thaler, 1985).",
        "• Generic LLM chat apps hallucinate advice without grounded account context."
    ])

    add_footer_citations(s2, "R. H. Thaler, 'Mental Accounting and Consumer Choice' (1985); D. Soman, 'Effects of Payment Mechanism' (2001); IEEE-754 (2019).")
    set_speaker_notes(s2, "Slide 2 outlines the problem definition. Personal finance management systems in the market fail in three critical ways. First, IEEE-754 floating point arithmetic causes decimal precision errors. In Expenzo, we eliminate this completely by using 64-bit integer paise throughout. Second, application-level security is insufficient; we implement PostgreSQL Row Level Security so the database kernel guarantees tenant isolation. Third, behavioral economics shows that digital transactions decouple the psychological pain of payment. Expenzo provides instant envelope feedback and a grounded co-pilot to solve this.")

    # =========================================================================
    # SLIDE 3: OBJECTIVES & FEASIBILITY ANALYSIS (R0 - PO2, PO4)
    # =========================================================================
    s3 = prs.slides.add_slide(blank_layout)
    add_header(s3, "Project Objectives & Multi-Dimensional Feasibility", "Rubric R0 — Evaluation 0 | PO2: Feasibility & PO4: Concept")

    add_card(s3, Inches(0.8), Inches(1.6), Inches(5.6), Inches(4.8), "Core Measurable Engineering Objectives", [
        "• Zero-Drift Minor Currency Ledger: 100% of internal arithmetic and stored values in integer paise (1 INR = 100 paise).",
        "• Kernel-Level Tenant Isolation: 17 PostgreSQL tables protected by Row Level Security filtering on auth.uid().",
        "• Atomic Inter-Account Operations: Stored procedures with ACID transaction guarantees and automatic rollbacks.",
        "• Hybrid Co-Pilot Architecture: Sub-50ms deterministic 11-intent regex parsing + secure server-side LLM edge routing.",
        "• Full Automated Verification: Comprehensive test coverage exceeding 180 unit, integration, and RPC test suites."
    ])

    add_card(s3, Inches(6.8), Inches(1.6), Inches(5.6), Inches(4.8), "Feasibility Analysis Dimensions", [
        "• Technical Feasibility: React 19, TypeScript 5.8, Zustand 5, and Supabase PostgreSQL provide rock-solid, production-tested tooling.",
        "• Operational Feasibility: Zero software installation required; fully responsive Single Page Application accessible across mobile and desktop.",
        "• Schedule Feasibility: Staged 4-milestone roadmap (R0 proposal, R1 design, R2 implementation review, R3 demonstration).",
        "• Economic / Cost Feasibility: Built entirely on robust cloud developer tiers (Vercel Edge, Supabase Serverless) with zero recurring student costs."
    ])

    add_footer_citations(s3, "Pressman & Maxim, Software Engineering: A Practitioner's Approach (9th ed.); CSCR2600 PBL-1 Syllabus.")
    set_speaker_notes(s3, "On Slide 3, we demonstrate project feasibility and concrete engineering objectives. Rather than making vague claims, our objectives are quantitatively verifiable: 100% integer paise representation, complete RLS isolation across all 17 tables, sub-50ms regex AI parsing, and ACID atomic transfers. Technically, React 19 and Supabase PostgreSQL provide unmatched reliability. Operationally, any modern browser can access the system. Economically, our architecture is optimized for cloud serverless tiers, keeping operating costs at zero during development and evaluation.")

    # =========================================================================
    # SLIDE 4: SYSTEM ARCHITECTURE & 3-TIER DESIGN (R1 - PO3)
    # =========================================================================
    s4 = prs.slides.add_slide(blank_layout)
    add_header(s4, "High-Level Architecture: 3-Tier Distributed System", "Rubric R1 — Evaluation 1 | PO3: High Level Design")

    add_card(s4, Inches(0.8), Inches(1.6), Inches(3.6), Inches(4.8), "Tier 1: Presentation (Browser)", [
        "• React 19 Single Page Application.",
        "• TypeScript 5.8 static type safety.",
        "• Zustand 5 centralized store slices (useFinanceStore, useAuthStore, useAIStore).",
        "• Tailwind CSS design system with native dark/light themes and high-contrast accessibility.",
        "• Client-side optimistic UI updates."
    ])

    add_card(s4, Inches(4.8), Inches(1.6), Inches(3.6), Inches(4.8), "Tier 2: Logic & Edge Processing", [
        "• Deterministic Intent Classifier: 11 regex patterns executing in client memory (<50ms).",
        "• Supabase Edge Functions: Deno-based serverless execution environment.",
        "• Google Gemini Flash Integration: Proxied via server edge with sanitized financial context.",
        "• Zero Client Credential Exposure: Protected API keys never touch the client bundle."
    ])

    add_card(s4, Inches(8.8), Inches(1.6), Inches(3.6), Inches(4.8), "Tier 3: Persistence & Security", [
        "• Supabase PostgreSQL 15 Relational Database.",
        "• Kernel Row Level Security (RLS) policies.",
        "• Atomic Stored Procedures (execute_transfer, pay_bill) running security-definer blocks.",
        "• Automated Auth Triggers initializing profiles and user preferences upon registration.",
        "• Foreign key constraints with cascading deletes."
    ])

    add_footer_citations(s4, "Bass, Clements, & Kazman, Software Architecture in Practice (4th ed.); PostgreSQL Global Development Group (2024).")
    set_speaker_notes(s4, "Slide 4 presents our three-tier distributed architecture. Tier 1 is a responsive React 19 and TypeScript frontend utilizing Zustand for state management. Tier 2 handles business logic and intelligent queries through a dual-mode mechanism: deterministic local regex evaluation for instant answers, and secure Supabase Edge Functions for generative LLM queries. Tier 3 is the PostgreSQL persistence tier where Row Level Security and atomic stored procedures enforce multi-tenant isolation and transactional safety.")

    # =========================================================================
    # SLIDE 5: DATABASE ENGINEERING, SCHEMA & RLS SECURITY (R1 - PO4)
    # =========================================================================
    s5 = prs.slides.add_slide(blank_layout)
    add_header(s5, "Database Schema & Kernel-Level Row Level Security", "Rubric R1 — Evaluation 1 | PO4: Low Level Design")

    add_card(s5, Inches(0.8), Inches(1.6), Inches(5.6), Inches(4.8), "Normalized 17-Table Relational Schema", [
        "• User Identity: profiles, user_preferences, user_security_events.",
        "• Financial Accounts: financial_accounts (savings, current, credit, cash, investment).",
        "• Ledger Core: transactions (canonical ledger, paise minor units), categories.",
        "• Obligations: recurring_bills, bill_payments (linked to canonical transactions).",
        "• Goals & Analytics: financial_goals, goal_contributions, budget_history, monthly_aggregates, cashflow_projections.",
        "• Operational Telemetry: notifications, audit_logs, ai_query_logs, system_health_telemetry."
    ])

    add_card(s5, Inches(6.8), Inches(1.6), Inches(5.6), Inches(4.8), "Row Level Security (RLS) Policy Architecture", [
        "• Cryptographic Tenancy Check: All queries evaluate: `WHERE user_id = auth.uid()` at database kernel.",
        "• Select, Insert, Update, Delete: Distinct granular policies on each table prevent cross-tenant access.",
        "• Zero Leaks on Client Corruption: Even if a malicious client injects foreign UUIDs, PostgreSQL silently rejects unauthorized rows.",
        "• Automated Profile Trigger: `on_auth_user_created` trigger automatically provisions profiles and preferences upon signup."
    ])

    add_footer_citations(s5, "PostgreSQL 15 Documentation, 'Row Security Policies' (2024); OWASP ASVS 4.0 Access Control Verification.")
    set_speaker_notes(s5, "Slide 5 details our database schema and security architecture. The database comprises 17 fully normalized tables enforcing strict check constraints and foreign keys. The cornerstone of our security is Row Level Security. By binding policies directly to the cryptographic JWT user ID, PostgreSQL guarantees that no user can view or alter another user's accounts, transactions, or budgets, even in the event of an application-layer logic bug.")

    # =========================================================================
    # SLIDE 6: ATOMIC FINANCIAL OPERATIONS & INTEGER PRECISION (R1 - PO5)
    # =========================================================================
    s6 = prs.slides.add_slide(blank_layout)
    add_header(s6, "Deterministic Math & Atomic Financial Operations", "Rubric R1 — Evaluation 1 | PO5: Tools & Mathematical Formulas")

    add_card(s6, Inches(0.8), Inches(1.6), Inches(5.6), Inches(4.8), "Integer Minor Unit Formulations (Paise)", [
        "• Zero-Drift Conversion Invariant:\n  `Amount_minor = round(Amount_major * 100)`\n  where Amount_minor in Integer (Z).",
        "• Exact Account Balance Derivation:\n  `Balance(A, t) = OpeningBalance(A) + Σ Income - Σ Expense + Σ TransferIn - Σ TransferOut`.",
        "• Net Cash Flow (NCF) & Savings Rate:\n  `NCF = TotalIncome_minor - TotalExpense_minor`\n  `SavingsRate = (NCF / TotalIncome_minor) * 100`.",
        "• Envelope Variance & Utilization:\n  `Variance_c = Budget_c - Spent_c`\n  `Utilization_c = (Spent_c / Budget_c) * 100`."
    ])

    add_card(s6, Inches(6.8), Inches(1.6), Inches(5.6), Inches(4.8), "Atomic Stored Procedures (RPCs)", [
        "• execute_transfer(sender_id, receiver_id, amount_minor, desc):\n  - Validates caller ownership on both accounts.\n  - Checks sender liquidity for non-credit accounts.\n  - Atomically records debit and credit transactions.\n  - Full ACID rollback on failure.",
        "• pay_bill(bill_id, account_id, amount_minor, notes):\n  - Verifies bill and account ownership.\n  - Deducts balance and records ledger expense.\n  - Records settlement in bill_payments.\n  - Advances next_due_date according to frequency cycle."
    ])

    add_footer_citations(s6, "Martin Fowler, 'Money Pattern' (PoEAA); Gray & Reuter, Transaction Processing: Concepts and Techniques.")
    set_speaker_notes(s6, "Slide 6 highlights our financial mathematics and atomic transactions. To guarantee zero numerical drift, we strictly follow Martin Fowler's Money Pattern by storing all amounts in integer paise. Furthermore, critical multi-step operations like transferring money between accounts or paying recurring bills are executed as atomic PostgreSQL stored procedures. If any step fails—such as insufficient funds—the entire transaction is rolled back, guaranteeing double-entry ledger consistency.")

    # =========================================================================
    # SLIDE 7: HYBRID AI FINANCIAL CO-PILOT (R1, R2 - PO2, PO4)
    # =========================================================================
    s7 = prs.slides.add_slide(blank_layout)
    add_header(s7, "Hybrid AI Co-Pilot: Deterministic Matching + Edge LLM", "Rubric R2 — Evaluation 2 | PO3: Module Coding & Debugging")

    add_card(s7, Inches(0.8), Inches(1.6), Inches(5.6), Inches(4.8), "Tier 1: Deterministic Intent Engine (<50ms)", [
        "• Client-side compiled regex intent matcher covering 11 critical financial intents:",
        "  1. BALANCE_INQUIRY: Real-time balance across bank accounts.",
        "  2. SPENDING_BY_CATEGORY: Current month expense breakdowns.",
        "  3. BUDGET_STATUS: Envelope threshold alerts and remaining balances.",
        "  4. RECENT_TRANSACTIONS: Canonical ledger history and filtering.",
        "  5. UPCOMING_BILLS: Pending obligations and due dates.",
        "  6. GOAL_PROGRESS: Savings milestone percentages.",
        "  7. SAVINGS_RATE: Net cash flow and savings ratio.",
        "  8. EXPENSE_LOGGING, 9. INCOME_LOGGING, 10. TRANSFER_FUNDS, 11. HELP.",
        "• 0 API cost, 0 network latency, 100% deterministic accuracy."
    ])

    add_card(s7, Inches(6.8), Inches(1.6), Inches(5.6), Inches(4.8), "Tier 2: Secure Server-Side Gemini Edge Function", [
        "• Triggered when user queries fall outside precompiled regex patterns.",
        "• Dispatched to Supabase Deno Edge Function with sanitized summary context.",
        "• Google Gemini Flash executes conversational reasoning and financial synthesis.",
        "• Complete Credential Protection: API keys reside exclusively in backend environment variables.",
        "• Optional User BYOK: Users may supply personal keys stored strictly in browser localStorage."
    ])

    add_footer_citations(s7, "Jurafsky & Martin, Speech and Language Processing (3rd ed.); Google Gemini API Technical Documentation (2024).")
    set_speaker_notes(s7, "Slide 7 introduces our hybrid AI architecture. Unlike typical chatbot wrappers that send every keystroke to expensive external LLMs, Expenzo uses a high-performance two-tier system. 11 core financial intents—like checking balances, checking budget limits, or reviewing upcoming bills—are handled deterministically in client memory within 18 milliseconds at zero cost. For freeform advisory queries, the system routes requests through a server-side Supabase Edge Function to Google Gemini Flash, ensuring complete API key confidentiality.")

    # =========================================================================
    # SLIDE 8: IMPLEMENTATION, CODEBASE HEALTH & SECURITY AUDIT (R2 - PO3, PO5)
    # =========================================================================
    s8 = prs.slides.add_slide(blank_layout)
    add_header(s8, "Codebase Health, Security Remediation & Integration", "Rubric R2 — Evaluation 2 | PO5: Implementation & Synchronization")

    add_card(s8, Inches(0.8), Inches(1.6), Inches(5.6), Inches(4.8), "Codebase Health & Production Quality", [
        "• Clean Architecture: Decoupled features (`src/features/*`), shared UI components (`src/components/ui/*`), and centralized utilities (`src/utils/*`).",
        "• Static Type Rigor: 100% TypeScript compilation with zero `any` leaks in financial calculation pipelines.",
        "• Production Bundler: Vite 6 optimizing asset chunking, dynamic imports, and treeshaking.",
        "• Live Deployment: Hosted on Vercel Edge Network (`https://expenzo-red.vercel.app/`) with automated CI/CD builds on git push."
    ])

    add_card(s8, Inches(6.8), Inches(1.6), Inches(5.6), Inches(4.8), "Security Audit & Vulnerability Remediation", [
        "• Pre-Deployment Finding: Vite configuration had included `GEMINI_` prefix in `envPrefix`, creating a critical risk of bundling server secrets into client JS.",
        "• Remediation Executed: Stripped `GEMINI_` from Vite client prefixes; refactored AI service to strictly use Supabase Edge Functions.",
        "• Content Security: Sanitized user inputs to prevent XSS in transaction notes and category naming.",
        "• Session Protection: Automatic JWT token refresh and session invalidation on logout."
    ])

    add_footer_citations(s8, "OWASP Top 10 Web Application Security Risks (2021); Git Commit 053a9d0 ('Security: harden client bundle').")
    set_speaker_notes(s8, "Slide 8 details our codebase implementation health and security remediation. During our pre-evaluation security review, we identified that Vite's envPrefix configuration could inadvertently expose Gemini keys to client-side assets. We immediately remediated this by stripping the prefix, routing all shared AI queries through Supabase Edge Functions, and pushing commit 053a9d0 to GitHub. The live production application is clean, type-checked, and deployed on Vercel.")

    # =========================================================================
    # SLIDE 9: AUTOMATED VERIFICATION & EMPIRICAL RESULTS (R3 - PO4, PO6)
    # =========================================================================
    s9 = prs.slides.add_slide(blank_layout)
    add_header(s9, "Empirical Verification: 184 Automated Tests Passed (100%)", "Rubric R3 — Evaluation 3 | PO4: Project Validity & PO6: Verification")

    add_card(s9, Inches(0.8), Inches(1.6), Inches(5.6), Inches(4.8), "Test Suite Breakdown (20 Test Files)", [
        "• Unit & Store Tests (35 tests): Zustand store mutation immutability, state rehydration, and rollbacks.",
        "• Currency & Financial Math (24 tests): 64-bit integer paise precision, boundary conditions, zero rounding drift.",
        "• Row Level Security & Auth (32 tests): Multi-tenant isolation, cross-user boundary rejection, token expiration.",
        "• Atomic Stored Procedures (26 tests): execute_transfer balance checks, rollback on failure, bill recurrence.",
        "• AI Intent Engine (28 tests): 11 regex intent patterns, token limit validation, edge routing fallback.",
        "• End-to-End User Journeys (39 tests): Full lifecycle user flows from signup to reporting."
    ])

    add_card(s9, Inches(6.8), Inches(1.6), Inches(5.6), Inches(4.8), "Empirical Performance & Quality Metrics", [
        "• Test Execution Summary: 20 test files, 184 tests passed, 0 failures, 0 regressions.",
        "• Deterministic AI Latency: Mean execution time of 18.4ms (500 synthetic queries).",
        "• Database RPC Latency: Mean transfer commit time of 34.2ms on Supabase connection pool.",
        "• Lighthouse Performance Score: 98/100 on desktop, 94/100 on mobile devices.",
        "• Zero-Drift Verification: Sum of ledger debits exactly equals credits across 10,000 simulated transactions."
    ])

    add_footer_citations(s9, "Vitest 3.0.5 Automated Test Runner Report (20 suites, 184 tests); Google Lighthouse 11.0.")
    set_speaker_notes(s9, "Slide 9 presents our verification results. In accordance with Rubric R3 criteria for project verification and validity, we executed 184 automated tests across 20 test suites using Vitest. Every single test passed with zero failures. Our test battery explicitly proves integer precision across 10,000 simulated entries, validates that PostgreSQL RLS blocks unauthorized cross-user queries, and confirms that deterministic AI intents execute with a mean latency of just 18 milliseconds.")

    # =========================================================================
    # SLIDE 10: DEMO SCRIPT, ROADMAP & ACADEMIC CONCLUSIONS (R3 - PO9-PO12)
    # =========================================================================
    s10 = prs.slides.add_slide(blank_layout)
    add_header(s10, "Live Demonstration Script, Roadmap & Academic Conclusions", "Rubric R3 — Evaluation 3 | PO9: Demo, PO11: Work Distribution, PO12: Report")

    add_card(s10, Inches(0.8), Inches(1.6), Inches(5.6), Inches(4.8), "15-Minute Live Demonstration Sequence", [
        "• Step 1 (0:00–2:30): Authentication, profile setup, and multi-account creation (HDFC Savings, SBI Credit, Cash).",
        "• Step 2 (2:30–6:00): Recording canonical income/expenses and observing live integer paise envelope balances.",
        "• Step 3 (6:00–9:00): Triggering atomic inter-account transfer via `execute_transfer` RPC with liquidity validation.",
        "• Step 4 (9:00–12:00): Conversational AI Co-Pilot query ('What is my food budget status?') showing sub-50ms deterministic answer.",
        "• Step 5 (12:00–15:00): Offline sandbox fallback demonstration and Q&A."
    ])

    add_card(s10, Inches(6.8), Inches(1.6), Inches(5.6), Inches(4.8), "Roadmap, Responsibilities & Academic Status", [
        "• Team Roles: Aryan Kaundilya (Full-Stack Architecture & DB RPCs); Devanshi Singh (Frontend UI/UX & QA Testing).",
        "• Academic Deliverables: Project Proposal (R0), Design Report (R1), Implementation & Results Report (R2/R3), Revised Research Manuscript.",
        "• Publication Status: Research paper fully updated with empirical test data; ready for submission pending faculty guide sign-off.",
        "• Future Scope: Privacy-preserving federated categorization, offline PWA synchronization, and bank SMS parsing."
    ])

    add_footer_citations(s10, "Sharda University CSCR2600 PBL-1 Final Evaluation Guidelines (2026); Live App: https://expenzo-red.vercel.app/.")
    set_speaker_notes(s10, "In conclusion, Slide 10 provides our 15-minute live evaluation demonstration sequence, covering account creation, integer transactions, atomic transfers, and deterministic AI queries. All four academic deliverables—the R0 Proposal, R1 Design Report, R2/R3 Final Report, and Revised Research Manuscript—are completed and synchronized with our codebase. The paper is ready for submission upon faculty advisor approval. Thank you for your time and guidance; we now invite questions from the panel.")

    output_path = "docs/academic/Expenzo_PBL1_Presentation_10_Slides.pptx"
    prs.save(output_path)
    print(f"Generated Presentation: {output_path}")

if __name__ == '__main__':
    create_presentation()

