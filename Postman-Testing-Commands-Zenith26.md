# Postman Testing Commands: Zenith '26 College Fest Management System

This guide outlines the 18 API test requests to run against the Zenith '26 FastAPI backend using Postman or `curl`.

Base URL: `http://localhost:8081`

---

## 1. Events Endpoints

### 1.1 List All Events
- **Method:** `GET`
- **URL:** `http://localhost:8081/api/events`
- **Expected Status:** `200 OK`
- **Check:** Returns array of 14 events with `available_seats` computed.

### 1.2 Filter Events by Category (Technical)
- **Method:** `GET`
- **URL:** `http://localhost:8081/api/events?category=Technical`
- **Expected Status:** `200 OK`
- **Check:** Returns 4 technical events (Code Sprint 2.0, Robo Race, AI Pitch Fest, Web Design Rumble).

### 1.3 Filter Events by Category (Cultural)
- **Method:** `GET`
- **URL:** `http://localhost:8081/api/events?category=Cultural`
- **Expected Status:** `200 OK`
- **Check:** Returns 5 cultural events.

### 1.4 Search Events by Title (Case-Insensitive Match)
- **Method:** `GET`
- **URL:** `http://localhost:8081/api/events?search=code`
- **Expected Status:** `200 OK`
- **Check:** Returns "Code Sprint 2.0" and "Intro to Vibe Coding".

### 1.5 Search with No Matches (Empty Array)
- **Method:** `GET`
- **URL:** `http://localhost:8081/api/events?search=nonexistentterm123`
- **Expected Status:** `200 OK`
- **Check:** Returns `[]`.

### 1.6 Get Single Event Detail (Success)
- **Method:** `GET`
- **URL:** `http://localhost:8081/api/events/1`
- **Expected Status:** `200 OK`
- **Check:** Returns single event object with `id: 1`, `title: "Code Sprint 2.0"`, and `available_seats`.

### 1.7 Get Single Event Detail (Not Found)
- **Method:** `GET`
- **URL:** `http://localhost:8081/api/events/999`
- **Expected Status:** `404 Not Found`
- **Response Body:** `{"detail": "Event with id 999 not found"}`

---

## 2. Registration Flow & Validation

### 2.1 Register Student (Success 201)
- **Method:** `POST`
- **URL:** `http://localhost:8081/api/events/1/register`
- **Headers:** `Content-Type: application/json`
- **Body:**
```json
{
  "student_name": "Aarav Sharma",
  "roll_number": "2026CS101",
  "email": "aarav.sharma@college.edu",
  "phone": "+91 9876543210"
}
```
- **Expected Status:** `201 Created`
- **Check:** Returns `id`, `event_id: 1`, `student_name`, and `registered_at`.

### 2.2 Verify Available Seats Decreased
- **Method:** `GET`
- **URL:** `http://localhost:8081/api/events/1`
- **Expected Status:** `200 OK`
- **Check:** `available_seats` is now `99` (reduced from 100).

### 2.3 Duplicate Registration Rejection (Conflict 409)
- **Method:** `POST`
- **URL:** `http://localhost:8081/api/events/1/register`
- **Headers:** `Content-Type: application/json`
- **Body:** Same body with `aarav.sharma@college.edu`
- **Expected Status:** `409 Conflict`
- **Response Body:** `{"detail": "Already registered"}`

### 2.4 Missing Student Name (Bad Request 400)
- **Method:** `POST`
- **URL:** `http://localhost:8081/api/events/1/register`
- **Headers:** `Content-Type: application/json`
- **Body:**
```json
{
  "student_name": "",
  "roll_number": "2026CS102",
  "email": "test@college.edu"
}
```
- **Expected Status:** `400 Bad Request`
- **Response Body:** `{"detail": "Student name, roll number, and email must not be empty"}`

### 2.5 Invalid Email Missing '@' (Bad Request 400)
- **Method:** `POST`
- **URL:** `http://localhost:8081/api/events/1/register`
- **Headers:** `Content-Type: application/json`
- **Body:**
```json
{
  "student_name": "Priya Patel",
  "roll_number": "2026CS103",
  "email": "priya.college.edu"
}
```
- **Expected Status:** `400 Bad Request`
- **Response Body:** `{"detail": "Invalid email: email must contain '@'"}`

### 2.6 Non-Existent Event Registration (Not Found 404)
- **Method:** `POST`
- **URL:** `http://localhost:8081/api/events/999/register`
- **Headers:** `Content-Type: application/json`
- **Body:**
```json
{
  "student_name": "Rohan Verma",
  "roll_number": "2026CS104",
  "email": "rohan@college.edu"
}
```
- **Expected Status:** `404 Not Found`
- **Response Body:** `{"detail": "Event with id 999 not found"}`

---

## 3. Admin & Reporting Endpoints

### 3.1 List All Registrations
- **Method:** `GET`
- **URL:** `http://localhost:8081/api/registrations`
- **Expected Status:** `200 OK`
- **Check:** Returns list of registrations with joined `event_title`.

### 3.2 Filter Registrations by Event ID
- **Method:** `GET`
- **URL:** `http://localhost:8081/api/registrations?event_id=1`
- **Expected Status:** `200 OK`
- **Check:** Returns only registrations for event 1.

### 3.3 Fetch Real-Time Fest Stats
- **Method:** `GET`
- **URL:** `http://localhost:8081/api/stats`
- **Expected Status:** `200 OK`
- **Check:**
```json
{
  "total_events": 14,
  "total_registrations": 1,
  "total_capacity": 1467,
  "overall_utilization_pct": 0.1,
  "upcoming_events_count": 14,
  "events_by_category": {
    "Cultural": 5,
    "Gaming": 1,
    "Sports": 2,
    "Technical": 4,
    "Workshop": 2
  }
}
```

---

## 4. Stretch Goals: Admin CRUD

### 4.1 Admin Create Event (Success 201)
- **Method:** `POST`
- **URL:** `http://localhost:8081/api/events`
- **Headers:** `Content-Type: application/json`
- **Body:**
```json
{
  "title": "Drone Racing Cup",
  "category": "Technical",
  "description": "High-speed drone obstacle navigation in enclosed arena.",
  "event_date": "2026-11-14",
  "event_time": "03:00 PM",
  "venue": "Campus Oval",
  "capacity": 30,
  "fee": 0,
  "icon": "🚁"
}
```
- **Expected Status:** `201 Created`

### 4.2 Admin Cancel Registration (Success 200)
- **Method:** `DELETE`
- **URL:** `http://localhost:8081/api/registrations/1`
- **Expected Status:** `200 OK`
- **Response Body:** `{"message": "Registration cancelled successfully", "id": 1}`
