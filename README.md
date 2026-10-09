# Urvi Pharmacy

A pharmacy management app built with plain HTML, CSS, and JavaScript. No framework, bundler, backend, or login is required.

## Run locally

Open `index.html` in a browser. For GitHub Pages, push the repository to the `main` branch and set **Settings → Pages → Build and deployment → Source** to **GitHub Actions**.

The included workflow copies `index.html`, `styles.css`, and `app.js` to `dist/` and deploys that folder.

## Data and backups

App data is saved in the current browser's `localStorage`. Use **ব্যাকআপ ডাউনলোড** to export a JSON backup and **JSON ব্যাকআপ আপলোড** to restore one. Importing a backup replaces the currently stored data. Keep separate backups because browser data is not synced between devices.

## Features

- Bengali-language dashboard and responsive layout
- Medicine list, adding/editing medicines, stock adjustment, low-stock warnings
- Sales recording with automatic stock deduction
- Supplier list
- Inventory report
- Local persistence and JSON backup import/export
