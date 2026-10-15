# Zenith ’26 Fest Management System — Native Android Kotlin App

A native Android mobile application conversion of the **Zenith ’26 College Fest Management System**, built using **Kotlin** and **Jetpack Compose**.

This implementation strictly preserves:
- **Exact UI Design & Styling**: Pixel-accurate reproduction of all Tailwind CSS colors, typography, card layouts, category badges, full-capacity indicators, >90% warning states, modal forms, and admin dashboard tables.
- **Backend Architecture**: The existing Python + FastAPI backend, SQLite database (`fest.db`), seed-data mechanism (`data/events_seed.xlsx` with `openpyxl`), and Postman testing suite remain 100% unchanged.
- **API Contracts**: All endpoint paths, query parameters, request bodies, response models, HTTP status codes, and server-side validation error messages are preserved.

---

## 1. Project Architecture

```
zenith new folder/
├── backend/                       # Python FastAPI Backend (UNCHANGED)
│   ├── main.py                    # API routes, CORS, validation logic
│   ├── models.py                  # Pydantic schemas (EventOut, StatsOut, etc.)
│   ├── database.py                # SQLite connection and schema init
│   └── seed_data.py               # Excel seed loader (14 fest events)
├── data/
│   └── events_seed.xlsx           # 14 Seed events spreadsheet
├── fest.db                        # SQLite database file
├── frontend/                      # Original web frontend (HTML/Tailwind/JS)
├── requirements.txt               # Backend dependencies
├── zenith26-api.postman_collection.json # API Postman collection
├── Postman-Testing-Commands-Zenith26.md # Testing guide
│
└── android/                       # Native Android Application (Kotlin)
    ├── build.gradle.kts           # Root Gradle build script
    ├── settings.gradle.kts        # Module settings
    ├── gradlew / gradlew.bat      # Gradle 8.7 wrapper
    └── app/
        ├── build.gradle.kts       # App module dependencies (Compose, Retrofit, etc.)
        └── src/
            ├── main/
            │   ├── AndroidManifest.xml # Internet permissions & Cleartext config
            │   ├── res/           # Colors, themes, drawables, network security config
            │   └── java/com/zenith26/fest/
            │       ├── MainActivity.kt        # Main activity & screen switching
            │       ├── ZenithApp.kt           # Application class & config init
            │       ├── data/
            │       │   ├── models/            # Event, Registration, Stats models
            │       │   └── api/               # Retrofit service & ApiConfig
            │       └── ui/
            │           ├── theme/             # Color palette & Typography
            │           ├── components/        # TopNavBar, Badges, Error, Empty states
            │           └── screens/
            │               ├── student/       # Hero, Search, Cards, Detail modal
            │               └── admin/         # Stats cards, Matrix table, Regs ledger
            └── test/                          # JUnit unit test suite
```

---

## 2. UI Design System Preservation

| Component | Web Design (HTML/Tailwind) | Native Android (Kotlin Compose) |
|---|---|---|
| **Top Navbar** | `bg-slate-900 border-slate-800` | `Slate900` (`#0F172A`) with top bar & gear settings |
| **Hero Gradient** | Slate-900 → Purple-950 → Indigo-950 | `Brush.verticalGradient(Slate900, Purple950, Indigo950)` |
| **Zenith ’26 Title** | Gradient Purple-400 → Pink-400 → Amber-300 | `Brush.horizontalGradient(Purple400, Pink400, Amber300)` |
| **Card Radii & Spacing** | `rounded-2xl shadow-sm border-slate-200` | `RoundedCornerShape(16.dp)`, `Slate200` border, elevation |
| **Category Badges** | Blue, Fuchsia, Emerald, Amber, Cyan pills | Domain-specific `CategoryBadge` composables |
| **Availability Bar** | Purple bar (`Amber` >80%, `Rose` if FULL) | Exact threshold-colored `LinearProgressIndicator` |
| **FULL Indicator** | `bg-rose-100 text-rose-600 font-extrabold` | `Rose100` badge with bold uppercase `FULL` label |
| **Warning >90%** | `bg-rose-50/70 text-rose-700` pulse alert | `Rose50` row background with `Critical >90%` badge |
| **Registration Form** | Inline errors for missing name/roll/email | Exact inline error messages + live server alert box |
| **Admin Matrix** | Sorted by utilization % descending | Descending sort with horizontal scroll support |

---

## 3. How to Run the Backend

1. **Activate the virtual environment and start FastAPI**:
   ```bash
   source .venv/bin/activate
   uvicorn backend.main:app --port 8081 --reload
   ```

2. **Verify Backend Health**:
   - Web Portal: [http://localhost:8081/](http://localhost:8081/)
   - Admin Dashboard: [http://localhost:8081/admin.html](http://localhost:8081/admin.html)
   - Interactive API Docs: [http://localhost:8081/docs](http://localhost:8081/docs)

---

## 4. How to Build & Run the Android Application

### Prerequisites
- JDK 17 (`export JAVA_HOME="/opt/homebrew/opt/openjdk@17"`)
- Android SDK 34 (`export ANDROID_HOME="/Users/aabhaagrawal/Library/Android/sdk"`)

### Option A: From Command Line
1. **Build the Debug APK**:
   ```bash
   cd android
   ./gradlew assembleDebug
   ```
   The compiled APK is generated at:
   `android/app/build/outputs/apk/debug/app-debug.apk`

2. **Run Unit Tests**:
   ```bash
   cd android
   ./gradlew test
   ```

3. **Install on Connected Device or Emulator**:
   ```bash
   adb install -r app/build/outputs/apk/debug/app-debug.apk
   ```

### Option B: From Android Studio
1. Open Android Studio.
2. Select **Open** and select the `/Users/aabhaagrawal/Music/zenith new folder/android` folder.
3. Click **Sync Project with Gradle Files**.
4. Select your target device (Emulator or Physical phone) and click **Run (▶)**.

---

## 5. Configuring the Backend URL

Android applications cannot reach `localhost:8081` directly because `localhost` refers to the Android device itself.

### 1. Android Emulator (Default)
- **URL**: `http://10.0.2.2:8081/`
- The Android app is pre-configured with `http://10.0.2.2:8081/` by default. It connects directly to your computer's FastAPI server.

### 2. Physical Android Device (Over Wi-Fi)
- Find your computer's local IP address (`ipconfig getifaddr en0` on macOS).
- Tap the **Settings (⚙️)** icon in the app's top navigation bar.
- Enter `http://<your-ip>:8081/` (e.g. `http://192.168.1.15:8081/`) and tap **Save & Connect**.

### 3. ADB Reverse Proxy (Over USB)
If using a physical device connected via USB:
```bash
adb reverse tcp:8081 tcp:8081
```
Then select **Localhost (http://localhost:8081/)** in the app's Settings dialog.

---

## 6. API Endpoints & Contracts

All endpoints strictly preserve their original contract:

| Method | Endpoint | Query / Body Params | Response Model | Description |
|---|---|---|---|---|
| `GET` | `/api/events` | `category` (optional), `search` (optional) | `List[EventOut]` | Available seats computed live from SQLite |
| `GET` | `/api/events/{event_id}` | `event_id` in path | `EventDetail` | Single event details (404 if missing) |
| `POST` | `/api/events/{event_id}/register` | `RegistrationIn` body | `RegistrationOut` (201) | Strict validation: non-empty, `@` in email, capacity (409), duplicate (409) |
| `GET` | `/api/registrations` | `event_id` (optional filter) | `List[RegistrationListItem]` | Registration ledger with event title |
| `GET` | `/api/stats` | None | `StatsOut` | Live computed counts, utilization %, and categories |
| `POST` | `/api/events` | `EventCreate` body | `EventOut` (201) | Admin capability to create events |
| `DELETE` | `/api/registrations/{id}`| `registration_id` in path | JSON confirmation | Admin capability to cancel registration |

---

## 7. Verification & Testing Completed

1. **Gradle Build Verification**: Clean compilation and APK generation (`app-debug.apk`, 16MB) completed with `./gradlew assembleDebug`.
2. **Unit Test Verification**: All JUnit tests passed with `./gradlew test`.
3. **Database & Seeding**: All 14 seeded events load from `data/events_seed.xlsx` into `fest.db`.
4. **Search & Filters**: `GET /api/events?category=Technical` and `GET /api/events?search=code` tested against the real database.
5. **Registration Flow**: Successful registration returns 201, reduces available seats immediately, and rejects duplicate registration with HTTP 409 (`"Already registered"`).
6. **Error States**: Handled 400 (validation), 404 (event not found), and 409 (conflict) displaying exact server messages.
7. **Admin Dashboard**: Live computed metrics, category distribution, descending utilization sort, and >90% warning badges verified.
