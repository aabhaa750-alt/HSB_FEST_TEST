from typing import Optional, Dict
from pydantic import BaseModel, Field

class EventOut(BaseModel):
    id: int
    title: str
    category: str
    description: Optional[str] = None
    event_date: str
    event_time: str
    venue: str
    capacity: int
    fee: int = 0
    icon: Optional[str] = None
    available_seats: int

class EventDetail(EventOut):
    """Event detail view shape, matching EventOut."""
    pass

class RegistrationIn(BaseModel):
    student_name: str
    roll_number: str
    email: str
    phone: Optional[str] = None

class RegistrationOut(BaseModel):
    id: int
    event_id: int
    student_name: str
    registered_at: str

class RegistrationListItem(BaseModel):
    id: int
    event_id: int
    student_name: str
    roll_number: str
    email: str
    phone: Optional[str] = None
    registered_at: str
    event_title: str

class StatsOut(BaseModel):
    total_events: int
    total_registrations: int
    total_capacity: int
    overall_utilization_pct: float
    upcoming_events_count: int
    events_by_category: Dict[str, int]

class EventCreate(BaseModel):
    title: str
    category: str
    description: Optional[str] = ""
    event_date: str
    event_time: str
    venue: str
    capacity: int = Field(gt=0, description="Capacity must be greater than 0")
    fee: int = Field(default=0, ge=0)
    icon: Optional[str] = "🎉"

class SettingsOut(BaseModel):
    santa_enabled: bool = True
    gifts_enabled: bool = True
    snow_enabled: bool = True
    lights_enabled: bool = True
    sound_enabled: bool = True
    music_enabled: bool = False
    flight_speed: str = "normal"
    flight_interval: int = 30
    gifts_count: int = 2
    countdown_enabled: bool = True
    countdown_title: str = "The Magic of Christmas Begins In..."
    festive_greeting: str = "Welcome to the Christmas Wonderland"
    theme_palette: str = "classic-red-green"

class SettingsUpdate(BaseModel):
    santa_enabled: Optional[bool] = None
    gifts_enabled: Optional[bool] = None
    snow_enabled: Optional[bool] = None
    lights_enabled: Optional[bool] = None
    sound_enabled: Optional[bool] = None
    music_enabled: Optional[bool] = None
    flight_speed: Optional[str] = None
    flight_interval: Optional[int] = Field(None, ge=10, le=120)
    gifts_count: Optional[int] = Field(None, ge=1, le=5)
    countdown_enabled: Optional[bool] = None
    countdown_title: Optional[str] = None
    festive_greeting: Optional[str] = None
    theme_palette: Optional[str] = None
