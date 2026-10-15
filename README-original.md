# Zenith '26 College Fest Management System

A high-performance College Fest Management System featuring a student event discovery and registration portal, real-time seat availability calculation, server-side data validation, an administrative command dashboard, and live SQLite persistence.

Developed as a vibe-coding capstone project for **PM2-01 (How Software Works)** and **PM2-02 (Front-End, Back-End & Mobile)**.

---

## 🛠️ Technology Stack

| Layer | Technology | Key Capabilities |
|---|---|---|
| **Frontend** | HTML5, Tailwind CSS (Play CDN), Vanilla JavaScript | Responsive UI, interactive modal dialogs, real-time live search & category filters, utilization progress indicators |
| **Backend** | Python 3.9+, FastAPI, Starlette | REST API, strict server-side validation ("never trust the client"), static files mounting, CORS support |
| **Data Layer** | SQLite (`fest.db`), `openpyxl` | Relational schema, single source of truth (seats calculated live via SQL queries, zero cached drift), automatic Excel seed runner |
| **Testing** | Postman, OpenAPI (`/docs`) | Full Postman collection v2.1 with success & error response examples |

---

## 📂 Project Architecture

```
zenith26-fest-system/
├── backend/
│   ├── database.py             # SQLite connection helper & schema creation
│   ├── models.py               # Pydantic schemas (EventOut, RegistrationIn/Out, StatsOut)
│   ├── seed_data.py            # Openpyxl seed script reading data/events_seed.xlsx
│   └── main.py                 # FastAPI application, REST endpoints, and static mounts
├── frontend/
│   ├── index.html              # Student event portal (discovery, search, registration modal)
│   ├── admin.html              # Admin operations dashboard (metrics, category bars, table)
│   └── js/
│       ├── app.js              # Student portal client logic & API fetch integration
│       └── admin.js            # Admin dashboard metrics, sorting, registration manager
├── data/
│   └── events_seed.xlsx        # 14 seed events across 5 fest categories
├── requirements.txt            # Python dependencies (fastapi, uvicorn, pydantic, openpyxl)
├── zenith26-api.postman_collection.json # Exported Postman collection for API verification
├── Postman-Testing-Commands-Zenith26.md # Step-by-step test guide (18 test scenarios)
└── README.md                   # System documentation & setup guide
```

---

## 🚀 Getting Started

### 1. Setup Virtual Environment & Install Dependencies

From the `zenith26-fest-system/` directory:

```bash
# Create virtual environment
python3 -m venv .venv

# Activate virtual environment
# On macOS / Linux:
source .venv/bin/activate
# On Windows:
# .venv\Scripts\activate

# Install required packages
pip install -r requirements.txt
```

### 2. Run Database Seeding (Automatic on startup or standalone)

```bash
python -m backend.seed_data
```
*Note: Seeding also executes automatically on FastAPI startup if the `events` table is empty.*

### 3. Start the FastAPI Server

```bash
uvicorn backend.main:app --reload --port 8000
```

### 4. Access the Application

- **Student Event Portal:** [http://localhost:8000/](http://localhost:8000/)
- **Admin Command Dashboard:** [http://localhost:8000/admin.html](http://localhost:8000/admin.html)
- **Interactive Swagger API Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **Alternative ReDoc API Docs:** [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## 📡 REST API Contract

| HTTP Method | Path | Description | Key Status Codes |
|---|---|---|---|
| `GET` | `/api/events` | List all events with live `available_seats`. Supports `?category=` and `?search=` query parameters. | `200 OK` |
| `GET` | `/api/events/{event_id}` | Retrieve single event detail by ID. | `200 OK`, `404 Not Found` |
| `POST` | `/api/events/{event_id}/register` | Register a student for an event with server-side validation (non-empty fields, email formatting, capacity check, duplicate email check). | `201 Created`, `400 Bad Request`, `404 Not Found`, `409 Conflict` |
| `GET` | `/api/registrations` | Fetch raw registration ledger with joined event titles. Supports `?event_id=`. | `200 OK` |
| `GET` | `/api/stats` | Compute real-time dashboard analytics: total events, registrations, capacity, overall utilization %, upcoming count, category distribution. | `200 OK` |
| `POST` | `/api/events` *(Stretch)* | Admin endpoint to create a new fest event with server validation. | `201 Created`, `400 Bad Request` |
| `DELETE` | `/api/registrations/{id}` *(Stretch)* | Admin endpoint to cancel an existing registration and release the seat. | `200 OK`, `404 Not Found` |

---

## 🧪 Testing with Postman

1. Open Postman.
2. Click **Import** and select `zenith26-api.postman_collection.json`.
3. Set the environment variable `baseUrl` to `http://localhost:8000`.
4. Execute the tests in sequence or follow the companion guide in `Postman-Testing-Commands-Zenith26.md`.
