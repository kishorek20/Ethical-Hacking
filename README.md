# Personal Information Leakage Risk Scoring and Prevention System

> **Tagline:** Aware, Safe, Protected

A complete, full-stack privacy assessment platform that calculates a **0–100 data-leakage risk score**, classifies it as **Low / Moderate / High / Critical**, highlights your primary risk factors, and provides prioritised, personalised prevention steps with a real-time **what-if simulator**.

---

## 🚀 Quick Start Guide

### Prerequisites
- Python 3.10+ (tested on Python 3.14)
- Node.js 18+ & npm

### 1. Start Backend Server
```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
# source venv/bin/activate

pip install -r requirements.txt
python app/seed.py
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
Backend API docs available at: [http://localhost:8000/docs](http://localhost:8000/docs)

### 2. Start Frontend Development Server
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔑 Demo Account
A sample account pre-seeded with 5 historical assessments showing score improvement:
- **Email:** `demo@example.com`
- **Password:** `Demo@1234`

---

## 🎯 Capstone Demo Script (5 Minutes)

1. **Introduction & Landing Page (1 min):**
   - Open `http://localhost:5173`.
   - Point out the trust-focused security palette, shield branding, tagline (*"Aware, Safe, Protected"*), and toggle the Dark Mode switcher.
   - Click **"Sign In"** and log in with the pre-seeded account: `demo@example.com` / `Demo@1234`.

2. **Historical Progress (1 min):**
   - Click **"History"** in the navigation bar.
   - Point out the line chart showing privacy risk score reduction over time (from ~85 down to ~20) as past security recommendations were completed.
   - Show the assessment history table.

3. **Multi-Step Assessment Walkthrough (1.5 min):**
   - Click **"New Assessment"**.
   - **Step 1 (Personal Details):** Show live data masking notices and mark email/phone/address as shared publicly.
   - **Step 2 (Online Accounts):** Select accounts (Instagram, Google, LinkedIn, etc.).
   - **Step 3 (Password Habits):** Demonstrate the slider and the **client-side only** password checker using HaveIBeenPwned k-anonymity (SHA-1 prefix lookup).
   - **Step 4 (Security Practices):** Toggle 2FA per account and privacy check habits.
   - **Step 5 (Profile Privacy):** Select Public vs Friends vs Private for social handles.
   - **Step 6 (Review & Confirm):** Show client-side masked summary (e.g. `a***@gmail.com`, `******1234`). Submit for analysis.

4. **Results Dashboard & What-If Simulation (1.5 min):**
   - Observe the semicircular gauge meter with color-coded classification (Low / Moderate / High / Critical).
   - Review category score breakdown and ranked risk factors with contribution points.
   - **Interactive What-If feature:** Click "Mark as done" on prevention tips. Watch the projected new score dynamically drop in the simulator!
   - Click **"Export PDF"** to generate an executive report summary.
   - Point out the **"Delete My Account & Data"** button ensuring full user data autonomy.

---

## 🛡️ Security & Privacy Engineering Highlights
- **No Raw Sensitive Data Persistent:** Passwords are encrypted with `bcrypt`. Emails are stored as irreversible SHA-256 hashes for auth indexing alongside masked display strings (`a***@domain`). Phone numbers and identity details are strictly masked before storage.
- **k-Anonymity Breach Checking:** Passwords are SHA-1 hashed client-side in the browser via `crypto.subtle`. Only the 5-character prefix is queried against HaveIBeenPwned API ranges. Passwords never touch the backend server.
- **Configurable Scoring Engine:** Risk weights are externalized in `backend/scoring_config.json`, enabling agile updates without altering application code.
- **Unit Test Coverage:** 23 automated pytest tests verifying scoring limits, level boundaries, masking accuracy, and breach simulation.
