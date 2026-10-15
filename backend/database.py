import sqlite3
from pathlib import Path

import os
import shutil

# Path to fest.db in project root
BASE_DB_PATH = Path(__file__).resolve().parent.parent / "fest.db"

def get_db_path() -> Path:
    """Returns DB path. On Vercel serverless, copies to writable /tmp."""
    if os.environ.get("VERCEL"):
        tmp_db = Path("/tmp/fest.db")
        if not tmp_db.exists() and BASE_DB_PATH.exists():
            shutil.copy2(BASE_DB_PATH, tmp_db)
        return tmp_db
    return BASE_DB_PATH

DB_PATH = BASE_DB_PATH

def get_db_connection():
    """Connects to SQLite database fest.db and configures row factory."""
    conn = sqlite3.connect(get_db_path())
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn

def init_db():
    """Initializes SQLite schema for events and registrations tables."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        description TEXT,
        event_date TEXT NOT NULL,
        event_time TEXT NOT NULL,
        venue TEXT NOT NULL,
        capacity INTEGER NOT NULL,
        fee INTEGER NOT NULL DEFAULT 0,
        icon TEXT
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS registrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_id INTEGER NOT NULL REFERENCES events(id),
        student_name TEXT NOT NULL,
        roll_number TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        registered_at TEXT NOT NULL,
        UNIQUE(event_id, email)
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS site_settings (
        id INTEGER PRIMARY KEY,
        santa_enabled INTEGER DEFAULT 1,
        gifts_enabled INTEGER DEFAULT 1,
        snow_enabled INTEGER DEFAULT 1,
        lights_enabled INTEGER DEFAULT 1,
        sound_enabled INTEGER DEFAULT 1,
        music_enabled INTEGER DEFAULT 0,
        flight_speed TEXT DEFAULT 'normal',
        flight_interval INTEGER DEFAULT 30,
        gifts_count INTEGER DEFAULT 2,
        countdown_enabled INTEGER DEFAULT 1,
        countdown_title TEXT DEFAULT 'The Magic of Christmas Begins In...',
        festive_greeting TEXT DEFAULT 'Welcome to the Christmas Wonderland',
        theme_palette TEXT DEFAULT 'classic-red-green'
    )
    """)

    # Ensure any missing columns are added if site_settings was previously created with fewer columns
    cursor.execute("PRAGMA table_info(site_settings)")
    existing_cols = [c[1] for c in cursor.fetchall()]
    new_cols = {
        "sound_enabled": "INTEGER DEFAULT 1",
        "music_enabled": "INTEGER DEFAULT 0",
        "flight_speed": "TEXT DEFAULT 'normal'",
        "gifts_count": "INTEGER DEFAULT 2",
    }
    for col, col_def in new_cols.items():
        if col not in existing_cols:
            cursor.execute(f"ALTER TABLE site_settings ADD COLUMN {col} {col_def}")

    cursor.execute("""
    INSERT OR IGNORE INTO site_settings (
        id, santa_enabled, gifts_enabled, snow_enabled, lights_enabled,
        sound_enabled, music_enabled, flight_speed, flight_interval, gifts_count,
        countdown_enabled, countdown_title, festive_greeting, theme_palette
    ) VALUES (
        1, 1, 1, 1, 1, 1, 0, 'normal', 30, 2, 1, 'The Magic of Christmas Begins In...',
        'Welcome to the Christmas Wonderland', 'classic-red-green'
    )
    """)

    conn.commit()
    conn.close()

def get_site_settings() -> dict:
    """Retrieves the current Christmas site settings from SQLite."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM site_settings WHERE id = 1")
    row = cursor.fetchone()
    if not row:
        init_db()
        cursor.execute("SELECT * FROM site_settings WHERE id = 1")
        row = cursor.fetchone()
    conn.close()

    # Safe lookup helper with defaults
    def val(k, default):
        try:
            v = row[k]
            return v if v is not None else default
        except (IndexError, KeyError):
            return default

    return {
        "santa_enabled": bool(val("santa_enabled", 1)),
        "gifts_enabled": bool(val("gifts_enabled", 1)),
        "snow_enabled": bool(val("snow_enabled", 1)),
        "lights_enabled": bool(val("lights_enabled", 1)),
        "sound_enabled": bool(val("sound_enabled", 1)),
        "music_enabled": bool(val("music_enabled", 0)),
        "flight_speed": str(val("flight_speed", "normal")),
        "flight_interval": int(val("flight_interval", 30)),
        "gifts_count": int(val("gifts_count", 2)),
        "countdown_enabled": bool(val("countdown_enabled", 1)),
        "countdown_title": str(val("countdown_title", "The Magic of Christmas Begins In...")),
        "festive_greeting": str(val("festive_greeting", "Welcome to the Christmas Wonderland")),
        "theme_palette": str(val("theme_palette", "classic-red-green")),
    }

def update_site_settings(new_settings: dict) -> dict:
    """Updates the Christmas site settings in SQLite."""
    current = get_site_settings()
    for k, v in new_settings.items():
        if v is not None:
            current[k] = v

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE site_settings SET
            santa_enabled = ?,
            gifts_enabled = ?,
            snow_enabled = ?,
            lights_enabled = ?,
            sound_enabled = ?,
            music_enabled = ?,
            flight_speed = ?,
            flight_interval = ?,
            gifts_count = ?,
            countdown_enabled = ?,
            countdown_title = ?,
            festive_greeting = ?,
            theme_palette = ?
        WHERE id = 1
    """, (
        1 if current["santa_enabled"] else 0,
        1 if current["gifts_enabled"] else 0,
        1 if current["snow_enabled"] else 0,
        1 if current["lights_enabled"] else 0,
        1 if current["sound_enabled"] else 0,
        1 if current["music_enabled"] else 0,
        current["flight_speed"],
        current["flight_interval"],
        current["gifts_count"],
        1 if current["countdown_enabled"] else 0,
        current["countdown_title"],
        current["festive_greeting"],
        current["theme_palette"],
    ))
    conn.commit()
    conn.close()
    return current

if __name__ == "__main__":
    init_db()
    print("Database initialized successfully at", DB_PATH)
