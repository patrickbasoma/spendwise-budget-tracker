# SpendWise v2.0 — Personal Finance Dashboard

SpendWise is a browser-based personal finance dashboard for tracking income, expenses, budgets and spending patterns.

## Files

- `index.html` — dashboard layout, navigation, transaction dialog, settings and data tools.
- `style.css` — responsive styling, dashboard cards, tables, charts and light/dark themes.
- `script.js` — transaction management, calculations, settings, Local Storage, reports and backup tools.

## Features

- Dashboard overview of balance, income, expenses and budget.
- Add, edit, delete, search and filter income and expense transactions.
- Custom categories.
- Monthly budget tracking and warnings.
- Reports with category breakdown and six-month cash-flow chart.
- Currency selection: KES, USD, EUR, GBP, UGX and TZS.
- Light and dark themes.
- Display name preference.
- Export and import JSON backups.
- Local Storage persistence after browser refresh.
- Responsive layout for desktop and mobile.

## Run in Chrome

1. Keep all three files in the same folder.
2. Open `index.html` in Chrome, or open the folder in VS Code and use the Live Server extension.
3. Add a transaction and refresh the page to confirm that it remains saved.

## Important data note

This version uses browser Local Storage. Data stays in the same browser profile on the same device. It is not cloud-synced or protected by a user account. Clearing browser site data can remove it, so use **Data management → Download backup** regularly. Importing a backup replaces the data currently stored in this browser.

## Compatibility

The app uses modern browser features including Local Storage, HTML dialog, Blob downloads and FileReader.
