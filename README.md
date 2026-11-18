# SpendWise — Personal Finance Tracker

A responsive personal expense tracker built with **AngularJS 1.8.3**, HTML and CSS.

## Features
- Dashboard with income, expenses, balance and savings rate
- Six-month income/expense chart
- Expense category breakdown
- Add, edit, delete and search transactions
- Monthly category budgets
- Reports and CSV export
- Currency and display-name preferences
- Browser `localStorage` persistence
- Responsive desktop and mobile layout

## Run locally
No npm install or build step is required.

1. Download and extract this folder.
2. Open `index.html` in a browser, or use VS Code Live Server.
3. An internet connection is required to load AngularJS from the CDN.

## Publish with GitHub Pages
1. Upload the **contents** of this folder to the root of your GitHub repository.
2. Do not upload `node_modules` or the old project folder nested inside this folder.
3. In GitHub, open **Settings → Pages**.
4. Select **Deploy from a branch**, branch `main`, folder `/ (root)`, then Save.
5. Wait for deployment and open `https://YOUR-USERNAME.github.io/REPOSITORY-NAME/`.

The page loads AngularJS 1.8.3 from jsDelivr and falls back to cdnjs if the first CDN is unavailable. Because the library is loaded from a CDN, visitors need an internet connection.

## Data and limitations
Transactions and settings are stored only in the current browser's localStorage. There is no account system, server database, cloud sync or automatic backup. Clearing browser storage removes the local data. Export CSV periodically if you need a separate copy.

## Technology
- AngularJS 1.8.3
- HTML5
- CSS3
- JavaScript
