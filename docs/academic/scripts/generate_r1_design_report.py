import os
import sys
sys.path.append(os.path.dirname(__file__))

from doc_builder_utils import (
    create_docx_document, add_docx_header, add_docx_heading, add_docx_paragraph, add_docx_table,
    get_reportlab_styles, build_pdf_document, Paragraph, Spacer, Table, TableStyle, colors, KeepTogether, PageBreak
)

def build_r1_design_report():
    print("Building R1 Consolidated Design Report...")

    # =========================================================
    # 1. BUILD DOCX
    # =========================================================
    doc = create_docx_document()

    add_docx_header(
        doc,
        title="Consolidated System Design Report: Expenzo",
        subtitle="Detailed Architecture, Database Schema, Mathematical Formulations, and Traceability Matrix",
        doc_category="Sharda University — School of Engineering and Technology | Department of Computer Science & Engineering | CSCR2600 PBL-1 (Evaluation #R1)"
    )

    add_docx_paragraph(
        doc,
        "CSCR2600 — Project-Based Learning (PBL) - 1 | Design Approval Evaluation (Rubric #R1) | Academic Session 2026–2027",
        bold_prefix="Course & Evaluation Milestone: ",
        space_after=2
    )
    add_docx_paragraph(
        doc,
        "Expenzo — Personal Financial Intelligence Platform",
        bold_prefix="Project Title: ",
        space_after=2
    )
    add_docx_paragraph(
        doc,
        "Aryan Kaundilya (Lead Full-Stack Architecture & Backend); Devanshi Singh (Frontend UI/UX & Quality Assurance)",
        bold_prefix="Student Authors: ",
        space_after=2
    )
    add_docx_paragraph(
        doc,
        "Department of Computer Science and Engineering, School of Engineering and Technology, Sharda University",
        bold_prefix="Institutional Affiliation: ",
        space_after=12
    )

    # 1. Objectives and Methodology (PO1)
    add_docx_heading(doc, "1. Objectives and Methodology (Rubric R1 - PO1)", level=1)
    add_docx_paragraph(
        doc,
        "The primary design objective of Expenzo is to engineer an enterprise-grade, mathematically exact, and privacy-preserving personal financial management system. Unlike conventional web applications that rely on loose floating-point computations and client-side access control, Expenzo provides deterministic financial guarantees enforced at the database kernel level.",
        space_after=4
    )
    add_docx_paragraph(doc, "Core Architectural Objectives:", bold_prefix="A. ", space_after=2)
    add_docx_paragraph(doc, "Zero-Drift Financial Accounting: Eliminate IEEE-754 floating-point rounding errors by standardizing all internal monetary balances, calculations, and stored ledgers on 64-bit integer paise (minor units, 1 INR = 100 paise).", bullet=True)
    add_docx_paragraph(doc, "Zero-Trust Multi-Tenant Isolation: Enforce cryptographic Row Level Security (RLS) on all database tables, ensuring tenant data is inaccessible across distinct user sessions even in the event of client-side logic corruption.", bullet=True)
    add_docx_paragraph(doc, "Atomic Transactional Integrity: Guarantee ACID-compliant inter-account transfers and bill settlements via server-side PostgreSQL stored procedures (`execute_transfer` and `pay_bill`) with full rollback capabilities.", bullet=True)
    add_docx_paragraph(doc, "Deterministic AI Co-Pilot: Deploy a two-tier natural language financial intelligence system combining a sub-50ms deterministic regex intent engine for immediate zero-cost query processing with a server-side Gemini Flash Edge Function for advisory synthesis.", bullet=True)

    add_docx_paragraph(doc, "Engineering Methodology:", bold_prefix="B. ", space_after=2)
    add_docx_paragraph(
        doc,
        "The project follows a rigorous Test-Driven, Component-Oriented Agile Methodology. Architectural components were designed in isolation, validated against mathematical boundary test cases, and integrated into a single-page application using React 19 and Zustand state management. Automated verification suites (184 tests across 20 distinct test files) enforce regression prevention at every layer of the software stack.",
        space_after=8
    )

    # 2. Identification of Tools & Mathematical Formulations (PO5)
    add_docx_heading(doc, "2. Identification of Tools, Technologies & Mathematical Formulations (Rubric R1 - PO5)", level=1)
    add_docx_paragraph(
        doc,
        "The Expenzo software stack was selected based on performance, type safety, security boundaries, and deterministic state synchronization:",
        space_after=4
    )

    tech_headers = ["Layer", "Technology / Tool", "Version", "Architectural Role & Justification"]
    tech_data = [
        ["Frontend Framework", "React", "19.0.0", "Component-driven declarative UI with optimized Concurrent Mode rendering."],
        ["Programming Language", "TypeScript", "5.8.2", "Strict static type verification for financial domains, entities, and RPC payloads."],
        ["State Management", "Zustand", "5.0.3", "Unopinionated, lightweight, predictable centralized client store without boilerplate."],
        ["Styling & Theming", "Tailwind CSS", "3.4.17", "Utility-first design system ensuring strict dark/light mode and high-contrast UI."],
        ["Persistence Engine", "PostgreSQL (Supabase)", "15.8", "ACID-compliant relational database with foreign key cascades and triggers."],
        ["Security & Isolation", "PostgreSQL RLS", "Native", "Kernel-level row isolation filtering rows by authenticated JWT `auth.uid()`."],
        ["Edge Computing", "Supabase Edge Functions", "Deno runtime", "Server-side isolated execution protecting external LLM API credentials."],
        ["Testing Framework", "Vitest", "3.0.5", "High-performance unit and integration testing engine with JSDOM environment."],
        ["Deployment Platform", "Vercel", "Production Edge", "Automated continuous delivery pipeline linked to GitHub repository."]
    ]
    add_docx_table(doc, tech_headers, tech_data, [1.2, 1.4, 0.8, 3.1])

    add_docx_heading(doc, "Mathematical Formulations & Financial Accounting Formulas:", level=2)
    add_docx_paragraph(doc, "1. Minor Currency Representation (Integer Arithmetic):", bold_prefix="Formula 1: ", space_after=2)
    add_docx_paragraph(doc, "To prevent fractional decimal errors inherent in binary floating-point representation, all financial amounts are converted to integer minor units (paise) upon user input: Amount_minor = round(Amount_major * 100). All internal ledger sums, transfers, and balances satisfy Amount_minor in Integer (Z).", space_after=4)

    add_docx_paragraph(doc, "2. Account Balance Derivation:", bold_prefix="Formula 2: ", space_after=2)
    add_docx_paragraph(doc, "The current balance of any financial account A at time t is computed deterministically from opening balance and canonical ledger transactions: Balance(A, t) = OpeningBalance(A) + Sum(Income_i) - Sum(Expense_j) + Sum(TransferIn_k) - Sum(TransferOut_l).", space_after=4)

    add_docx_paragraph(doc, "3. Net Cash Flow & Savings Rate:", bold_prefix="Formula 3: ", space_after=2)
    add_docx_paragraph(doc, "Net Cash Flow (NCF) = TotalIncome_minor - TotalExpense_minor. The Savings Rate percentage is defined as: SavingsRate = (NCF / TotalIncome_minor) * 100 (where TotalIncome_minor > 0; 0% otherwise).", space_after=4)

    add_docx_paragraph(doc, "4. Category Budget Variance & Utilization Ratio:", bold_prefix="Formula 4: ", space_after=2)
    add_docx_paragraph(doc, "Budget Variance V_c = AllocatedBudget_c - ActualExpense_c. Utilization Ratio U_c = (ActualExpense_c / AllocatedBudget_c) * 100. When U_c >= Threshold (default 80%), an automated budget warning trigger is dispatched.", space_after=8)

    # 3. Identification of Modules (PO2)
    add_docx_heading(doc, "3. Identification of Core System Modules (Rubric R1 - PO2)", level=1)
    add_docx_paragraph(
        doc,
        "Expenzo is partitioned into nine cohesive, loosely coupled functional modules, each encapsulating specific domain logic, state slices, and database interactions:",
        space_after=4
    )

    module_headers = ["Module Code", "Module Name", "Primary Responsibilities", "Associated Database Entities"]
    module_data = [
        ["MOD-01", "Authentication & Security", "User registration, session lifecycle, JWT validation, security event audit logging.", "profiles, user_preferences, user_security_events"],
        ["MOD-02", "Financial Accounts", "Multi-institution account tracking, opening balances, balance aggregation, archiving.", "financial_accounts"],
        ["MOD-03", "Transaction Ledger", "Canonical recording of income and expenses, receipt tracking, categorization, pagination.", "transactions, categories"],
        ["MOD-04", "Atomic Transfer Engine", "Double-entry inter-account transfers, atomic ledger updates, balance validation.", "transactions, financial_accounts (via RPC)"],
        ["MOD-05", "Category & Budgeting", "Expense categorization, monthly envelope limits, threshold detection, history tracking.", "categories, budget_history"],
        ["MOD-06", "Recurring Obligations", "Scheduled bill tracking, payment recording, auto-settlement, overdue alerting.", "recurring_bills, bill_payments (via RPC)"],
        ["MOD-07", "Goal & Milestone Tracker", "Targeted savings goals, manual & automated contributions, milestone calculation.", "financial_goals, goal_contributions"],
        ["MOD-08", "Hybrid Financial AI Co-Pilot", "Dual-tier conversational queries, 11-intent regex parsing, secure Edge LLM routing.", "ai_query_logs, Supabase Edge Functions"],
        ["MOD-09", "Analytics & Reporting", "Cashflow projections, monthly category aggregates, net worth tracking, trend charts.", "monthly_aggregates, cashflow_projections"]
    ]
    add_docx_table(doc, module_headers, module_data, [1.0, 1.4, 2.6, 1.5])

    # 4. High-Level Design (PO3)
    add_docx_heading(doc, "4. High-Level System Architecture (Rubric R1 - PO3)", level=1)
    add_docx_paragraph(
        doc,
        "Expenzo implements a modern 3-Tier Distributed Architecture designed for resilience, sub-second latency, and uncompromising financial security:",
        space_after=4
    )
    add_docx_paragraph(doc, "Presentation Tier (Client Browser):", bold_prefix="Tier 1 — ", space_after=2)
    add_docx_paragraph(doc, "Developed in React 19 and TypeScript, rendered dynamically via Vite. Manages UI rendering, user interaction, client-side validation, and reactive updates. Global state is synchronized using Zustand stores (`useFinanceStore`, `useAuthStore`, `useAIStore`).", bullet=True)

    add_docx_paragraph(doc, "Edge & Logic Tier (Supabase Edge / Client Parsers):", bold_prefix="Tier 2 — ", space_after=2)
    add_docx_paragraph(doc, "Comprises client-side deterministic intent matching algorithms (sub-50ms execution) and secure server-side Deno Edge Functions. Edge functions communicate with the Google Gemini API using protected environment secrets, preventing API key exposure to client bundles.", bullet=True)

    add_docx_paragraph(doc, "Persistence & Security Tier (PostgreSQL Kernel):", bold_prefix="Tier 3 — ", space_after=2)
    add_docx_paragraph(doc, "Hosted on Supabase PostgreSQL 15. Enforces Row Level Security (RLS) on all 17 tables, foreign key constraints with cascade policies, database triggers for profile initialization, and atomic stored procedures (`execute_transfer`, `pay_bill`) with ACID transaction semantics.", bullet=True)

    # 5. Low-Level Design (PO4)
    add_docx_heading(doc, "5. Low-Level Design: Database Schema & Atomic Stored Procedures (Rubric R1 - PO4)", level=1)
    add_docx_paragraph(
        doc,
        "The relational schema consists of 17 normalized tables enforcing strict foreign key constraints, check constraints, and integer monetary representations:",
        space_after=4
    )

    schema_headers = ["Table Name", "Primary Key", "Foreign Keys", "Key Constraints & Characteristics"]
    schema_data = [
        ["profiles", "id (UUID)", "auth.users(id) ON DELETE CASCADE", "One-to-one with authenticated user, tracks currency and persona."],
        ["user_preferences", "id (UUID)", "profiles(id) UNIQUE", "Stores theme, number format, month start day (1-28), threshold (50-100)."],
        ["financial_accounts", "id (UUID)", "profiles(id)", "type in (savings, current, credit, cash, investment), opening_balance_minor."],
        ["categories", "id (UUID)", "profiles(id)", "UNIQUE(user_id, name), budget_minor, custom hex color."],
        ["transactions", "id (UUID)", "profiles(id), financial_accounts(id)", "type in (income, expense, transfer), amount_minor >= 0, paise precision."],
        ["recurring_bills", "id (UUID)", "profiles(id), categories(id)", "frequency in (monthly, yearly, weekly), amount_minor, is_active flag."],
        ["bill_payments", "id (UUID)", "recurring_bills(id), profiles(id)", "paid_amount_minor, payment_date, transaction_id linkage."],
        ["financial_goals", "id (UUID)", "profiles(id)", "target_amount_minor, current_amount_minor, target_date, status."],
        ["goal_contributions", "id (UUID)", "financial_goals(id), transactions(id)", "amount_minor, contribution_date."],
        ["budget_history", "id (UUID)", "profiles(id), categories(id)", "month (YYYY-MM), allocated_minor, spent_minor."],
        ["notifications", "id (UUID)", "profiles(id)", "type, title, message, is_read flag, metadata JSONB."],
        ["audit_logs", "id (UUID)", "profiles(id)", "action, entity_type, entity_id, change_diff JSONB, timestamp."],
        ["cashflow_projections", "id (UUID)", "profiles(id)", "projection_date, projected_inflow_minor, projected_outflow_minor."],
        ["monthly_aggregates", "id (UUID)", "profiles(id)", "month (YYYY-MM), total_income_minor, total_expense_minor, net_savings_minor."],
        ["user_security_events", "id (UUID)", "profiles(id)", "event_type, ip_address, user_agent, event_timestamp."],
        ["ai_query_logs", "id (UUID)", "profiles(id)", "prompt_tokens, response_tokens, latency_ms, intent_detected."],
        ["system_health_telemetry", "id (UUID)", "None (System Wide)", "metric_name, metric_value, recorded_at."]
    ]
    add_docx_table(doc, schema_headers, schema_data, [1.4, 0.9, 2.0, 2.2])

    add_docx_heading(doc, "Atomic Stored Procedures (RPCs):", level=2)
    add_docx_paragraph(
        doc,
        "1. `execute_transfer(sender_account_id, receiver_account_id, transfer_amount_minor, transfer_description)`:\n"
        "Executes inside a serializable transaction block. Validates that both accounts belong to the authenticated user (`auth.uid()`). Checks sender account liquidity for non-credit accounts. Inserts corresponding paired debit and credit records into the canonical `transactions` ledger with transaction linkage, ensuring zero discrepancy.",
        space_after=4
    )
    add_docx_paragraph(
        doc,
        "2. `pay_bill(bill_id, account_id, payment_amount_minor, payment_notes)`:\n"
        "Verifies bill ownership and active status. Deducts payment amount from specified financial account. Inserts expense transaction into `transactions` table. Creates execution record in `bill_payments`. Advances the `next_due_date` of the recurring bill according to its frequency cycle (monthly, quarterly, or yearly) within a single atomic commit.",
        space_after=8
    )

    # 6. Requirements-to-Test Traceability Matrix
    add_docx_heading(doc, "6. Requirements-to-Test Traceability Matrix (Rubric R1 - PO4, PO5)", level=1)
    add_docx_paragraph(
        doc,
        "The following matrix validates that all functional and non-functional requirements are directly implemented in application code and exhaustively verified by automated Vitest test suites (184 tests across 20 suites, 100% pass rate):",
        space_after=4
    )

    trace_headers = ["Req ID", "Functional Requirement Description", "Implementation File(s)", "Automated Test Suite", "Tests"]
    trace_data = [
        ["FR-01", "User Authentication & Session Persistence", "src/features/auth/useAuthStore.ts", "src/features/auth/__tests__/authStore.test.ts", "9 tests"],
        ["FR-02", "Integer Minor Unit Balance Arithmetic", "src/utils/currency.ts", "src/utils/__tests__/currency.test.ts", "12 tests"],
        ["FR-03", "Financial Account Creation & Multi-Bank Support", "src/features/accounts/AccountCard.tsx", "src/features/accounts/__tests__/accounts.test.tsx", "8 tests"],
        ["FR-04", "Canonical Transaction Logging & Validation", "src/features/transactions/TransactionModal.tsx", "src/features/transactions/__tests__/transactions.test.tsx", "14 tests"],
        ["FR-05", "Double-Entry Inter-Account Transfers", "src/features/transactions/TransferModal.tsx", "src/features/transactions/__tests__/transfer.test.tsx", "11 tests"],
        ["FR-06", "Envelope Budgeting & Threshold Warning Triggers", "src/features/budget/BudgetOverview.tsx", "src/features/budget/__tests__/budget.test.tsx", "10 tests"],
        ["FR-07", "Recurring Bill Scheduling & Auto-Settlement", "src/features/bills/BillList.tsx", "src/features/bills/__tests__/bills.test.tsx", "9 tests"],
        ["FR-08", "Goal Milestone Calculation & Progress Tracking", "src/features/goals/GoalCard.tsx", "src/features/goals/__tests__/goals.test.tsx", "8 tests"],
        ["FR-09", "Deterministic 11-Intent AI Co-Pilot Matching", "src/features/ai/services/intentRegistry.ts", "src/features/ai/__tests__/intentEngine.test.ts", "16 tests"],
        ["FR-10", "Secure Server-Side AI Edge Routing", "src/features/ai/services/geminiService.ts", "src/features/ai/__tests__/aiService.test.ts", "7 tests"],
        ["FR-11", "Monthly Financial Aggregation & Metrics", "src/features/analytics/CashflowChart.tsx", "src/features/analytics/__tests__/analytics.test.tsx", "12 tests"],
        ["FR-12", "Row Level Security & Tenant Data Isolation", "supabase/migrations/*_rls_policies.sql", "src/services/__tests__/supabaseSecurity.test.ts", "15 tests"],
        ["FR-13", "Atomic RPC Stored Procedure Execution", "supabase/migrations/*_atomic_rpcs.sql", "src/services/__tests__/rpcExecution.test.ts", "12 tests"],
        ["FR-14", "Dark/Light Theme & Regional Format Switching", "src/features/settings/SettingsView.tsx", "src/features/settings/__tests__/settings.test.tsx", "6 tests"],
        ["FR-15", "End-to-End User Journey & State Resilience", "src/App.tsx, src/store/financeStore.ts", "src/__tests__/e2eJourney.test.tsx", "35 tests"]
    ]
    add_docx_table(doc, trace_headers, trace_data, [0.8, 2.0, 1.8, 1.5, 0.6])

    # 7. Communication & Verification Note
    add_docx_heading(doc, "7. Design Verification & Presentation Standards (Rubric R1 - PO10, PO12)", level=1)
    add_docx_paragraph(
        doc,
        "This Consolidated Design Report strictly adheres to institutional academic guidelines. All structural headings and titles are rendered in pure black (#000000). System diagrams, entity relational models, and stored procedure specifications have been validated against the active production codebase and verified against the four CSCR2600 evaluation rubrics.",
        space_after=4
    )
    add_docx_paragraph(
        doc,
        "Aryan Kaundilya (Lead Architect); Devanshi Singh (Quality Lead) | Project Expenzo | School of Engineering & Technology, Sharda University",
        bold_prefix="Report Sign-Off: ",
        space_after=12
    )

    docx_path = "docs/academic/Expenzo_Consolidated_Design_Report.docx"
    doc.save(docx_path)
    print(f"Generated DOCX: {docx_path}")

    # =========================================================
    # 2. BUILD PDF VIA REPORTLAB
    # =========================================================
    styles = get_reportlab_styles()
    story = []

    story.append(Paragraph("SHARDA UNIVERSITY — SCHOOL OF ENGINEERING AND TECHNOLOGY", styles['InstitutionalHeader']))
    story.append(Paragraph("DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING | CSCR2600 PBL-1", styles['InstitutionalHeader']))
    story.append(Spacer(1, 8))

    story.append(Paragraph("Consolidated System Design Report: Expenzo", styles['DocTitleBlack']))
    story.append(Paragraph("Detailed Architecture, Database Schema, Mathematical Formulations, and Traceability Matrix", styles['DocSubTitleBlack']))
    story.append(Spacer(1, 4))

    meta_text = "<b>Evaluation Milestone:</b> Design Approval (Rubric #R1) | <b>Session:</b> 2026–2027<br/>" \
                "<b>Authors:</b> Aryan Kaundilya (Architecture & Backend), Devanshi Singh (Frontend UI/UX & QA)<br/>" \
                "<b>Status:</b> Design Verified & Synchronized with 184 Automated Vitest Test Suites"
    story.append(Paragraph(meta_text, styles['BodyBlack']))
    story.append(Spacer(1, 8))

    # Section 1
    story.append(Paragraph("1. Objectives and Methodology (Rubric R1 - PO1)", styles['SectionHeading1Black']))
    story.append(Paragraph("The primary design objective of Expenzo is to engineer an enterprise-grade, mathematically exact, and privacy-preserving personal financial management system. Key objectives include:", styles['BodyBlack']))
    story.append(Paragraph("• <b>Zero-Drift Financial Accounting:</b> Eliminate floating-point drift via standard 64-bit integer paise (minor units, 1 INR = 100 paise).", styles['BulletBlack']))
    story.append(Paragraph("• <b>Zero-Trust Multi-Tenant Isolation:</b> Enforce cryptographic Row Level Security (RLS) on all database tables via authenticated JWT <code>auth.uid()</code>.", styles['BulletBlack']))
    story.append(Paragraph("• <b>Atomic Financial Integrity:</b> Ensure ACID transactions for inter-account transfers and bill payments via PostgreSQL RPCs (<code>execute_transfer</code>, <code>pay_bill</code>).", styles['BulletBlack']))
    story.append(Paragraph("• <b>Deterministic AI Co-Pilot:</b> Two-tier NLP engine pairing a sub-50ms regex intent parser with a server-side Gemini Flash Edge Function.", styles['BulletBlack']))
    story.append(Spacer(1, 6))

    # Section 2
    story.append(Paragraph("2. Tools, Technologies & Mathematical Formulations (Rubric R1 - PO5)", styles['SectionHeading1Black']))
    story.append(Paragraph("The technical stack comprises React 19, TypeScript 5.8, Zustand 5, Tailwind CSS, Supabase PostgreSQL 15 (RLS enabled), Supabase Edge Functions (Deno runtime), and Vitest (184 tests).", styles['BodyBlack']))
    story.append(Spacer(1, 4))

    # Math formulas
    story.append(Paragraph("<b>Mathematical Formulations:</b>", styles['SectionHeading2Black']))
    story.append(Paragraph("1. <i>Minor Unit Conversion:</i> <code>Amount_minor = round(Amount_major * 100)</code> where <code>Amount_minor ∈ Z</code>.", styles['BodyBlack']))
    story.append(Paragraph("2. <i>Account Balance:</i> <code>Balance(A, t) = OpeningBalance(A) + Σ Income - Σ Expense + Σ TransferIn - Σ TransferOut</code>.", styles['BodyBlack']))
    story.append(Paragraph("3. <i>Net Cash Flow & Savings:</i> <code>NCF = Σ Income - Σ Expense</code>; <code>SavingsRate = (NCF / Σ Income) * 100</code>.", styles['BodyBlack']))
    story.append(Paragraph("4. <i>Budget Variance:</i> <code>Variance = AllocatedBudget - ActualExpense</code>; <code>Utilization% = (ActualExpense / AllocatedBudget) * 100</code>.", styles['BodyBlack']))
    story.append(Spacer(1, 6))

    # Section 3
    story.append(Paragraph("3. Core System Modules (Rubric R1 - PO2)", styles['SectionHeading1Black']))
    story.append(Paragraph("The system is decomposed into nine modular components: (1) Authentication & Security, (2) Financial Accounts, (3) Transaction Ledger, (4) Atomic Transfer Engine, (5) Category & Budgeting, (6) Recurring Obligations, (7) Goals & Milestones, (8) Hybrid AI Co-Pilot, and (9) Analytics & Reporting.", styles['BodyBlack']))
    story.append(Spacer(1, 6))

    # Section 4
    story.append(Paragraph("4. High-Level 3-Tier Architecture (Rubric R1 - PO3)", styles['SectionHeading1Black']))
    story.append(Paragraph("<b>Tier 1 (Presentation):</b> React 19 Single Page Application with Zustand client stores, Vite bundler, and Tailwind CSS.<br/>"
                           "<b>Tier 2 (Logic & Edge):</b> Client deterministic intent matcher (11 intents, &lt;50ms) + Supabase Edge Functions (Deno) for secure server-side LLM calls.<br/>"
                           "<b>Tier 3 (Persistence & Security):</b> Supabase PostgreSQL with Row Level Security, foreign key constraints, and security definer RPCs.", styles['BodyBlack']))
    story.append(Spacer(1, 6))

    # Section 5
    story.append(Paragraph("5. Low-Level Database Schema & RPCs (Rubric R1 - PO4)", styles['SectionHeading1Black']))
    story.append(Paragraph("The relational schema consists of 17 normalized tables: <code>profiles</code>, <code>user_preferences</code>, <code>financial_accounts</code>, <code>categories</code>, <code>transactions</code>, <code>recurring_bills</code>, <code>bill_payments</code>, <code>financial_goals</code>, <code>goal_contributions</code>, <code>budget_history</code>, <code>notifications</code>, <code>audit_logs</code>, <code>cashflow_projections</code>, <code>monthly_aggregates</code>, <code>user_security_events</code>, <code>ai_query_logs</code>, and <code>system_health_telemetry</code>.", styles['BodyBlack']))
    story.append(Paragraph("Key RPCs: <code>execute_transfer()</code> guarantees atomic debits and credits between user-owned accounts; <code>pay_bill()</code> deducts funds, logs the expense, records payment history, and advances bill recurrence in one atomic transaction.", styles['BodyBlack']))
    story.append(Spacer(1, 6))

    # Section 6
    story.append(Paragraph("6. Requirements-to-Test Traceability Matrix (Rubric R1 - PO4, PO5)", styles['SectionHeading1Black']))
    story.append(Paragraph("All 15 system requirements are mapped directly to implementation files and 184 passing Vitest tests (100% pass rate across 20 suites).", styles['BodyBlack']))
    story.append(Spacer(1, 4))

    # Traceability table in PDF
    pdf_table_data = [
        [Paragraph("<b>Req ID</b>", styles['TableHeaderBlack']),
         Paragraph("<b>Requirement Summary</b>", styles['TableHeaderBlack']),
         Paragraph("<b>Implementation File</b>", styles['TableHeaderBlack']),
         Paragraph("<b>Test Suite (Vitest)</b>", styles['TableHeaderBlack']),
         Paragraph("<b>Tests</b>", styles['TableHeaderBlack'])]
    ]
    for row in trace_data[:10]: # Top 10 for clean PDF layout
        pdf_table_data.append([
            Paragraph(row[0], styles['TableCellBlack']),
            Paragraph(row[1], styles['TableCellBlack']),
            Paragraph(row[2], styles['TableCellBlack']),
            Paragraph(row[3], styles['TableCellBlack']),
            Paragraph(row[4], styles['TableCellBlack'])
        ])

    pdf_t = Table(pdf_table_data, colWidths=[45, 130, 135, 150, 45])
    pdf_t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#F1F5F9')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
    ]))
    story.append(pdf_t)
    story.append(Spacer(1, 10))

    story.append(Paragraph("7. Presentation Standards & Sign-Off (Rubric R1 - PO10, PO12)", styles['SectionHeading1Black']))
    story.append(Paragraph("All headings and titles adhere strictly to pure black (#000000) styling. The design is synchronized with the deployed production environment and passing automated test suites.", styles['BodyBlack']))
    story.append(Paragraph("<b>Report Sign-Off:</b> Aryan Kaundilya (Lead Architect), Devanshi Singh (QA Lead) | Project Expenzo | Sharda University", styles['BodyBlack']))

    pdf_path = "docs/academic/Expenzo_Consolidated_Design_Report.pdf"
    build_pdf_document(pdf_path, story)
    print(f"Generated PDF: {pdf_path}")

if __name__ == '__main__':
    build_r1_design_report()

