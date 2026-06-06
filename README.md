# VendorBridge — Next-Gen AI-Powered Procurement ERP

VendorBridge is an enterprise-grade Procurement ERP and Strategic Sourcing platform designed to streamline proposal lifecycles, automate vendor commercial evaluations, manage purchase order approvals, and deliver real-time spend analytics. 

Integrating a Next.js client interface with a TypeScript Express backend and a Python FastAPI microservice for AI matchmaking and forecasting, VendorBridge provides high-speed automated procurement management with modern aesthetics.

---

## 🚀 Key Features

*   **Executive Spend Dashboard**: Displays total spend telemetry, contract statuses, interactive monthly spend charts, and live activity trackers. Features an **Export PDF** utility for executive reports.
*   **Vendor Sourcing Directory**: Centralized partner logs supporting category filtering, rating indexes, real-time status toggles, and safe deletion. Built with a custom, premium delete confirmation drawer/modal.
*   **RFQ Requisition Workspace**: Full RFP lifecycle mapping from creation to bidding. Includes draft submission portals for custom vendor proposal publishing.
*   **Bid Comparison Matrix**: Side-by-side Technical and Commercial compliance audits with automated **Smart Selections** matching the best values (Price, Delivery, and Warranty). Generates structured evaluation reports in PDF format.
*   **Inbox Approvals Queue**: Prioritized auditor remark consoles and itemized specification reviews. Releases PO payments directly to accounting logs.
*   **AI Analytics Microservice**: Python FastAPI backend executing:
    *   *Vendor Ranking & Scoring*: Evaluates performance metrics (Quality/On-time delivery).
    *   *Demand Forecasting*: Forecasts procurement spend trends.
    *   *AI Recommendation Engine*: Auto-selects the optimal bid matching RFQ criteria.
*   **Offline Mock Mode**: Resilient client-side failover logic. If MongoDB or PostgreSQL databases are unreachable, the frontend automatically falls back to an interactive mock session, allowing full showcase operations.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend / App Layout** | Next.js (Turbopack), React 19, TailwindCSS, Framer Motion, Recharts, Sonner Toasts, Lucide Icons |
| **Backend API Gateway** | Node.js, Express, TypeScript, Prisma ORM, PostgreSQL |
| **AI Microservice** | Python 3.9+, FastAPI, Uvicorn, Pandas, NumPy |
| **Document Generation** | jsPDF, jspdf-autotable (Client), PDFKit (Server) |

---

## 📐 System Architecture

```mermaid
graph TD
    User([Procurement Officer / Vendor]) <--> |HTTP / JSON| NextApp[Next.js Client Layout]
    NextApp <--> |Client Hydration / Mock Fallback| AppContext[React AppContext State]
    NextApp <--> |API Calls| ExpressAPI[Express TypeScript Server]
    ExpressAPI <--> |ORM Queries| Prisma[Prisma Client]
    Prisma <--> |Data Store| Postgres[(PostgreSQL Database)]
    ExpressAPI <--> |REST Requests| PythonAI[Python FastAPI Service]
    PythonAI <--> |Forecasting & Scoring| PythonCore[Pandas / Numpy ML Engine]
```

---

## ⚙️ Installation & Setup

### Prerequisites
*   [Node.js](https://nodejs.org/) (v18+)
*   [Python](https://www.python.org/) (v3.9+)
*   [PostgreSQL](https://www.postgresql.org/) (Optional, fallback Mock Mode active)

---

### 1. Next.js Frontend Setup
1.  Navigate to the `next-app` directory:
    ```bash
    cd next-app
    ```
2.  Install Node dependencies:
    ```bash
    npm install
    ```
3.  Launch the development server:
    ```bash
    npm run dev
    ```
    *The client will be running at [http://localhost:3000](http://localhost:3000).*

---

### 2. Express Backend API Setup
1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
2.  Install server dependencies:
    ```bash
    npm install
    ```
3.  Configure environment variables:
    *   Duplicate `.env.example` to `.env` and set your PostgreSQL connection string:
        ```env
        DATABASE_URL="postgresql://username:password@localhost:5432/vendorbridge"
        PORT=5000
        ```
4.  Run Prisma migrations:
    ```bash
    npx prisma migrate dev --name init
    ```
5.  Seed the database with initial vendor data:
    ```bash
    npm run db:seed
    ```
6.  Start the Express server:
    ```bash
    npm run dev
    ```

---

### 3. Python AI Microservice Setup
1.  Navigate to the `ai` directory:
    ```bash
    cd ai
    ```
2.  Install required Python packages:
    ```bash
    pip install -r requirements.txt
    ```
3.  Start the FastAPI application:
    ```bash
    uvicorn main:app --reload --port 8000
    ```
    *The AI service will be active at [http://localhost:8000](http://localhost:8000).*

---

## 🔑 Demo Access Credentials

The application uses local role authorization. When logging in, you can select or input the following credentials to access custom interfaces:

*   **Procurement Admin (Complete Control)**:
    *   *Email*: `admin@vendorbridge.com`
    *   *Password*: `password123`
*   **Procurement Officer (Requisitions & Sourcing)**:
    *   *Email*: `officer@vendorbridge.com`
    *   *Password*: `password123`
*   **Sourcing Manager (Approvals & Audits)**:
    *   *Email*: `manager@vendorbridge.com`
    *   *Password*: `password123`
*   **Vendor Partner (Quotations & Bidding)**:
    *   *Email*: `vendor@furnico.com`
    *   *Password*: `password123`

---

## 🛡️ Recent Polish & Enhancements

*   **Custom React Dialog Overlays**: Replaced native browser confirmation alerts with customized dark-themed modals that support clean confirm/cancel states.
*   **Full PDF Document Printing**: Implemented formatting for the Dashboard summary, RFQ Quotation matrix, Purchase Orders, and Reports view to download correctly as `.pdf` assets.
*   **Natural Viewport Scrollbars**: Fixed scrolling blocks by adjusting overflow wrappers to `overflow-y-auto` across dynamic components.
*   **Unified HSL Dark Theme**: Styled dropdown `<select>` options to avoid default light theme browser overrides in dark-themed lists.
