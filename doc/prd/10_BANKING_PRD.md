# Banking prototype PRD

## Scope boundary
Display DEMO ACCOUNTS. No actual bank connection, UPI, card controls, loan eligibility, bill payments, beneficiary additions or statements from banks. Named institutions are simulated examples; avoid official logos implying partnership. No login forms that imitate real bank credential collection.

## `/app/banking`
Top bank balance summary (deposit accounts only), cards for HDFC/SBI/Cash demo accounts, pending bills, categorized activity, cash-flow trend. **View Account** -> `/app/banking/accounts/:id`; **Transactions** -> `/app/banking/transactions`; **Demo Transfer** -> modal; **Connect Bank** -> informational modal saying unavailable with demo option; **Explore Services** -> `/app/banking/services`.

## `/app/banking/accounts/:id`
Masked account, balance from ledger, date-filtered activity, cash-flow chart, last updated seed time. **Back to accounts** -> `/app/banking`; **Add transaction** -> TransactionForm tied to account; **Statement** -> `/app/banking/statements?account=:id`; transaction row -> transaction detail; not-found route -> back link.

## `/app/banking/transactions`
Same canonical ledger filtered to account-backed transactions. Search, period, account filter; row links canonical transaction detail; no duplicated records.

## `/app/banking/statements`
Account and month selectors; **Generate Demo Statement** -> show period opening balance, movements, closing balance computed from ledger; **Download CSV** -> correct generated statement; **Print** -> browser print stylesheet. Explicit 'Not issued by a bank'.

## `/app/banking/services`
Cards: Transfers (demo internal only), Bill Payments, Beneficiaries, Cards, Fixed Deposits, Recurring Deposits, Loans, EMI, Requests. Clicking each opens a detail panel; only Demo Transfer active. Other services explain future authorized integration and have no fake completion action.

## `/app/banking/bills`
Bills and anticipated recurring expenses; **Add bill** creates reminder rule (amount, name, due date, category), **Edit**, **Mark reviewed**, **Delete**; no claim bill paid. **Record expense** -> prefilled transaction form for confirmation. Upcoming card -> bill detail.

## Transfer flow
Source+destination owned deposit accounts, amount, note, review screen 'Simulated only'. Confirm checks balance and distinct accounts, writes transaction with debit and credit, toast 'Demo balances updated'; no external transfer claim. Cancel no mutation.

## Acceptance
Transfer preserves total aggregate cash; bank/account views match global ledger; statement opening+movements=closing; no bank credentials captured.
