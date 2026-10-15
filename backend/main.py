from datetime import datetime, date
from pathlib import Path
from typing import List, Optional
import sqlite3

from fastapi import FastAPI, HTTPException, status, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from backend.database import get_db_connection, init_db, get_site_settings, update_site_settings
from backend.seed_data import seed_events
from backend.models import (
    EventOut,
    EventDetail,
    RegistrationIn,
    RegistrationOut,
    RegistrationListItem,
    StatsOut,
    EventCreate,
    SettingsOut,
    SettingsUpdate,
)

BASE_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIR = BASE_DIR / "frontend"

app = FastAPI(
    title="Zenith '26 College Fest API",
    description="Backend API for Zenith '26 College Fest Management System",
    version="1.0.0",
)

# Enable CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    """Ensure database schema is initialized and seeded on startup."""
    init_db()
    seed_events()

# --- API Endpoints ---

@app.get("/api/events", response_model=List[EventOut], tags=["Events"])
def get_events(
    category: Optional[str] = Query(None, description="Filter by event category"),
    search: Optional[str] = Query(None, description="Search by title (case-insensitive)"),
):
    """
    Returns list of events with available_seats computed live from registrations.
    Supports optional category filter and title search query.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    query = """
        SELECT e.*, 
               COALESCE(r_count.total_reg, 0) AS registered_count
        FROM events e
        LEFT JOIN (
            SELECT event_id, COUNT(*) AS total_reg
            FROM registrations
            GROUP BY event_id
        ) r_count ON e.id = r_count.event_id
        WHERE 1=1
    """
    params = []

    if category and category.strip().lower() != "all":
        query += " AND LOWER(e.category) = LOWER(?)"
        params.append(category.strip())

    if search and search.strip():
        query += " AND LOWER(e.title) LIKE LOWER(?)"
        params.append(f"%{search.strip()}%")

    query += " ORDER BY e.id ASC"

    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()

    events = []
    for row in rows:
        capacity = row["capacity"]
        reg_count = row["registered_count"]
        available_seats = max(0, capacity - reg_count)
        events.append(
            EventOut(
                id=row["id"],
                title=row["title"],
                category=row["category"],
                description=row["description"],
                event_date=row["event_date"],
                event_time=row["event_time"],
                venue=row["venue"],
                capacity=capacity,
                fee=row["fee"],
                icon=row["icon"],
                available_seats=available_seats,
            )
        )
    return events


@app.get("/api/events/{event_id}", response_model=EventDetail, tags=["Events"])
def get_event_detail(event_id: int):
    """Returns single event detail with live computed available_seats, or 404 if not found."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT e.*, 
               COALESCE(r_count.total_reg, 0) AS registered_count
        FROM events e
        LEFT JOIN (
            SELECT event_id, COUNT(*) AS total_reg
            FROM registrations
            GROUP BY event_id
        ) r_count ON e.id = r_count.event_id
        WHERE e.id = ?
    """, (event_id,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Event with id {event_id} not found",
        )

    capacity = row["capacity"]
    reg_count = row["registered_count"]
    available_seats = max(0, capacity - reg_count)

    return EventDetail(
        id=row["id"],
        title=row["title"],
        category=row["category"],
        description=row["description"],
        event_date=row["event_date"],
        event_time=row["event_time"],
        venue=row["venue"],
        capacity=capacity,
        fee=row["fee"],
        icon=row["icon"],
        available_seats=available_seats,
    )


@app.post(
    "/api/events/{event_id}/register",
    response_model=RegistrationOut,
    status_code=status.HTTP_201_CREATED,
    tags=["Registrations"],
)
def register_for_event(event_id: int, reg_data: RegistrationIn):
    """
    Registers a student for an event with strict server-side validation.
    Checks:
      - event_id exists (404)
      - student_name, roll_number, email non-empty (400)
      - email contains '@' (400)
      - event capacity not exceeded (409 'Event is full')
      - email not already registered for this event (409 'Already registered')
    """
    student_name = reg_data.student_name.strip()
    roll_number = reg_data.roll_number.strip()
    email = reg_data.email.strip()
    phone = reg_data.phone.strip() if reg_data.phone else None

    # Server-side validation
    if not student_name or not roll_number or not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student name, roll number, and email must not be empty",
        )

    if "@" not in email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email: email must contain '@'",
        )

    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Check if event exists
    cursor.execute("SELECT id, capacity FROM events WHERE id = ?", (event_id,))
    event_row = cursor.fetchone()
    if not event_row:
        conn.close()
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Event with id {event_id} not found",
        )

    capacity = event_row["capacity"]

    # 2. Check if already registered
    cursor.execute(
        "SELECT id FROM registrations WHERE event_id = ? AND LOWER(email) = LOWER(?)",
        (event_id, email),
    )
    existing_reg = cursor.fetchone()
    if existing_reg:
        conn.close()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Already registered",
        )

    # 3. Check capacity
    cursor.execute("SELECT COUNT(*) AS count FROM registrations WHERE event_id = ?", (event_id,))
    current_count = cursor.fetchone()["count"]
    if current_count >= capacity:
        conn.close()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Event is full",
        )

    # Insert registration
    registered_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    cursor.execute("""
        INSERT INTO registrations (event_id, student_name, roll_number, email, phone, registered_at)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (event_id, student_name, roll_number, email, phone, registered_at))
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()

    return RegistrationOut(
        id=new_id,
        event_id=event_id,
        student_name=student_name,
        registered_at=registered_at,
    )


@app.get("/api/registrations", response_model=List[RegistrationListItem], tags=["Registrations"])
def get_registrations(event_id: Optional[int] = Query(None, description="Filter registrations by event_id")):
    """Returns list of student registrations including event title for admin dashboard."""
    conn = get_db_connection()
    cursor = conn.cursor()

    query = """
        SELECT r.id, r.event_id, r.student_name, r.roll_number, r.email, r.phone, r.registered_at,
               e.title AS event_title
        FROM registrations r
        JOIN events e ON r.event_id = e.id
        WHERE 1=1
    """
    params = []
    if event_id is not None:
        query += " AND r.event_id = ?"
        params.append(event_id)

    query += " ORDER BY r.id DESC"

    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()

    return [
        RegistrationListItem(
            id=row["id"],
            event_id=row["event_id"],
            student_name=row["student_name"],
            roll_number=row["roll_number"],
            email=row["email"],
            phone=row["phone"],
            registered_at=row["registered_at"],
            event_title=row["event_title"],
        )
        for row in rows
    ]


@app.get("/api/stats", response_model=StatsOut, tags=["Stats"])
def get_stats():
    """
    Returns computed live stats from database:
    total_events, total_registrations, total_capacity,
    overall_utilization_pct, upcoming_events_count, events_by_category.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) AS total_events, COALESCE(SUM(capacity), 0) AS total_capacity FROM events")
    ev_stats = cursor.fetchone()
    total_events = ev_stats["total_events"]
    total_capacity = ev_stats["total_capacity"]

    cursor.execute("SELECT COUNT(*) AS total_registrations FROM registrations")
    total_registrations = cursor.fetchone()["total_registrations"]

    # Utilization %
    if total_capacity > 0:
        overall_utilization_pct = round((total_registrations / total_capacity) * 100, 1)
    else:
        overall_utilization_pct = 0.0

    # Upcoming events count (events with event_date today or later)
    today_str = date.today().isoformat()
    cursor.execute("SELECT COUNT(*) AS count FROM events WHERE event_date >= ?", (today_str,))
    upcoming_events_count = cursor.fetchone()["count"]

    # Events breakdown by category
    cursor.execute("SELECT category, COUNT(*) AS count FROM events GROUP BY category ORDER BY category ASC")
    cat_rows = cursor.fetchall()
    events_by_category = {row["category"]: row["count"] for row in cat_rows}

    conn.close()

    return StatsOut(
        total_events=total_events,
        total_registrations=total_registrations,
        total_capacity=total_capacity,
        overall_utilization_pct=overall_utilization_pct,
        upcoming_events_count=upcoming_events_count,
        events_by_category=events_by_category,
    )


# --- Stretch Goals Endpoints ---

@app.post("/api/events", response_model=EventOut, status_code=status.HTTP_201_CREATED, tags=["Admin Stretch"])
def create_event(event_data: EventCreate):
    """Stretch goal: Admin creates a new event with server-side validation."""
    title = event_data.title.strip()
    category = event_data.category.strip()
    event_date = event_data.event_date.strip()
    event_time = event_data.event_time.strip()
    venue = event_data.venue.strip()

    if not title or not category or not event_date or not event_time or not venue:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Title, category, event_date, event_time, and venue are required",
        )

    if event_data.capacity <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Capacity must be greater than 0",
        )

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO events (title, category, description, event_date, event_time, venue, capacity, fee, icon)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        title,
        category,
        event_data.description.strip() if event_data.description else "",
        event_date,
        event_time,
        venue,
        event_data.capacity,
        event_data.fee,
        event_data.icon or "🎉",
    ))
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()

    return EventOut(
        id=new_id,
        title=title,
        category=category,
        description=event_data.description,
        event_date=event_date,
        event_time=event_time,
        venue=venue,
        capacity=event_data.capacity,
        fee=event_data.fee,
        icon=event_data.icon or "🎉",
        available_seats=event_data.capacity,
    )


@app.delete("/api/registrations/{registration_id}", tags=["Admin Stretch"])
def delete_registration(registration_id: int):
    """Stretch goal: Admin cancels a registration."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT id, event_id FROM registrations WHERE id = ?", (registration_id,))
    reg = cursor.fetchone()
    if not reg:
        conn.close()
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Registration with id {registration_id} not found",
        )

    cursor.execute("DELETE FROM registrations WHERE id = ?", (registration_id,))
    conn.commit()
    conn.close()

    return {"message": "Registration cancelled successfully", "id": registration_id}


# --- Christmas Experience & Animation Settings Endpoints ---

@app.get("/api/settings", response_model=SettingsOut, tags=["Settings"])
def get_settings():
    """Retrieve Christmas experience settings (Santa, gifts, snow, countdown, theme)."""
    return get_site_settings()


@app.put("/api/settings", response_model=SettingsOut, tags=["Settings"])
def update_settings(payload: SettingsUpdate):
    """Admin updates Christmas experience and animation settings in SQLite."""
    updated = update_site_settings(payload.dict(exclude_unset=True))
    return updated


# --- Static Files / Frontend Mount (Step 4) ---

@app.api_route("/", methods=["GET", "HEAD"], include_in_schema=False)
def serve_root():
    """Serves frontend/index.html on root path."""
    index_file = FRONTEND_DIR / "index.html"
    if index_file.is_file():
        return FileResponse(index_file)
    return {"message": "Zenith '26 API is running"}


@app.api_route("/admin.html", methods=["GET", "HEAD"], include_in_schema=False)
def serve_admin():
    """Serves frontend/admin.html."""
    admin_file = FRONTEND_DIR / "admin.html"
    if admin_file.is_file():
        return FileResponse(admin_file)
    raise HTTPException(status_code=404, detail="admin.html not found")


if (FRONTEND_DIR / "js").exists():
    app.mount("/js", StaticFiles(directory=str(FRONTEND_DIR / "js")), name="js")
