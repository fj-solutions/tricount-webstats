# Tricount Webstats

A sleek and reactive dashboard to visualize and analyze your **Tricount** groups in real time.


---

## ⭐ Features

* 📊 **Dynamic statistics** for your Tricount groups
  View and compare categories, members, and time periods.
* 🪄 **Interactive visuals**
  * Sorted pie charts and tables (Recharts + TanStack Table)
* 🎨 **UI** powered by shadcn/ui and TailwindCSS
* ⚡ **Easy Setup** via Tricount API

---

## 🚀 Quick Start

### Requirements

* Node.js **v18+**
* npm or pnpm

### Installation

```bash
git clone https://github.com/fj-solutions/tricount-webstats.git
cd tricount-webstats
npm install
```

### Run locally

```bash
npm run dev
```

Open [http://localhost:4321](http://localhost:4321) in your browser.

---

## 🧩 Tech Stack

| Layer       | Technology                 |
| ----------- | -------------------------- |
| Frontend/UI | Astro + React              |
| Styling     | TailwindCSS + shadcn/ui    |
| Charts      | Recharts                   |
| Tables      | TanStack Table v8          |
| Backend/API | Astro API routes + Node.js |
| Language    | TypeScript                 |

---

## ⚙️ Configuration

You can add Tricounts directly in the Dashboard. You only need the tricountKey. Obtain this key by sharing your Tricount via link (e.g. https://tricount.com/this-is-your-key ) and paste the key in the dasboard. The key is stored locally, anything else is fetched from the Tricount API.

---

## 🤝 Contribute

If you add any features or fix any of my mistakes, please contribute to this project.
This project was created for my own purpose in under 2 hours using Claude Code, so be prepared for the code quality.

---
