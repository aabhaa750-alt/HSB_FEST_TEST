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

// Tab Navigation
tabEventsBtn.addEventListener("click", () => {
  activeTab = "events";
  tabEventsBtn.className = "px-4 py-2 rounded-xl text-sm font-bold bg-purple-600 text-white shadow-sm transition-all";
  tabRegsBtn.className = "px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 transition-all";
  viewEventsTable.classList.remove("hidden");
  viewRegistrationsTable.classList.add("hidden");
  fetchEventsTable();
});

tabRegsBtn.addEventListener("click", () => {
  activeTab = "regs";
  tabRegsBtn.className = "px-4 py-2 rounded-xl text-sm font-bold bg-purple-600 text-white shadow-sm transition-all";
  tabEventsBtn.className = "px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 transition-all";
  viewRegistrationsTable.classList.remove("hidden");
  viewEventsTable.classList.add("hidden");
  fetchRegistrationsTable();
});

filterRegEvent.addEventListener("change", fetchRegistrationsTable);
refreshDashboardBtn.addEventListener("click", loadDashboard);

function loadDashboard() {
  fetchStats();
  if (activeTab === "events") {
    fetchEventsTable();
  } else {
    fetchRegistrationsTable();
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
