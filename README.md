# 🍟 McDonald's Self-Order Kiosk (Google @a2ui/react + Google ADK Demo)

[![A2UI Standard](https://img.shields.io/badge/A2UI_Spec-v0.9-blue.svg)](https://github.com/a2ui-project/a2ui)
[![@a2ui/react](https://img.shields.io/badge/@a2ui/react-v0.10.2-red.svg)](https://www.npmjs.com/package/@a2ui/react)
[![Google ADK](https://img.shields.io/badge/Google_ADK-Gemini_2.0-34a853.svg)](https://aistudio.google.com/)

A streamlined, hands-on demo showcasing **Google A2UI (Agent-to-UI)** standard using pure **`@a2ui/react`** and **Google ADK (Agent Development Kit)**.

Simulates a real-world **McDonald's Self-Service Kiosk**, guiding a customer from browsing meals, customizing their burger & drink, reviewing their tray, to paying and generating an official **Purchase Order & Kitchen Ticket**.

---

## 🌟 Kiosk Workflow Stages

```
 ┌──────────────────────┐      ┌──────────────────────┐      ┌──────────────────────┐      ┌──────────────────────┐
 │  1. 🍔 Best Sellers   │ ──►  │ 2. 🍟 Meal Customizer │ ──►  │ 3. 🛒 Review Tray    │ ──►  │ 4. 🧾 Purchase Order │
 │  Big Mac, Quarter    │      │ Upsize, No Pickles,  │      │ Dine-in / Takeaway,  │      │ PO #88, Google Pay,  │
 │  Pounder, McCrispy   │      │ Extra Sauce & Bacon  │      │ Itemized Totals      │      │ Kitchen Grill Status │
 └──────────────────────┘      └──────────────────────┘      └──────────────────────┘      └──────────────────────┘
```

---

## 📦 Tech Stack

- ⚡ **`@a2ui/react` (v0.10.2)**: Google's official React renderer (`A2uiSurface`, `basicCatalog`, `injectStyles`).
- 🧠 **`@a2ui/web_core` (v0.10.6)**: Core state model & `MessageProcessor`.
- 🤖 **Google ADK Python Backend**: FastAPI / ADK server with Gemini 2.0 Flash tool-calling.
- 🎨 **McDonald's Kiosk Theme**: Authentic Red `#DA291C` & Golden Arches Yellow `#FFC72C` styling via CSS variables.

---

## 🏃 Quickstart

### 1. Run the Frontend (React + @a2ui/react)

```bash
cd client
npm install
npm run dev
```

Open **[http://localhost:5173](http://localhost:5173)** in your browser.

---

### 2. (Optional) Run the Backend (Python Google ADK Agent)

```bash
cd server
bash run.sh
```

---

## 📄 License

Apache 2.0 — Developed for Google Developer Group (GDG) workshops and developer demos.
