// Zenith '26 - Admin Command Dashboard (admin.js)

let cachedEvents = [];
let activeTab = "events"; // 'events' or 'regs'

// DOM Elements
const statTotalEvents = document.getElementById("stat-total-events");
const statTotalRegistrations = document.getElementById("stat-total-registrations");
const statOverallUtilization = document.getElementById("stat-overall-utilization");
const statCapacitySubtext = document.getElementById("stat-capacity-subtext");
const statUtilizationBar = document.getElementById("stat-utilization-bar");
const statUpcomingEvents = document.getElementById("stat-upcoming-events");
const categoriesBreakdownRow = document.getElementById("categories-breakdown-row");

const statsErrorBanner = document.getElementById("stats-error-banner");
const statsErrorText = document.getElementById("stats-error-text");
const refreshDashboardBtn = document.getElementById("refresh-dashboard-btn");

// View Switching
const tabEventsBtn = document.getElementById("tab-events-btn");
const tabRegsBtn = document.getElementById("tab-regs-btn");
const viewEventsTable = document.getElementById("view-events-table");
const viewRegistrationsTable = document.getElementById("view-registrations-table");

// Events Table
const eventsTableBody = document.getElementById("events-table-body");
const eventsTableLoading = document.getElementById("events-table-loading");
const eventsTableEmpty = document.getElementById("events-table-empty");

// Registrations Table
const registrationsTableBody = document.getElementById("registrations-table-body");
const regsTableLoading = document.getElementById("regs-table-loading");
const regsTableEmpty = document.getElementById("regs-table-empty");
const filterRegEvent = document.getElementById("filter-reg-event");

// Stretch Goal: Add Event Modal
const openAddEventBtn = document.getElementById("open-add-event-btn");
const closeAddEventBtn = document.getElementById("close-add-event-btn");
const cancelAddEventBtn = document.getElementById("cancel-add-event-btn");
const addEventModal = document.getElementById("add-event-modal");
const addEventForm = document.getElementById("add-event-form");
const addEventAlert = document.getElementById("add-event-alert");

// Helper: Badge classes
function getCategoryBadge(category) {
  const cat = (category || "").toLowerCase();
  switch (cat) {
    case "technical":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "cultural":
      return "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200";
    case "sports":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "gaming":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "workshop":
      return "bg-cyan-100 text-cyan-700 border-cyan-200";
    default:
      return "bg-purple-100 text-purple-700 border-purple-200";
  }
}

// 1. Fetch & Render Stats (Step 8)
async function fetchStats() {
  statsErrorBanner.classList.add("hidden");

  try {
    const res = await fetch("/api/stats");
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    const stats = await res.json();

    statTotalEvents.textContent = stats.total_events;
    statTotalRegistrations.textContent = stats.total_registrations;
    statOverallUtilization.textContent = `${stats.overall_utilization_pct}%`;
    statCapacitySubtext.textContent = `of ${stats.total_capacity} total seats`;
    statUtilizationBar.style.width = `${Math.min(100, stats.overall_utilization_pct)}%`;
    statUpcomingEvents.textContent = stats.upcoming_events_count;

    renderCategoryBreakdown(stats.events_by_category);
  } catch (err) {
    console.error("Error loading stats:", err);
    statsErrorBanner.classList.remove("hidden");
    statsErrorText.textContent = `Could not fetch live metrics: ${err.message}. Is backend running on port 8081?`;
  }
}

// Render category breakdown cards (Step 8)
function renderCategoryBreakdown(categories) {
  if (!categories || Object.keys(categories).length === 0) {
    categoriesBreakdownRow.innerHTML = `<p class="col-span-full text-xs text-slate-400">No categories registered.</p>`;
    return;
  }

  const entries = Object.entries(categories);
  categoriesBreakdownRow.innerHTML = entries.map(([category, count]) => {
    const badge = getCategoryBadge(category);
    return `
      <div class="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between">
        <div>
          <span class="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${badge}">
            ${category}
          </span>
          <p class="text-xs text-slate-500 mt-1">Domain</p>
        </div>
        <span class="text-2xl font-black text-slate-800">${count}</span>
      </div>
    `;
  }).join("");
}

// 2. Fetch & Render Events Matrix (Step 8 & 9)
async function fetchEventsTable() {
  eventsTableLoading.classList.remove("hidden");
  eventsTableEmpty.classList.add("hidden");
  eventsTableBody.innerHTML = "";

  try {
    const res = await fetch("/api/events");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const events = await res.json();
    cachedEvents = events;

    populateEventDropdown(events);

    // Compute utilization % and sort descending (Step 8 requirement)
    events.forEach(ev => {
      const registered = ev.capacity - ev.available_seats;
      ev.registered_count = registered;
      ev.utilization_pct = ev.capacity > 0 ? (registered / ev.capacity) * 100 : 0;
    });

    events.sort((a, b) => b.utilization_pct - a.utilization_pct);

    renderEventsTable(events);
  } catch (err) {
    console.error("Error loading events matrix:", err);
    eventsTableEmpty.textContent = `Failed to load events: ${err.message}`;
    eventsTableEmpty.classList.remove("hidden");
  } finally {
    eventsTableLoading.classList.add("hidden");
  }
}

function renderEventsTable(events) {
  if (!events || events.length === 0) {
    eventsTableEmpty.classList.remove("hidden");
    return;
  }

  eventsTableBody.innerHTML = events.map(ev => {
    const pct = Math.round(ev.utilization_pct * 10) / 10;
    const isOver90 = pct >= 90;
    const badgeClass = getCategoryBadge(ev.category);

    return `
      <tr class="transition-colors ${isOver90 ? 'bg-rose-50/70 hover:bg-rose-100/60 font-medium' : 'hover:bg-slate-50/80'}">
        <td class="py-3 px-4">
          <div class="flex items-center gap-2.5">
            <span class="text-xl p-1.5 rounded-lg bg-white shadow-xs border border-slate-200 select-none">${ev.icon || '⚡'}</span>
            <div>
              <div class="font-bold text-slate-800 flex items-center gap-2">
                <span>${escapeHtml(ev.title)}</span>
                ${isOver90 ? '<span class="px-2 py-0.5 rounded text-[10px] font-black tracking-wide uppercase bg-rose-600 text-white animate-pulse">Critical &gt;90%</span>' : ''}
              </div>
              <div class="text-[11px] text-slate-400">ID #${ev.id} • ${ev.fee === 0 ? 'Free' : `₹${ev.fee}`}</div>
            </div>
          </div>
        </td>
        <td class="py-3 px-4">
          <span class="inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${badgeClass}">
            ${ev.category}
          </span>
        </td>
        <td class="py-3 px-4 text-slate-600 whitespace-nowrap">
          <div class="font-medium">${ev.event_date}</div>
          <div class="text-[11px] text-slate-400">${ev.event_time}</div>
        </td>
        <td class="py-3 px-4 text-slate-600 truncate max-w-[150px]">
          ${escapeHtml(ev.venue)}
        </td>
        <td class="py-3 px-4 text-center whitespace-nowrap">
          <span class="font-bold ${isOver90 ? 'text-rose-700' : 'text-slate-800'}">${ev.registered_count}</span>
          <span class="text-slate-400 font-normal"> / ${ev.capacity}</span>
        </td>
        <td class="py-3 px-4 text-right whitespace-nowrap">
          <div class="inline-flex items-center justify-end gap-2">
            <span class="font-extrabold ${isOver90 ? 'text-rose-700' : 'text-slate-800'}">${pct}%</span>
            <div class="w-16 bg-slate-200 rounded-full h-2 overflow-hidden">
              <div class="h-2 rounded-full ${isOver90 ? 'bg-rose-500' : pct > 75 ? 'bg-amber-500' : 'bg-purple-600'}" style="width: ${Math.min(100, pct)}%"></div>
            </div>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

// Populate Event dropdown in Registrations tab
function populateEventDropdown(events) {
  const currentVal = filterRegEvent.value;
  filterRegEvent.innerHTML = `<option value="">All Events (${events.length})</option>`;
  events.forEach(ev => {
    filterRegEvent.innerHTML += `<option value="${ev.id}">ID ${ev.id}: ${escapeHtml(ev.title)}</option>`;
  });
  filterRegEvent.value = currentVal;
}

// 3. Fetch & Render Registrations List (Step 8 & Stretch Goal)
async function fetchRegistrationsTable() {
  regsTableLoading.classList.remove("hidden");
  regsTableEmpty.classList.add("hidden");
  registrationsTableBody.innerHTML = "";

  const eventFilterVal = filterRegEvent.value;
  const url = eventFilterVal ? `/api/registrations?event_id=${eventFilterVal}` : "/api/registrations";

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const registrations = await res.json();

    if (!registrations || registrations.length === 0) {
      regsTableEmpty.classList.remove("hidden");
      return;
    }

    registrationsTableBody.innerHTML = registrations.map(reg => `
      <tr class="hover:bg-slate-50/80 transition-colors">
        <td class="py-3 px-4 font-mono font-bold text-slate-500 text-xs">#${reg.id}</td>
        <td class="py-3 px-4 font-semibold text-slate-800">${escapeHtml(reg.student_name)}</td>
        <td class="py-3 px-4 font-mono text-slate-600 text-xs">${escapeHtml(reg.roll_number)}</td>
        <td class="py-3 px-4 text-purple-700 font-medium">${escapeHtml(reg.email)}</td>
        <td class="py-3 px-4 text-slate-500 text-xs">${escapeHtml(reg.phone || '—')}</td>
        <td class="py-3 px-4">
          <span class="inline-block px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 font-medium text-xs">
            ${escapeHtml(reg.event_title)}
          </span>
        </td>
        <td class="py-3 px-4 text-slate-400 text-xs whitespace-nowrap">${reg.registered_at}</td>
        <td class="py-3 px-4 text-center">
          <button 
            onclick="cancelRegistration(${reg.id}, '${escapeHtml(reg.student_name)}', '${escapeHtml(reg.event_title)}')"
            class="px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-50 hover:bg-rose-100 active:bg-rose-200 text-rose-600 border border-rose-200 transition-colors"
            title="Cancel Registration"
          >
            Cancel
          </button>
        </td>
      </tr>
    `).join("");

  } catch (err) {
    console.error("Error loading registrations:", err);
    regsTableEmpty.textContent = `Failed to load registrations: ${err.message}`;
    regsTableEmpty.classList.remove("hidden");
  } finally {
    regsTableLoading.classList.add("hidden");
  }
}

// Stretch Goal: Cancel Registration
async function cancelRegistration(regId, studentName, eventTitle) {
  const confirmed = confirm(`Are you sure you want to cancel the registration for "${studentName}" in "${eventTitle}"? This will free up 1 seat.`);
  if (!confirmed) return;

  try {
    const res = await fetch(`/api/registrations/${regId}`, {
      method: "DELETE"
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(`Error cancelling registration: ${err.detail || res.statusText}`);
      return;
    }

    // Refresh data immediately
    fetchStats();
    fetchEventsTable();
    fetchRegistrationsTable();
  } catch (err) {
    alert(`Network error: ${err.message}`);
  }
}

// Stretch Goal: Add New Event Form Submission
addEventForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  addEventAlert.classList.add("hidden");

  const title = document.getElementById("new-title").value.trim();
  const category = document.getElementById("new-category").value;
  const date = document.getElementById("new-date").value.trim();
  const time = document.getElementById("new-time").value.trim();
  const venue = document.getElementById("new-venue").value.trim();
  const capacity = parseInt(document.getElementById("new-capacity").value, 10);
  const fee = parseInt(document.getElementById("new-fee").value || "0", 10);
  const icon = document.getElementById("new-icon").value.trim() || "🎉";
  const description = document.getElementById("new-description").value.trim();

  try {
    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        category,
        description,
        event_date: date,
        event_time: time,
        venue,
        capacity,
        fee,
        icon
      })
    });

    const data = await res.json();
    if (res.status === 201) {
      addEventAlert.className = "mb-4 p-3 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200";
      addEventAlert.textContent = `Event "${data.title}" successfully added!`;
      addEventAlert.classList.remove("hidden");

      addEventForm.reset();
      document.getElementById("new-capacity").value = "50";
      document.getElementById("new-date").value = "2026-11-14";
      document.getElementById("new-time").value = "10:00 AM";

      fetchStats();
      fetchEventsTable();

      setTimeout(() => {
        addEventModal.classList.add("hidden");
        addEventAlert.classList.add("hidden");
      }, 1500);
    } else {
      addEventAlert.className = "mb-4 p-3 rounded-xl text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200";
      addEventAlert.textContent = data.detail || "Failed to create event.";
      addEventAlert.classList.remove("hidden");
    }
  } catch (err) {
    addEventAlert.className = "mb-4 p-3 rounded-xl text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200";
    addEventAlert.textContent = `Network error: ${err.message}`;
    addEventAlert.classList.remove("hidden");
  }
});

// Modal Open / Close handlers
openAddEventBtn.addEventListener("click", () => {
  addEventModal.classList.remove("hidden");
  addEventAlert.classList.add("hidden");
});
closeAddEventBtn.addEventListener("click", () => addEventModal.classList.add("hidden"));
cancelAddEventBtn.addEventListener("click", () => addEventModal.classList.add("hidden"));
addEventModal.addEventListener("click", (e) => {
  if (e.target === addEventModal) addEventModal.classList.add("hidden");
});

// ==========================================
// Christmas Experience Settings Controller
// ==========================================
const tabSettingsBtn = document.getElementById("tab-settings-btn");
const viewSettingsPanel = document.getElementById("view-settings-panel");
const christmasSettingsForm = document.getElementById("christmas-settings-form");
const settingsAlert = document.getElementById("settings-alert");
const saveSettingsBtn = document.getElementById("save-settings-btn");
const saveSettingsText = document.getElementById("save-settings-text");
const saveSettingsSpinner = document.getElementById("save-settings-spinner");
const previewSantaBtn = document.getElementById("preview-santa-btn");

const settingSantaEnabled = document.getElementById("setting-santa-enabled");
const settingFlightSpeed = document.getElementById("setting-flight-speed");
const settingFlightInterval = document.getElementById("setting-flight-interval");
const settingGiftsEnabled = document.getElementById("setting-gifts-enabled");
const settingGiftsCount = document.getElementById("setting-gifts-count");
const settingSnowEnabled = document.getElementById("setting-snow-enabled");
const settingLightsEnabled = document.getElementById("setting-lights-enabled");
const settingCountdownEnabled = document.getElementById("setting-countdown-enabled");
const settingCountdownTitle = document.getElementById("setting-countdown-title");
const settingFestiveGreeting = document.getElementById("setting-festive-greeting");

async function fetchChristmasSettings() {
  try {
    const res = await fetch("/api/settings");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const s = await res.json();

    if (settingSantaEnabled) settingSantaEnabled.checked = s.santa_enabled !== false;
    if (settingFlightSpeed) settingFlightSpeed.value = s.flight_speed || "normal";
    if (settingFlightInterval) settingFlightInterval.value = String(s.flight_interval || 30);
    if (settingGiftsEnabled) settingGiftsEnabled.checked = s.gifts_enabled !== false;
    if (settingGiftsCount) settingGiftsCount.value = String(s.gifts_count || 2);
    if (settingSnowEnabled) settingSnowEnabled.checked = s.snow_enabled !== false;
    if (settingLightsEnabled) settingLightsEnabled.checked = s.lights_enabled !== false;
    if (settingCountdownEnabled) settingCountdownEnabled.checked = s.countdown_enabled !== false;
    if (settingCountdownTitle) settingCountdownTitle.value = s.countdown_title || "";
    if (settingFestiveGreeting) settingFestiveGreeting.value = s.festive_greeting || "";
  } catch (err) {
    console.error("Failed to load Christmas settings:", err);
    showSettingsAlert(`Failed to load site settings: ${err.message}`, "error");
  }
}

async function saveChristmasSettings(e) {
  if (e) e.preventDefault();
  saveSettingsBtn.disabled = true;
  saveSettingsSpinner.classList.remove("hidden");
  saveSettingsText.textContent = "Saving to SQLite...";
  settingsAlert.classList.add("hidden");

  const payload = {
    santa_enabled: settingSantaEnabled.checked,
    flight_speed: settingFlightSpeed.value,
    flight_interval: parseInt(settingFlightInterval.value, 10),
    gifts_enabled: settingGiftsEnabled.checked,
    gifts_count: parseInt(settingGiftsCount.value, 10),
    snow_enabled: settingSnowEnabled.checked,
    lights_enabled: settingLightsEnabled.checked,
    countdown_enabled: settingCountdownEnabled.checked,
    countdown_title: settingCountdownTitle.value.trim(),
    festive_greeting: settingFestiveGreeting.value.trim(),
  };

  try {
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.detail || `Server error ${res.status}`);
    }

    const updated = await res.json();
    showSettingsAlert("✨ Christmas experience settings saved successfully to SQLite!", "success");
  } catch (err) {
    console.error("Failed to save settings:", err);
    showSettingsAlert(`Error saving settings: ${err.message}`, "error");
  } finally {
    saveSettingsBtn.disabled = false;
    saveSettingsSpinner.classList.add("hidden");
    saveSettingsText.textContent = "Save Christmas Settings";
  }
}

function showSettingsAlert(message, type) {
  settingsAlert.classList.remove("hidden", "bg-emerald-50", "text-emerald-800", "border-emerald-200", "bg-rose-50", "text-rose-800", "border-rose-200");
  if (type === "success") {
    settingsAlert.classList.add("bg-emerald-50", "text-emerald-800", "border-emerald-200");
  } else {
    settingsAlert.classList.add("bg-rose-50", "text-rose-800", "border-rose-200");
  }
  settingsAlert.textContent = message;
}

if (christmasSettingsForm) {
  christmasSettingsForm.addEventListener("submit", saveChristmasSettings);
}

// Live Preview of Santa Flight directly on Admin Dashboard
function previewSantaFlight() {
  const stage = document.getElementById("santa-stage");
  if (!stage) return;

  // Clean any existing flight
  const oldSanta = stage.querySelector(".preview-santa-wrapper");
  if (oldSanta) oldSanta.remove();

  const isMobile = window.innerWidth < 640;
  const stageWidth = window.innerWidth;
  const duration = 12; // 12 seconds preview

  const santaWrapper = document.createElement("div");
  santaWrapper.className = "preview-santa-wrapper absolute pointer-events-none select-none transition-none";
  santaWrapper.style.width = isMobile ? "240px" : "330px";
  santaWrapper.style.height = isMobile ? "75px" : "95px";
  santaWrapper.style.top = "40px";
  santaWrapper.style.left = "-360px";
  santaWrapper.style.zIndex = "60";
  santaWrapper.style.filter = "drop-shadow(0 6px 14px rgba(0,0,0,0.5))";

  santaWrapper.innerHTML = `
    <div class="sleigh-bob-motion w-full h-full">
      <svg viewBox="0 0 340 100" class="w-full h-full" overflow="visible" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="sleighGradAdmin" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#b91c1c"/>
            <stop offset="100%" stop-color="#7f1d1d"/>
          </linearGradient>
          <linearGradient id="goldGradAdmin" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#fde047"/>
            <stop offset="100%" stop-color="#d97706"/>
          </linearGradient>
        </defs>

        <path d="M 120 48 Q 170 38 215 42 Q 255 40 280 44" fill="none" stroke="url(#goldGradAdmin)" stroke-width="1.8" stroke-dasharray="3,1" opacity="0.85"/>

        <g transform="translate(180, 15)">
          <path d="M 25 35 Q 35 25 50 28 Q 62 30 65 38 Q 60 48 40 46 Q 25 46 25 35 Z" fill="#92400e"/>
          <path d="M 58 28 Q 68 18 78 22 Q 80 28 72 34 Q 62 35 58 28 Z" fill="#b45309"/>
          <path d="M 70 20 L 74 10 M 74 13 L 78 8 M 72 15 L 68 11" stroke="#fef08a" stroke-width="2" stroke-linecap="round"/>
          <circle cx="72" cy="24" r="1.5" fill="#1e293b"/>
          <circle cx="62" cy="35" r="2.5" fill="#facc15"/>
          <g class="deer-front-legs" style="transform-origin: 60px 42px;">
            <path d="M 60 42 Q 68 55 76 60" stroke="#78350f" stroke-width="3" stroke-linecap="round" fill="none"/>
            <path d="M 57 42 Q 63 53 70 58" stroke="#92400e" stroke-width="2.5" stroke-linecap="round" fill="none"/>
          </g>
          <g class="deer-back-legs" style="transform-origin: 30px 42px;">
            <path d="M 32 42 Q 22 55 14 58" stroke="#78350f" stroke-width="3" stroke-linecap="round" fill="none"/>
            <path d="M 35 42 Q 26 53 20 57" stroke="#92400e" stroke-width="2.5" stroke-linecap="round" fill="none"/>
          </g>
          <path d="M 25 35 Q 20 30 22 36" stroke="#92400e" stroke-width="3" stroke-linecap="round"/>
        </g>

        <g transform="translate(250, 8)">
          <path d="M 25 35 Q 35 25 50 28 Q 62 30 65 38 Q 60 48 40 46 Q 25 46 25 35 Z" fill="#92400e"/>
          <path d="M 58 28 Q 68 18 78 22 Q 80 28 72 34 Q 62 35 58 28 Z" fill="#b45309"/>
          <path d="M 70 20 L 75 8 M 75 12 L 80 7 M 72 14 L 67 9" stroke="#fde047" stroke-width="2.2" stroke-linecap="round"/>
          <circle cx="72" cy="24" r="1.5" fill="#1e293b"/>
          <circle cx="79" cy="26" r="3.5" fill="#ef4444" class="rudolph-nose"/>
          <path d="M 60 30 Q 64 36 62 42" stroke="#dc2626" stroke-width="2.5" fill="none"/>
          <circle cx="62" cy="36" r="2.5" fill="#facc15"/>
          <g class="deer-front-legs" style="transform-origin: 60px 42px;">
            <path d="M 60 42 Q 70 54 80 58" stroke="#78350f" stroke-width="3" stroke-linecap="round" fill="none"/>
            <path d="M 57 42 Q 65 52 73 57" stroke="#92400e" stroke-width="2.5" stroke-linecap="round" fill="none"/>
          </g>
          <g class="deer-back-legs" style="transform-origin: 30px 42px;">
            <path d="M 32 42 Q 20 54 12 56" stroke="#78350f" stroke-width="3" stroke-linecap="round" fill="none"/>
            <path d="M 36 42 Q 25 52 18 55" stroke="#92400e" stroke-width="2.5" stroke-linecap="round" fill="none"/>
          </g>
          <path d="M 25 35 Q 18 30 20 36" stroke="#92400e" stroke-width="3" stroke-linecap="round"/>
        </g>

        <g transform="translate(10, 18)">
          <ellipse cx="42" cy="42" rx="22" ry="18" fill="#854d0e" stroke="#ca8a04" stroke-width="1.5"/>
          <path d="M 32 30 Q 42 22 52 30" stroke="#fde047" stroke-width="2" fill="none"/>
          <rect x="36" y="22" width="12" height="12" rx="1.5" fill="#15803d" stroke="#facc15" stroke-width="1"/>
          <path d="M 42 22 L 42 34 M 36 28 L 48 28" stroke="#facc15" stroke-width="1"/>
          <rect x="46" y="25" width="10" height="10" rx="1.5" fill="#dc2626" stroke="#fde047" stroke-width="1"/>

          <g transform="translate(62, 10)">
            <path d="M 10 32 C 10 24 24 24 24 32 L 27 48 L 5 48 Z" fill="#dc2626"/>
            <rect x="4" y="46" width="24" height="4" rx="2" fill="#ffffff"/>
            <rect x="6" y="38" width="20" height="4" fill="#0f172a"/>
            <rect x="13" y="37" width="6" height="6" rx="1" fill="#facc15"/>
            <circle cx="16" cy="18" r="8" fill="#fed7aa"/>
            <circle cx="12" cy="20" r="1.5" fill="#f87171" opacity="0.7"/>
            <circle cx="20" cy="20" r="1.5" fill="#f87171" opacity="0.7"/>
            <circle cx="13" cy="17" r="1" fill="#0f172a"/>
            <circle cx="19" cy="17" r="1" fill="#0f172a"/>
            <path d="M 8 20 Q 16 34 24 20 Q 20 28 16 28 Q 12 28 8 20 Z" fill="#ffffff"/>
            <path d="M 8 15 Q 16 8 24 15 Q 26 6 32 12" stroke="#dc2626" stroke-width="5" stroke-linecap="round" fill="none"/>
            <rect x="7" y="13" width="18" height="3.5" rx="1.5" fill="#ffffff"/>
            <circle cx="32" cy="12" r="3" fill="#ffffff"/>
            <path d="M 22 30 Q 30 25 34 20" stroke="#dc2626" stroke-width="4.5" stroke-linecap="round" fill="none"/>
            <circle cx="35" cy="19" r="3.5" fill="#ffffff"/>
            <ellipse cx="36" cy="18" rx="3" ry="2.5" fill="#15803d"/>
          </g>

          <path d="M 18 52 C 22 38 45 38 75 42 C 95 44 112 40 118 52 C 114 62 30 65 18 52 Z" fill="url(#sleighGradAdmin)" stroke="#7f1d1d" stroke-width="1.5"/>
          <path d="M 20 50 C 45 38 85 43 116 50" stroke="url(#goldGradAdmin)" stroke-width="2.5" stroke-linecap="round" fill="none"/>
          <path d="M 12 66 L 115 66 C 126 66 132 58 128 50 C 125 45 120 48 122 52 C 124 56 120 62 112 62 L 20 62 C 12 62 8 58 10 52 C 11 48 7 48 5 52 C 3 58 7 66 12 66 Z" fill="url(#goldGradAdmin)"/>
          <path d="M 38 58 L 36 63 M 65 58 L 65 63 M 95 56 L 96 63" stroke="url(#goldGradAdmin)" stroke-width="2.5" stroke-linecap="round"/>
        </g>
      </svg>
    </div>
  `;

  stage.appendChild(santaWrapper);

  const startX = -360;
  const endX = stageWidth + 80;
  const totalDistance = endX - startX;
  const startTime = performance.now();
  const giftDrops = [0.35, 0.7];
  const dropped = new Set();

  const animate = (now) => {
    const elapsed = (now - startTime) / 1000;
    const progress = Math.min(1, elapsed / duration);
    const curX = startX + totalDistance * progress;
    const curY = Math.sin(progress * Math.PI * 3) * 12;

    santaWrapper.style.transform = `translate3d(${curX}px, ${curY}px, 0)`;

    giftDrops.forEach((threshold, idx) => {
      if (progress >= threshold && !dropped.has(idx)) {
        dropped.add(idx);
        dropAdminPreviewGift(stage, curX + 60, 40 + curY + 60);
      }
    });

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      santaWrapper.remove();
    }
  };

  requestAnimationFrame(animate);
}

function dropAdminPreviewGift(stage, startX, startY) {
  const gift = document.createElement("div");
  gift.className = "absolute pointer-events-none";
  gift.style.left = `${startX}px`;
  gift.style.top = `${startY}px`;
  gift.style.width = "38px";
  gift.style.height = "38px";
  gift.style.zIndex = "55";
  gift.style.animation = "giftTumble 4.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards";
  gift.innerHTML = `
    <svg viewBox="0 0 44 44" class="w-full h-full filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.4)]">
      <rect x="6" y="14" width="32" height="26" rx="4" fill="#b91c1c"/>
      <rect x="4" y="10" width="36" height="7" rx="2.5" fill="#dc2626"/>
      <rect x="19" y="10" width="6" height="30" fill="#fbbf24"/>
      <rect x="6" y="24" width="32" height="6" fill="#fbbf24"/>
      <circle cx="22" cy="10" r="3" fill="#fde047"/>
    </svg>
  `;
  stage.appendChild(gift);
  setTimeout(() => gift.remove(), 4500);
}

if (previewSantaBtn) {
  previewSantaBtn.addEventListener("click", previewSantaFlight);
}

// Tab Navigation
tabEventsBtn.addEventListener("click", () => {
  activeTab = "events";
  tabEventsBtn.className = "px-4 py-2 rounded-xl text-sm font-bold bg-purple-600 text-white shadow-sm transition-all";
  tabRegsBtn.className = "px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 transition-all";
  if (tabSettingsBtn) tabSettingsBtn.className = "px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 transition-all flex items-center gap-1.5";
  viewEventsTable.classList.remove("hidden");
  viewRegistrationsTable.classList.add("hidden");
  if (viewSettingsPanel) viewSettingsPanel.classList.add("hidden");
  fetchEventsTable();
});

tabRegsBtn.addEventListener("click", () => {
  activeTab = "regs";
  tabRegsBtn.className = "px-4 py-2 rounded-xl text-sm font-bold bg-purple-600 text-white shadow-sm transition-all";
  tabEventsBtn.className = "px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 transition-all";
  if (tabSettingsBtn) tabSettingsBtn.className = "px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 transition-all flex items-center gap-1.5";
  viewRegistrationsTable.classList.remove("hidden");
  viewEventsTable.classList.add("hidden");
  if (viewSettingsPanel) viewSettingsPanel.classList.add("hidden");
  fetchRegistrationsTable();
});

if (tabSettingsBtn) {
  tabSettingsBtn.addEventListener("click", () => {
    activeTab = "settings";
    tabSettingsBtn.className = "px-4 py-2 rounded-xl text-sm font-bold bg-purple-600 text-white shadow-sm transition-all flex items-center gap-1.5";
    tabEventsBtn.className = "px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 transition-all";
    tabRegsBtn.className = "px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 transition-all";
    viewEventsTable.classList.add("hidden");
    viewRegistrationsTable.classList.add("hidden");
    if (viewSettingsPanel) viewSettingsPanel.classList.remove("hidden");
    fetchChristmasSettings();
  });
}

filterRegEvent.addEventListener("change", fetchRegistrationsTable);
refreshDashboardBtn.addEventListener("click", loadDashboard);

function loadDashboard() {
  fetchStats();
  if (activeTab === "events") {
    fetchEventsTable();
  } else if (activeTab === "regs") {
    fetchRegistrationsTable();
  } else if (activeTab === "settings") {
    fetchChristmasSettings();
  }
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Init on load
document.addEventListener("DOMContentLoaded", loadDashboard);
