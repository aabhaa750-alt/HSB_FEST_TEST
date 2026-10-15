// Zenith '26 - Student Event Portal & Christmas Wonderland Engine (app.js)

let currentCategory = "All";
let currentSearch = "";
let searchDebounceTimer = null;
let currentEventData = null;

// DOM Elements
const eventsGrid = document.getElementById("events-grid");
const searchInput = document.getElementById("search-input");
const clearSearchBtn = document.getElementById("clear-search-btn");
const categoryFilterContainer = document.getElementById("category-filters");
const queryIndicator = document.getElementById("query-indicator");
const queryIndicatorText = document.getElementById("query-indicator-text");
const resetQueryBtn = document.getElementById("reset-query-btn");

// Modal Elements
const eventModal = document.getElementById("event-modal");
const modalCloseBtn = document.getElementById("modal-close-btn");
const cancelRegBtn = document.getElementById("cancel-reg-btn");
const modalIcon = document.getElementById("modal-icon");
const modalCategory = document.getElementById("modal-category");
const modalFee = document.getElementById("modal-fee");
const modalTitle = document.getElementById("modal-title");
const modalDatetime = document.getElementById("modal-datetime");
const modalVenue = document.getElementById("modal-venue");
const modalSeatsBadge = document.getElementById("modal-seats-badge");
const modalDescription = document.getElementById("modal-description");
const modalAlert = document.getElementById("modal-alert");
const registrationForm = document.getElementById("registration-form");
const formEventId = document.getElementById("form-event-id");
const submitRegBtn = document.getElementById("submit-reg-btn");
const submitBtnText = document.getElementById("submit-btn-text");
const submitSpinner = document.getElementById("submit-spinner");

// Input fields & errors
const inputStudentName = document.getElementById("student-name");
const inputRollNumber = document.getElementById("roll-number");
const inputStudentEmail = document.getElementById("student-email");
const inputStudentPhone = document.getElementById("student-phone");
const errorStudentName = document.getElementById("error-student-name");
const errorRollNumber = document.getElementById("error-roll-number");
const errorStudentEmail = document.getElementById("error-student-email");

// Festive Category badge styling (Christmas palette: Pine green, Ruby red, Emerald, Gold)
function getCategoryBadgeClasses(category) {
  const cat = (category || "").toLowerCase();
  switch (cat) {
    case "technical":
      return "bg-emerald-950/10 text-emerald-900 border-emerald-300";
    case "cultural":
      return "bg-rose-950/10 text-rose-900 border-rose-300";
    case "sports":
      return "bg-teal-950/10 text-teal-900 border-teal-300";
    case "gaming":
      return "bg-amber-950/10 text-amber-900 border-amber-300";
    case "workshop":
      return "bg-cyan-950/10 text-cyan-900 border-cyan-300";
    default:
      return "bg-red-950/10 text-red-900 border-red-300";
  }
}

// Fetch Events from real API with query parameters
async function fetchEvents() {
  renderLoadingState();

  const params = new URLSearchParams();
  if (currentCategory && currentCategory !== "All") {
    params.append("category", currentCategory);
  }
  if (currentSearch && currentSearch.trim() !== "") {
    params.append("search", currentSearch.trim());
  }

  const url = `/api/events${params.toString() ? "?" + params.toString() : ""}`;

  updateQueryIndicator();

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Server returned status ${response.status} (${response.statusText})`);
    }
    const events = await response.json();
    renderEvents(events);
  } catch (err) {
    console.error("Failed to fetch events:", err);
    renderErrorState(err.message);
  }
}

// Loading State (Christmas themed)
function renderLoadingState() {
  eventsGrid.innerHTML = `
    <div class="col-span-full py-16 flex flex-col items-center justify-center text-center">
      <div class="w-12 h-12 border-4 border-amber-200 border-t-red-700 rounded-full animate-spin mb-4"></div>
      <p class="text-base font-semibold text-slate-800">Unwrapping festival events... 🎁</p>
      <p class="text-xs text-emerald-800 mt-1">Connecting to live Zenith '26 database</p>
    </div>
  `;
}

// Error State
function renderErrorState(errorMessage) {
  eventsGrid.innerHTML = `
    <div class="col-span-full py-12 px-6 bg-rose-50 border border-rose-300 rounded-2xl text-center">
      <div class="w-12 h-12 bg-rose-100 text-rose-700 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl">⚠️</div>
      <h3 class="text-base font-bold text-rose-900">Unable to Load Events</h3>
      <p class="text-sm text-rose-700 mt-1 max-w-md mx-auto">
        Could not connect to the backend server. Please verify the server is running on port 8081.
      </p>
      <p class="text-xs text-rose-500 mt-2 font-mono">Detail: ${errorMessage}</p>
      <button onclick="fetchEvents()" class="mt-4 px-4 py-2 bg-red-700 hover:bg-red-600 active:bg-red-800 text-white font-medium text-xs rounded-xl shadow-sm transition-colors">
        Try Again
      </button>
    </div>
  `;
}

// Empty State
function renderEmptyState() {
  eventsGrid.innerHTML = `
    <div class="col-span-full py-16 px-6 bg-[#fffdfa] border border-amber-900/10 rounded-2xl text-center shadow-sm">
      <div class="text-4xl mb-3">🔍</div>
      <h3 class="text-base font-bold text-slate-800">No events match your criteria</h3>
      <p class="text-sm text-slate-600 mt-1 max-w-md mx-auto">
        We couldn't find any events matching category "<strong class="text-slate-900">${currentCategory}</strong>" 
        ${currentSearch ? `and query "<strong class="text-slate-900">${escapeHtml(currentSearch)}</strong>"` : ""}.
      </p>
      <button id="empty-reset-btn" class="mt-4 px-4 py-2 bg-red-800 hover:bg-red-700 active:bg-red-900 text-white font-semibold text-xs rounded-xl shadow-md transition-colors">
        Reset All Filters
      </button>
    </div>
  `;

  document.getElementById("empty-reset-btn")?.addEventListener("click", resetAllFilters);
}

// Render Event Cards (With Christmas details and warm cream background)
function renderEvents(events) {
  if (!events || events.length === 0) {
    renderEmptyState();
    return;
  }

  eventsGrid.innerHTML = events.map(event => {
    const isFull = event.available_seats === 0;
    const badgeClasses = getCategoryBadgeClasses(event.category);
    const feeText = event.fee === 0 ? "Free" : `₹${event.fee}`;
    const feeClass = event.fee === 0 
      ? "bg-emerald-50 text-emerald-800 border-emerald-300" 
      : "bg-amber-50 text-amber-800 border-amber-300";

    // Capacity progress bar percentage
    const registered = event.capacity - event.available_seats;
    const pct = Math.min(100, Math.round((registered / event.capacity) * 100));

    return `
      <div class="card-transition bg-[#fffdfa] rounded-2xl border border-emerald-950/10 shadow-sm hover:shadow-lg flex flex-col overflow-hidden animate-fadeIn relative">
        
        <!-- Subtle Top Ribbon Indicator -->
        <div class="absolute top-0 right-0 w-16 h-16 overflow-hidden pointer-events-none">
          <div class="absolute transform rotate-45 bg-amber-400/20 text-amber-900 text-[9px] font-bold py-0.5 right-[-35px] top-[18px] w-[120px] text-center border-b border-amber-400/40">
            FEST '26
          </div>
        </div>

        <!-- Card Top Bar -->
        <div class="p-5 pb-4 flex-1">
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center space-x-3">
              <span class="text-3xl p-2.5 rounded-2xl bg-amber-50/80 border border-amber-200/60 select-none shadow-sm">
                ${event.icon || "🎉"}
              </span>
              <div>
                <span class="inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${badgeClasses}">
                  ${event.category}
                </span>
                <h3 class="font-royal text-lg font-bold text-slate-800 tracking-tight mt-1 leading-snug">
                  ${escapeHtml(event.title)}
                </h3>
              </div>
            </div>
            <span class="text-xs font-bold px-2 py-0.5 rounded-md border ${feeClass}">
              ${feeText}
            </span>
          </div>

          <!-- Description preview -->
          <p class="mt-3 text-xs text-slate-600 line-clamp-2 leading-relaxed">
            ${escapeHtml(event.description || "Join us for an exciting college fest event.")}
          </p>

          <!-- Date & Venue info -->
          <div class="mt-4 space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
            <div class="flex items-center space-x-2">
              <span class="text-emerald-800">📅</span>
              <span class="font-medium">${event.event_date} • ${event.event_time}</span>
            </div>
            <div class="flex items-center space-x-2">
              <span class="text-rose-800">📍</span>
              <span class="truncate">${escapeHtml(event.venue)}</span>
            </div>
          </div>
        </div>

        <!-- Card Bottom Bar: Seat Utilization & CTA -->
        <div class="px-5 py-3.5 bg-slate-50/90 border-t border-slate-100 flex items-center justify-between gap-3">
          
          <!-- Seats Indicator -->
          <div class="flex-1">
            <div class="flex items-center justify-between text-[11px] mb-1">
              <span class="text-slate-500 font-medium">Availability</span>
              ${
                isFull
                  ? `<span class="font-extrabold text-rose-700 bg-rose-100 border border-rose-300 px-2 py-0.5 rounded text-[10px] tracking-wider uppercase">FULL</span>`
                  : `<span class="font-bold text-emerald-800">${event.available_seats} / ${event.capacity} seats</span>`
              }
            </div>
            <div class="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
              <div 
                class="h-1.5 rounded-full ${isFull ? 'bg-rose-500' : pct > 80 ? 'bg-amber-500' : 'bg-emerald-600'}" 
                style="width: ${pct}%"
              ></div>
            </div>
          </div>

          <!-- Action Button -->
          <button 
            onclick="openEventDetails(${event.id})"
            class="px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-sm transition-all whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-amber-400
              ${
                isFull
                  ? 'bg-slate-200 hover:bg-slate-300 active:bg-slate-400 text-slate-700'
                  : 'bg-red-800 hover:bg-red-700 active:bg-red-900 text-white shadow-md hover:shadow-lg'
              }
            "
          >
            View Details 🎁
          </button>
        </div>

      </div>
    `;
  }).join("");
}

// Open Event Details Modal
async function openEventDetails(eventId) {
  resetRegistrationForm();
  modalAlert.className = "hidden mt-3 p-3.5 rounded-xl text-xs sm:text-sm font-medium border";
  modalAlert.innerHTML = "";

  formEventId.value = eventId;
  eventModal.classList.remove("hidden");
  document.body.style.overflow = "hidden";

  // Pre-fill modal with placeholder while fetching live details
  modalTitle.textContent = "Loading event...";
  modalCategory.textContent = "Category";
  modalFee.textContent = "--";
  modalDatetime.textContent = "--";
  modalVenue.textContent = "--";
  modalSeatsBadge.textContent = "Checking...";
  modalDescription.textContent = "Retrieving event details from server...";

  try {
    const res = await fetch(`/api/events/${eventId}`);
    if (!res.ok) {
      throw new Error(`Failed to load event details (${res.status})`);
    }
    const event = await res.json();
    currentEventData = event;

    modalIcon.textContent = event.icon || "🎉";
    modalTitle.textContent = event.title;
    modalCategory.textContent = event.category;
    modalCategory.className = `text-xs uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border ${getCategoryBadgeClasses(event.category)}`;
    
    modalFee.textContent = event.fee === 0 ? "Free" : `₹${event.fee}`;
    modalFee.className = `text-xs font-bold px-2 py-0.5 rounded-full border ${event.fee === 0 ? 'bg-emerald-500/30 text-emerald-200 border-emerald-400/30' : 'bg-amber-500/30 text-amber-200 border-amber-400/30'}`;

    modalDatetime.textContent = `${event.event_date}, ${event.event_time}`;
    modalVenue.textContent = event.venue;
    modalDescription.textContent = event.description || "No detailed description provided.";

    const isFull = event.available_seats === 0;
    if (isFull) {
      modalSeatsBadge.innerHTML = `<span class="text-rose-700 font-extrabold bg-rose-100 px-2 py-0.5 rounded border border-rose-300">FULL (0 seats left)</span>`;
      submitRegBtn.disabled = true;
      submitBtnText.textContent = "Registration Closed (Full)";
    } else {
      modalSeatsBadge.innerHTML = `<span class="text-emerald-800 font-bold">${event.available_seats} seats available</span> <span class="text-slate-500 font-normal">of ${event.capacity} total</span>`;
      submitRegBtn.disabled = false;
      submitBtnText.textContent = "Confirm Registration";
    }

  } catch (err) {
    console.error("Error opening event modal:", err);
    modalDescription.textContent = "Unable to load event details. Please try again.";
  }
}

// Close Modal
function closeEventModal() {
  eventModal.classList.add("hidden");
  document.body.style.overflow = "";
  currentEventData = null;
}

// Form validation
function validateForm() {
  let isValid = true;

  const nameVal = inputStudentName.value.trim();
  if (!nameVal) {
    errorStudentName.classList.remove("hidden");
    inputStudentName.classList.add("border-rose-400");
    isValid = false;
  } else {
    errorStudentName.classList.add("hidden");
    inputStudentName.classList.remove("border-rose-400");
  }

  const rollVal = inputRollNumber.value.trim();
  if (!rollVal) {
    errorRollNumber.classList.remove("hidden");
    inputRollNumber.classList.add("border-rose-400");
    isValid = false;
  } else {
    errorRollNumber.classList.add("hidden");
    inputRollNumber.classList.remove("border-rose-400");
  }

  const emailVal = inputStudentEmail.value.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailVal || !emailRegex.test(emailVal)) {
    errorStudentEmail.classList.remove("hidden");
    inputStudentEmail.classList.add("border-rose-400");
    isValid = false;
  } else {
    errorStudentEmail.classList.add("hidden");
    inputStudentEmail.classList.remove("border-rose-400");
  }

  return isValid;
}

// Reset Registration Form
function resetRegistrationForm() {
  registrationForm.reset();
  errorStudentName.classList.add("hidden");
  errorRollNumber.classList.add("hidden");
  errorStudentEmail.classList.add("hidden");
  inputStudentName.classList.remove("border-rose-400");
  inputRollNumber.classList.remove("border-rose-400");
  inputStudentEmail.classList.remove("border-rose-400");
  submitRegBtn.disabled = false;
  submitBtnText.textContent = "Confirm Registration";
  submitSpinner.classList.add("hidden");
}

// Submit Registration Form
registrationForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!validateForm()) return;

  const eventId = formEventId.value;
  if (!eventId) return;

  submitRegBtn.disabled = true;
  submitBtnText.textContent = "Processing...";
  submitSpinner.classList.remove("hidden");
  modalAlert.className = "hidden mt-3 p-3.5 rounded-xl text-xs sm:text-sm font-medium border";

  const payload = {
    student_name: inputStudentName.value.trim(),
    roll_number: inputRollNumber.value.trim(),
    email: inputStudentEmail.value.trim(),
    phone: inputStudentPhone.value.trim() || null,
  };

  try {
    const response = await fetch(`/api/events/${eventId}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      modalAlert.className = "mt-3 p-3.5 rounded-xl text-xs sm:text-sm font-medium bg-rose-50 text-rose-800 border border-rose-200 block";
      modalAlert.innerHTML = `<strong>Registration Failed:</strong> ${escapeHtml(data.detail || "Unable to register.")}`;
      submitRegBtn.disabled = false;
      submitBtnText.textContent = "Try Again";
      submitSpinner.classList.add("hidden");
      return;
    }

    // Success State
    modalAlert.className = "mt-3 p-3.5 rounded-xl text-xs sm:text-sm font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 block";
    modalAlert.innerHTML = `
      <div class="flex items-center gap-2">
        <span class="text-lg">🎉</span>
        <div>
          <p class="font-bold">Registration Confirmed!</p>
          <p class="text-xs text-emerald-700 mt-0.5">
            Registration #${data.id} confirmed for <strong>${escapeHtml(data.student_name)}</strong> on ${data.registered_at}.
          </p>
        </div>
      </div>
    `;

    // Ring festive bells on successful registration
    christmasAudio.playBellChime();

    submitRegBtn.classList.add("hidden");
    document.getElementById("cancel-reg-btn").textContent = "Close";

    // Refresh background event grid to reflect updated live capacity
    fetchEvents();

    // If modal remains open, refresh modal seat counter
    setTimeout(async () => {
      try {
        const refreshed = await (await fetch(`/api/events/${eventId}`)).json();
        modalSeatsBadge.innerHTML = `<span class="text-emerald-800 font-bold">${refreshed.available_seats} seats available</span> <span class="text-slate-500 font-normal">of ${refreshed.capacity} total</span>`;
      } catch (_) {}
    }, 500);

  } catch (err) {
    console.error("Registration error:", err);
    modalAlert.className = "mt-3 p-3.5 rounded-xl text-xs sm:text-sm font-medium bg-rose-50 text-rose-800 border border-rose-200 block";
    modalAlert.innerHTML = `<strong>Network Error:</strong> Could not connect to the backend server. Please verify your connection.`;
    submitRegBtn.disabled = false;
    submitBtnText.textContent = "Try Again";
    submitSpinner.classList.add("hidden");
  }
});

// Category Filter Click
categoryFilterContainer.addEventListener("click", (e) => {
  const btn = e.target.closest(".cat-btn");
  if (!btn) return;

  const category = btn.getAttribute("data-category");
  if (category === currentCategory) return;

  currentCategory = category;

  // Update button visual styles
  document.querySelectorAll(".cat-btn").forEach(b => {
    b.className = "cat-btn px-3.5 py-2 rounded-xl border transition-all whitespace-nowrap bg-slate-50 text-slate-700 border-slate-200 hover:bg-red-50 hover:text-red-900 hover:border-red-200";
  });
  btn.className = "cat-btn active-cat px-3.5 py-2 rounded-xl border transition-all whitespace-nowrap bg-red-800 text-white border-red-800 shadow-sm hover:bg-red-700";

  fetchEvents();
});

// Search Input with Debounce (300ms)
searchInput.addEventListener("input", (e) => {
  const val = e.target.value;
  clearSearchBtn.classList.toggle("hidden", val.length === 0);

  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(() => {
    currentSearch = val;
    fetchEvents();
  }, 300);
});

clearSearchBtn.addEventListener("click", () => {
  searchInput.value = "";
  currentSearch = "";
  clearSearchBtn.classList.add("hidden");
  fetchEvents();
});

// Reset all filters helper
function resetAllFilters() {
  searchInput.value = "";
  currentSearch = "";
  clearSearchBtn.classList.add("hidden");
  currentCategory = "All";

  document.querySelectorAll(".cat-btn").forEach(b => {
    if (b.getAttribute("data-category") === "All") {
      b.className = "cat-btn active-cat px-3.5 py-2 rounded-xl border transition-all whitespace-nowrap bg-red-800 text-white border-red-800 shadow-sm hover:bg-red-700";
    } else {
      b.className = "cat-btn px-3.5 py-2 rounded-xl border transition-all whitespace-nowrap bg-slate-50 text-slate-700 border-slate-200 hover:bg-red-50 hover:text-red-900 hover:border-red-200";
    }
  });

  fetchEvents();
}

resetQueryBtn.addEventListener("click", resetAllFilters);

function updateQueryIndicator() {
  const hasFilter = currentCategory !== "All" || currentSearch.trim() !== "";
  if (!hasFilter) {
    queryIndicator.classList.add("hidden");
    return;
  }
  queryIndicator.classList.remove("hidden");
  const parts = [];
  if (currentCategory !== "All") parts.push(`Category: <strong>${currentCategory}</strong>`);
  if (currentSearch.trim()) parts.push(`Search: <strong>"${escapeHtml(currentSearch)}"</strong>`);
  queryIndicatorText.innerHTML = `Filtering by: ${parts.join(" and ")}`;
}

// Modal event listeners
modalCloseBtn.addEventListener("click", closeEventModal);
cancelRegBtn.addEventListener("click", closeEventModal);
eventModal.addEventListener("click", (e) => {
  if (e.target === eventModal) closeEventModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !eventModal.classList.contains("hidden")) {
    closeEventModal();
  }
});

// Escape HTML helper
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ==========================================
// 1. CHRISTMAS AUDIO ENGINE (Web Audio API)
// ==========================================
// Synthesizes natural harmonic bell chimes & optional gentle holiday music box melody.
// 100% self-contained, no external asset dependencies, no broken links.
class ChristmasAudioEngine {
  constructor() {
    this.ctx = null;
    this.soundEnabled = localStorage.getItem("zenith_sound_enabled") !== "false";
    this.musicPlaying = false;
    this.musicTimeout = null;
  }

  initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) this.ctx = new AudioContextClass();
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  // Realistic Christmas Bell Chime with harmonic overtones
  playBellChime() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Bell harmonic frequencies (C6, E6, G6, C7 arpeggio)
    const frequencies = [1046.50, 1318.51, 1567.98, 2093.00];

    frequencies.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);

      const peakGain = 0.18 / (idx + 1);
      gain.gain.setValueAtTime(peakGain, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.05 + 1.8);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 1.8);
    });
  }

  // Toggle Sound Effects (Mute / Unmute)
  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    localStorage.setItem("zenith_sound_enabled", this.soundEnabled);
    if (this.soundEnabled) this.playBellChime();
    this.updateSoundUI();
  }

  updateSoundUI() {
    const icon = document.getElementById("sound-icon");
    const text = document.getElementById("sound-status-text");
    if (icon) icon.textContent = this.soundEnabled ? "🔔" : "🔕";
    if (text) text.textContent = this.soundEnabled ? "Chimes" : "Muted";
  }

  // Optional Gentle Holiday Music Box Melody ("We Wish You a Merry Christmas")
  toggleMusic() {
    this.initContext();
    if (this.musicPlaying) {
      this.stopMusic();
    } else {
      this.startMusic();
    }
    this.updateMusicUI();
  }

  startMusic() {
    if (!this.ctx) return;
    this.musicPlaying = true;

    // Melody notes in Hz with duration
    const melody = [
      { f: 293.66, d: 0.35 }, // D4
      { f: 392.00, d: 0.35 }, // G4
      { f: 392.00, d: 0.20 }, // G4
      { f: 440.00, d: 0.20 }, // A4
      { f: 392.00, d: 0.20 }, // G4
      { f: 369.99, d: 0.20 }, // F#4
      { f: 329.63, d: 0.35 }, // E4
      { f: 261.63, d: 0.35 }, // C4
      { f: 329.63, d: 0.35 }, // E4
      { f: 440.00, d: 0.35 }, // A4
      { f: 440.00, d: 0.20 }, // A4
      { f: 493.88, d: 0.20 }, // B4
      { f: 440.00, d: 0.20 }, // A4
      { f: 392.00, d: 0.20 }, // G4
      { f: 369.99, d: 0.35 }, // F#4
      { f: 293.66, d: 0.35 }, // D4
      { f: 369.99, d: 0.35 }, // F#4
      { f: 493.88, d: 0.35 }, // B4
      { f: 493.88, d: 0.20 }, // B4
      { f: 523.25, d: 0.20 }, // C5
      { f: 493.88, d: 0.20 }, // B4
      { f: 440.00, d: 0.20 }, // A4
      { f: 392.00, d: 0.35 }, // G4
      { f: 329.63, d: 0.35 }, // E4
      { f: 293.66, d: 0.35 }, // D4
      { f: 329.63, d: 0.35 }, // E4
      { f: 440.00, d: 0.35 }, // A4
      { f: 369.99, d: 0.35 }, // F#4
      { f: 392.00, d: 0.70 }, // G4
      { f: 0,      d: 0.50 }  // Rest
    ];

    let index = 0;
    const playStep = () => {
      if (!this.musicPlaying || !this.ctx) return;
      const note = melody[index];
      index = (index + 1) % melody.length;

      if (note.f > 0) {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(note.f, now);

        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + note.d * 1.4);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + note.d * 1.4);
      }

      this.musicTimeout = setTimeout(playStep, note.d * 1000);
    };

    playStep();
  }

  stopMusic() {
    this.musicPlaying = false;
    if (this.musicTimeout) {
      clearTimeout(this.musicTimeout);
      this.musicTimeout = null;
    }
  }

  updateMusicUI() {
    const icon = document.getElementById("music-icon");
    const text = document.getElementById("music-status-text");
    if (icon) icon.textContent = this.musicPlaying ? "⏸️" : "🎵";
    if (text) text.textContent = this.musicPlaying ? "Playing" : "Music";
  }
}

const christmasAudio = new ChristmasAudioEngine();

// ==========================================
// 2. REALISTIC FALLING SNOW ANIMATION
// ==========================================
class SnowfallEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas ? this.canvas.getContext("2d") : null;
    this.flakes = [];
    this.maxFlakes = 65;
    this.animId = null;
    this.enabled = localStorage.getItem("zenith_snow_enabled") !== "false";

    // Check system prefers-reduced-motion
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotionQuery.matches) {
      this.enabled = false;
    }

    if (this.canvas) {
      this.init();
    }
  }

  init() {
    this.resize();
    window.addEventListener("resize", () => this.resize());

    // Generate natural snowflakes
    this.flakes = [];
    for (let i = 0; i < this.maxFlakes; i++) {
      this.flakes.push(this.createFlake(true));
    }

    if (this.enabled) {
      this.start();
    }
    this.updateUI();
  }

  createFlake(randomY = false) {
    const width = this.canvas.width;
    const height = this.canvas.height;
    return {
      x: Math.random() * width,
      y: randomY ? Math.random() * height : -10,
      r: Math.random() * 2.5 + 1.0, // Radius 1.0 to 3.5px
      speed: Math.random() * 1.2 + 0.6,
      swaySpeed: Math.random() * 0.02 + 0.01,
      swayOffset: Math.random() * Math.PI * 2,
      swayWidth: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.5 + 0.4,
      isSparkle: Math.random() > 0.85
    };
  }

  resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  start() {
    if (this.animId) cancelAnimationFrame(this.animId);
    const loop = () => {
      this.update();
      this.draw();
      this.animId = requestAnimationFrame(loop);
    };
    loop();
  }

  stop() {
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
    if (this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  update() {
    const width = this.canvas.width;
    const height = this.canvas.height;

    for (let i = 0; i < this.flakes.length; i++) {
      const f = this.flakes[i];
      f.y += f.speed;
      f.swayOffset += f.swaySpeed;
      f.x += Math.sin(f.swayOffset) * f.swayWidth;

      if (f.y > height + 10 || f.x < -10 || f.x > width + 10) {
        this.flakes[i] = this.createFlake(false);
      }
    }
  }

  draw() {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (const f of this.flakes) {
      this.ctx.beginPath();
      this.ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);

      if (f.isSparkle) {
        this.ctx.fillStyle = `rgba(254, 240, 138, ${f.alpha})`;
        this.ctx.shadowBlur = 4;
        this.ctx.shadowColor = "#fde047";
      } else {
        this.ctx.fillStyle = `rgba(255, 255, 255, ${f.alpha})`;
        this.ctx.shadowBlur = 0;
      }

      this.ctx.fill();
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    localStorage.setItem("zenith_snow_enabled", this.enabled);
    if (this.enabled) {
      this.start();
    } else {
      this.stop();
    }
    this.updateUI();
  }

  updateUI() {
    const text = document.getElementById("snow-status-text");
    if (text) text.textContent = this.enabled ? "Snow: On" : "Snow: Off";
  }
}

// ==========================================
// 3. CHRISTMAS COUNTDOWN TIMER
// ==========================================
function initChristmasCountdown() {
  const daysEl = document.getElementById("countdown-days");
  const hoursEl = document.getElementById("countdown-hours");
  const minutesEl = document.getElementById("countdown-minutes");
  const secondsEl = document.getElementById("countdown-seconds");
  const celebrationBanner = document.getElementById("christmas-celebration-banner");
  const countdownGrid = document.getElementById("countdown-container");

  function getNextChristmas() {
    const now = new Date();
    const currentYear = now.getFullYear();
    let christmas = new Date(currentYear, 11, 25, 0, 0, 0); // Dec 25, 00:00:00 local time

    // If today is after Dec 25, target next year's Dec 25
    if (now > christmas) {
      // Check if it's currently Christmas Day (Dec 25)
      if (now.getMonth() === 11 && now.getDate() === 25) {
        return "TODAY";
      }
      christmas = new Date(currentYear + 1, 11, 25, 0, 0, 0);
    }
    return christmas;
  }

  function updateTimer() {
    const target = getNextChristmas();

    if (target === "TODAY") {
      if (celebrationBanner) celebrationBanner.classList.remove("hidden");
      if (countdownGrid) countdownGrid.classList.add("hidden");
      return;
    }

    if (celebrationBanner) celebrationBanner.classList.add("hidden");
    if (countdownGrid) countdownGrid.classList.remove("hidden");

    const now = new Date().getTime();
    const distance = target.getTime() - now;

    if (distance <= 0) {
      if (celebrationBanner) celebrationBanner.classList.remove("hidden");
      if (countdownGrid) countdownGrid.classList.add("hidden");
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    if (daysEl) daysEl.textContent = String(days).padStart(2, "0");
    if (hoursEl) hoursEl.textContent = String(hours).padStart(2, "0");
    if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, "0");
    if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, "0");
  }

  updateTimer();
  setInterval(updateTimer, 1000);
}

// ==========================================
// 4. ANIMATED SANTA CLAUS & REINDEER FLIGHT ENGINE
// ==========================================
class SantaFlightEngine {
  constructor(stageId) {
    this.stage = document.getElementById(stageId);
    this.santaEl = null;
    this.intervalId = null;
    this.isFlying = false;
    this.enabled = true;
    this.giftsEnabled = true;
    this.speedMode = "normal"; // fast, normal, slow
    this.flightInterval = 30; // seconds
    this.giftsCount = 2; // 1 to 4
    this.stardustInterval = null;

    // Accessibility check: prefers-reduced-motion
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotionQuery.matches) {
      this.enabled = false;
    }
  }

  getSpeedDuration() {
    switch (this.speedMode) {
      case "fast": return 11;
      case "slow": return 23;
      default: return 16;
    }
  }

  start() {
    this.stop();
    if (!this.enabled || !this.stage) return;

    // Launch first flight after a natural initial delay
    setTimeout(() => {
      if (this.enabled && !this.isFlying) {
        this.launchFlight();
      }
    }, 2000);

    // Schedule regular flights
    this.intervalId = setInterval(() => {
      if (this.enabled && !this.isFlying) {
        this.launchFlight();
      }
    }, Math.max(12, this.flightInterval) * 1000);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.santaEl && this.santaEl.parentNode) {
      this.santaEl.remove();
      this.santaEl = null;
    }
    this.isFlying = false;
  }

  launchFlight() {
    if (!this.stage || this.isFlying) return;
    this.isFlying = true;

    const duration = this.getSpeedDuration();
    const isMobile = window.innerWidth < 640;
    const stageWidth = window.innerWidth;

    // Santa Wrapper
    const santaWrapper = document.createElement("div");
    santaWrapper.className = "absolute pointer-events-none select-none transition-none";
    santaWrapper.style.width = isMobile ? "240px" : "330px";
    santaWrapper.style.height = isMobile ? "75px" : "95px";
    santaWrapper.style.top = isMobile ? "32px" : "clamp(28px, 6vh, 85px)";
    santaWrapper.style.left = "-360px";
    santaWrapper.style.zIndex = "25";
    santaWrapper.style.filter = "drop-shadow(0 6px 14px rgba(0,0,0,0.4))";
    santaWrapper.setAttribute("aria-hidden", "true");

    santaWrapper.innerHTML = `
      <div class="sleigh-bob-motion w-full h-full">
        <svg viewBox="0 0 340 100" class="w-full h-full" overflow="visible" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="sleighGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#b91c1c"/>
              <stop offset="100%" stop-color="#7f1d1d"/>
            </linearGradient>
            <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#fde047"/>
              <stop offset="100%" stop-color="#d97706"/>
            </linearGradient>
          </defs>

          <!-- Golden Reins -->
          <path d="M 120 48 Q 170 38 215 42 Q 255 40 280 44" fill="none" stroke="url(#goldGrad)" stroke-width="1.8" stroke-dasharray="3,1" opacity="0.85"/>

          <!-- REINDEER 2 (Trailing Reindeer) -->
          <g class="reindeer-unit" transform="translate(180, 15)">
            <path d="M 25 35 Q 35 25 50 28 Q 62 30 65 38 Q 60 48 40 46 Q 25 46 25 35 Z" fill="#92400e"/>
            <path d="M 58 28 Q 68 18 78 22 Q 80 28 72 34 Q 62 35 58 28 Z" fill="#b45309"/>
            <path d="M 70 20 L 74 10 M 74 13 L 78 8 M 72 15 L 68 11" stroke="#fef08a" stroke-width="2" stroke-linecap="round"/>
            <circle cx="72" cy="24" r="1.5" fill="#1e293b"/>
            <circle cx="62" cy="35" r="2.5" fill="#facc15"/>
            <!-- Front Legs -->
            <g class="deer-front-legs" style="transform-origin: 60px 42px;">
              <path d="M 60 42 Q 68 55 76 60" stroke="#78350f" stroke-width="3" stroke-linecap="round" fill="none"/>
              <path d="M 57 42 Q 63 53 70 58" stroke="#92400e" stroke-width="2.5" stroke-linecap="round" fill="none"/>
            </g>
            <!-- Back Legs -->
            <g class="deer-back-legs" style="transform-origin: 30px 42px;">
              <path d="M 32 42 Q 22 55 14 58" stroke="#78350f" stroke-width="3" stroke-linecap="round" fill="none"/>
              <path d="M 35 42 Q 26 53 20 57" stroke="#92400e" stroke-width="2.5" stroke-linecap="round" fill="none"/>
            </g>
            <path d="M 25 35 Q 20 30 22 36" stroke="#92400e" stroke-width="3" stroke-linecap="round"/>
          </g>

          <!-- REINDEER 1 (Rudolph the Lead Reindeer with Glowing Red Nose) -->
          <g class="reindeer-unit" transform="translate(250, 8)">
            <path d="M 25 35 Q 35 25 50 28 Q 62 30 65 38 Q 60 48 40 46 Q 25 46 25 35 Z" fill="#92400e"/>
            <path d="M 58 28 Q 68 18 78 22 Q 80 28 72 34 Q 62 35 58 28 Z" fill="#b45309"/>
            <path d="M 70 20 L 75 8 M 75 12 L 80 7 M 72 14 L 67 9" stroke="#fde047" stroke-width="2.2" stroke-linecap="round"/>
            <circle cx="72" cy="24" r="1.5" fill="#1e293b"/>
            <!-- Rudolph's Glowing Red Nose! -->
            <circle cx="79" cy="26" r="3.5" fill="#ef4444" class="rudolph-nose"/>
            <path d="M 60 30 Q 64 36 62 42" stroke="#dc2626" stroke-width="2.5" fill="none"/>
            <circle cx="62" cy="36" r="2.5" fill="#facc15"/>
            <!-- Front Legs -->
            <g class="deer-front-legs" style="transform-origin: 60px 42px;">
              <path d="M 60 42 Q 70 54 80 58" stroke="#78350f" stroke-width="3" stroke-linecap="round" fill="none"/>
              <path d="M 57 42 Q 65 52 73 57" stroke="#92400e" stroke-width="2.5" stroke-linecap="round" fill="none"/>
            </g>
            <!-- Back Legs -->
            <g class="deer-back-legs" style="transform-origin: 30px 42px;">
              <path d="M 32 42 Q 20 54 12 56" stroke="#78350f" stroke-width="3" stroke-linecap="round" fill="none"/>
              <path d="M 36 42 Q 25 52 18 55" stroke="#92400e" stroke-width="2.5" stroke-linecap="round" fill="none"/>
            </g>
            <path d="M 25 35 Q 18 30 20 36" stroke="#92400e" stroke-width="3" stroke-linecap="round"/>
          </g>

          <!-- SLEIGH & SANTA GROUP -->
          <g class="sleigh-group" transform="translate(10, 18)">
            <!-- Sack of Toys -->
            <ellipse cx="42" cy="42" rx="22" ry="18" fill="#854d0e" stroke="#ca8a04" stroke-width="1.5"/>
            <path d="M 32 30 Q 42 22 52 30" stroke="#fde047" stroke-width="2" fill="none"/>
            <rect x="36" y="22" width="12" height="12" rx="1.5" fill="#15803d" stroke="#facc15" stroke-width="1"/>
            <path d="M 42 22 L 42 34 M 36 28 L 48 28" stroke="#facc15" stroke-width="1"/>
            <rect x="46" y="25" width="10" height="10" rx="1.5" fill="#dc2626" stroke="#fde047" stroke-width="1"/>

            <!-- Santa Claus -->
            <g transform="translate(62, 10)">
              <path d="M 10 32 C 10 24 24 24 24 32 L 27 48 L 5 48 Z" fill="#dc2626"/>
              <rect x="4" y="46" width="24" height="4" rx="2" fill="#ffffff"/>
              <rect x="6" y="38" width="20" height="4" fill="#0f172a"/>
              <rect x="13" y="37" width="6" height="6" rx="1" fill="#facc15"/>
              <rect x="14.5" y="38.5" width="3" height="3" fill="#0f172a"/>
              <circle cx="16" cy="18" r="8" fill="#fed7aa"/>
              <circle cx="12" cy="20" r="1.5" fill="#f87171" opacity="0.7"/>
              <circle cx="20" cy="20" r="1.5" fill="#f87171" opacity="0.7"/>
              <circle cx="13" cy="17" r="1" fill="#0f172a"/>
              <circle cx="19" cy="17" r="1" fill="#0f172a"/>
              <ellipse cx="16" cy="19" rx="2" ry="1.5" fill="#fca5a5"/>
              <path d="M 8 20 Q 16 34 24 20 Q 20 28 16 28 Q 12 28 8 20 Z" fill="#ffffff"/>
              <path d="M 8 15 Q 16 8 24 15 Q 26 6 32 12" stroke="#dc2626" stroke-width="5" stroke-linecap="round" fill="none"/>
              <rect x="7" y="13" width="18" height="3.5" rx="1.5" fill="#ffffff"/>
              <circle cx="32" cy="12" r="3" fill="#ffffff"/>
              <!-- Arm Waving -->
              <path d="M 22 30 Q 30 25 34 20" stroke="#dc2626" stroke-width="4.5" stroke-linecap="round" fill="none"/>
              <circle cx="35" cy="19" r="3.5" fill="#ffffff"/>
              <ellipse cx="36" cy="18" rx="3" ry="2.5" fill="#15803d"/>
            </g>

            <!-- Crimson Sleigh Body -->
            <path d="M 18 52 C 22 38 45 38 75 42 C 95 44 112 40 118 52 C 114 62 30 65 18 52 Z" fill="url(#sleighGrad)" stroke="#7f1d1d" stroke-width="1.5"/>
            <path d="M 20 50 C 45 38 85 43 116 50" stroke="url(#goldGrad)" stroke-width="2.5" stroke-linecap="round" fill="none"/>
            <path d="M 22 55 Q 65 59 110 55" stroke="#fde047" stroke-width="1.2" opacity="0.8" fill="none"/>

            <!-- Golden Sleigh Runners -->
            <path d="M 12 66 L 115 66 C 126 66 132 58 128 50 C 125 45 120 48 122 52 C 124 56 120 62 112 62 L 20 62 C 12 62 8 58 10 52 C 11 48 7 48 5 52 C 3 58 7 66 12 66 Z" fill="url(#goldGrad)"/>
            <path d="M 38 58 L 36 63 M 65 58 L 65 63 M 95 56 L 96 63" stroke="url(#goldGrad)" stroke-width="2.5" stroke-linecap="round"/>
          </g>
        </svg>
      </div>
    `;

    this.stage.appendChild(santaWrapper);
    this.santaEl = santaWrapper;

    const startX = -360;
    const endX = stageWidth + 80;
    const totalDistance = endX - startX;
    const startTime = performance.now();

    // Determine drop intervals
    const dropThresholds = [];
    if (this.giftsEnabled) {
      const count = isMobile ? Math.min(2, this.giftsCount) : this.giftsCount;
      for (let i = 1; i <= count; i++) {
        dropThresholds.push(i / (count + 1));
      }
    }
    const droppedGifts = new Set();

    // Smooth horizontal translation loop
    const animateFlight = (now) => {
      if (!this.isFlying || !this.santaEl) return;
      const elapsed = (now - startTime) / 1000;
      const progress = Math.min(1, elapsed / duration);

      const currentX = startX + totalDistance * progress;
      const altitudeOffset = Math.sin(progress * Math.PI * 3) * 12;

      this.santaEl.style.transform = `translate3d(${currentX}px, ${altitudeOffset}px, 0)`;

      // Spawn subtle stardust behind sleigh runner
      if (Math.random() < 0.35) {
        this.spawnStardust(
          currentX + 25,
          parseFloat(this.santaEl.style.top || 35) + altitudeOffset + (isMobile ? 55 : 75)
        );
      }

      // Drop gift when progress crosses threshold
      dropThresholds.forEach((threshold, idx) => {
        if (progress >= threshold && !droppedGifts.has(idx)) {
          droppedGifts.add(idx);
          const dropX = currentX + (isMobile ? 50 : 70);
          const dropY = parseFloat(this.santaEl.style.top || 35) + altitudeOffset + (isMobile ? 55 : 75);
          this.dropGift(dropX, dropY, idx);
        }
      });

      if (progress < 1) {
        requestAnimationFrame(animateFlight);
      } else {
        if (this.santaEl && this.santaEl.parentNode) {
          this.santaEl.remove();
        }
        this.santaEl = null;
        this.isFlying = false;
      }
    };

    requestAnimationFrame(animateFlight);
  }

  // Stardust particle behind sleigh
  spawnStardust(x, y) {
    if (!this.stage) return;
    const star = document.createElement("div");
    const colors = ["#fde047", "#fef08a", "#ffffff", "#f59e0b", "#93c5fd"];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const size = Math.random() * 4 + 2.5;

    star.className = "absolute pointer-events-none rounded-full";
    star.style.left = `${x}px`;
    star.style.top = `${y}px`;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.backgroundColor = color;
    star.style.boxShadow = `0 0 6px ${color}`;
    star.style.animation = "stardustTwinkle 0.8s ease-out forwards";
    star.style.zIndex = "24";

    this.stage.appendChild(star);
    setTimeout(() => {
      if (star.parentNode) star.remove();
    }, 850);
  }

  // Drop wrapped gift
  dropGift(startX, startY, index) {
    if (!this.stage || !this.giftsEnabled) return;

    const giftStyles = [
      { box: "#b91c1c", ribbon: "#fbbf24", bow: "#fde047", name: "Crimson & Gold Surprise" },
      { box: "#15803d", ribbon: "#dc2626", bow: "#fbbf24", name: "Emerald & Ruby Delight" },
      { box: "#d97706", ribbon: "#065f46", bow: "#34d399", name: "Golden Pine Treasure" },
      { box: "#faf7f2", ribbon: "#b91c1c", bow: "#f59e0b", name: "Ivory Wonder Present" },
    ];
    const style = giftStyles[index % giftStyles.length];

    const gift = document.createElement("div");
    const fallDuration = (Math.random() * 0.9 + 3.8).toFixed(2);

    gift.className = "falling-gift absolute pointer-events-auto cursor-pointer group";
    gift.style.left = `${startX}px`;
    gift.style.top = `${startY}px`;
    gift.style.width = "40px";
    gift.style.height = "40px";
    gift.style.zIndex = "26";
    gift.style.animation = `giftTumble ${fallDuration}s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`;
    gift.setAttribute("title", "Click to catch Santa's gift! 🎁");

    gift.innerHTML = `
      <svg viewBox="0 0 44 44" class="w-full h-full filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.35)] group-hover:scale-110 transition-transform">
        <rect x="6" y="14" width="32" height="26" rx="4" fill="${style.box}" stroke="rgba(255,255,255,0.25)" stroke-width="1"/>
        <rect x="4" y="10" width="36" height="7" rx="2.5" fill="${style.box}" filter="brightness(1.1)"/>
        <rect x="19" y="10" width="6" height="30" fill="${style.ribbon}"/>
        <rect x="6" y="24" width="32" height="6" fill="${style.ribbon}"/>
        <path d="M 17 10 C 13 4 8 7 13 10 Z" fill="${style.bow}"/>
        <path d="M 27 10 C 31 4 36 7 31 10 Z" fill="${style.bow}"/>
        <circle cx="22" cy="10" r="3" fill="${style.bow}" stroke="#d97706" stroke-width="0.8"/>
        <circle cx="10" cy="18" r="1.5" fill="#ffffff" opacity="0.8"/>
      </svg>
    `;

    // Interactive Catch Handler
    gift.addEventListener("click", (e) => {
      e.stopPropagation();
      this.catchGift(gift, style);
    });

    // Auto removal
    gift.addEventListener("animationend", () => {
      if (gift.parentNode) gift.remove();
    });
    setTimeout(() => {
      if (gift.parentNode) gift.remove();
    }, (parseFloat(fallDuration) + 0.6) * 1000);

    this.stage.appendChild(gift);
  }

  // Interactive Surprise Catch
  catchGift(giftEl, style) {
    if (!giftEl || !giftEl.parentNode) return;

    const rect = giftEl.getBoundingClientRect();
    const clickX = rect.left + rect.width / 2;
    const clickY = rect.top + rect.height / 2;

    // Bell chime
    if (typeof christmasAudio !== "undefined" && christmasAudio.playBellChime) {
      christmasAudio.playBellChime();
    }

    // Sparkle burst (12 radiating particles)
    for (let i = 0; i < 12; i++) {
      const spark = document.createElement("div");
      const angle = (i / 12) * Math.PI * 2;
      const distance = Math.random() * 45 + 30;
      const dx = `${Math.cos(angle) * distance}px`;
      const dy = `${Math.sin(angle) * distance}px`;
      const starColors = ["#fbbf24", "#f43f5e", "#34d399", "#60a5fa", "#fde047"];
      const color = starColors[i % starColors.length];

      spark.className = "absolute pointer-events-none rounded-full";
      spark.style.left = `${clickX}px`;
      spark.style.top = `${clickY}px`;
      spark.style.width = "7px";
      spark.style.height = "7px";
      spark.style.backgroundColor = color;
      spark.style.boxShadow = `0 0 8px ${color}`;
      spark.style.setProperty("--dx", dx);
      spark.style.setProperty("--dy", dy);
      spark.style.animation = "giftCatchSpark 0.75s ease-out forwards";
      spark.style.zIndex = "60";

      document.body.appendChild(spark);
      setTimeout(() => {
        if (spark.parentNode) spark.remove();
      }, 800);
    }

    // Holiday Toast Notification
    const toast = document.getElementById("gift-surprise-toast");
    const toastMsg = document.getElementById("gift-toast-msg");
    if (toast) {
      const messages = [
        `You caught a ${style.name}! Warm festive wishes from Zenith '26! 🎄✨`,
        `Merry Christmas! Santa dropped you good fortune and holiday cheer! 🎁✨`,
        `Holiday surprise caught! May your fest journey be magical and bright! 🌟🔔`,
        `Season's Greetings! May peace, joy, and victory be yours! 🎅🎉`
      ];
      if (toastMsg) {
        toastMsg.textContent = messages[Math.floor(Math.random() * messages.length)];
      }
      toast.classList.remove("translate-y-24", "opacity-0");
      toast.classList.add("translate-y-0", "opacity-100");

      setTimeout(() => {
        toast.classList.remove("translate-y-0", "opacity-100");
        toast.classList.add("translate-y-24", "opacity-0");
      }, 4000);
    }

    // Fade out gift smoothly
    giftEl.style.transition = "transform 0.22s ease-out, opacity 0.22s ease-out";
    giftEl.style.transform = "scale(1.35)";
    giftEl.style.opacity = "0";
    setTimeout(() => {
      if (giftEl.parentNode) giftEl.remove();
    }, 240);
  }
}

// ==========================================
// 5. SYNCHRONIZE WITH SQLITE SITE SETTINGS
// ==========================================
async function syncSiteSettings(santaEngine, snowEngine) {
  try {
    const res = await fetch("/api/settings");
    if (!res.ok) return;
    const settings = await res.json();

    // 1. Santa & Gifts
    if (santaEngine) {
      santaEngine.enabled = settings.santa_enabled !== false;
      santaEngine.giftsEnabled = settings.gifts_enabled !== false;
      santaEngine.speedMode = settings.flight_speed || "normal";
      santaEngine.flightInterval = settings.flight_interval || 30;
      santaEngine.giftsCount = settings.gifts_count || 2;
      santaEngine.start();
    }

    // 2. Snow Sync
    if (snowEngine && typeof settings.snow_enabled === "boolean") {
      if (settings.snow_enabled && !snowEngine.enabled) snowEngine.toggle();
      else if (!settings.snow_enabled && snowEngine.enabled) snowEngine.toggle();
    }

    // 3. Fairy Lights Garland
    const garland = document.getElementById("fairy-lights-garland");
    if (garland) {
      if (settings.lights_enabled === false) {
        garland.classList.add("hidden");
      } else {
        garland.classList.remove("hidden");
      }
    }

    // 4. Festive Greeting Script
    const greetingEl = document.getElementById("festive-greeting-text");
    if (greetingEl && settings.festive_greeting) {
      greetingEl.textContent = settings.festive_greeting;
    }

    // 5. Countdown Section
    const countdownSec = document.getElementById("christmas-countdown");
    if (countdownSec) {
      if (settings.countdown_enabled === false) {
        countdownSec.classList.add("hidden");
      } else {
        countdownSec.classList.remove("hidden");
      }
    }
    const countdownTitleEl = document.getElementById("countdown-title-text");
    if (countdownTitleEl && settings.countdown_title) {
      countdownTitleEl.textContent = settings.countdown_title;
    }
  } catch (err) {
    console.warn("Could not sync site settings:", err);
  }
}

// ==========================================
// 6. FESTIVE INTERACTIVE CONTROLS SETUP
// ==========================================
function initChristmasFeatures() {
  // Initialize Falling Snow
  const snowEngine = new SnowfallEngine("snow-canvas");

  // Initialize Santa & Gifts Flight Engine
  const santaEngine = new SantaFlightEngine("santa-stage");

  // Synchronize dynamic settings from backend
  syncSiteSettings(santaEngine, snowEngine);

  // Snow Toggle Button
  const snowToggleBtn = document.getElementById("snow-toggle-btn");
  if (snowToggleBtn) {
    snowToggleBtn.addEventListener("click", () => {
      snowEngine.toggle();
    });
  }

  // Sound Toggle Button
  const soundToggleBtn = document.getElementById("sound-toggle-btn");
  if (soundToggleBtn) {
    christmasAudio.updateSoundUI();
    soundToggleBtn.addEventListener("click", () => {
      christmasAudio.toggleSound();
    });
  }

  // Music Toggle Button
  const musicToggleBtn = document.getElementById("music-toggle-btn");
  if (musicToggleBtn) {
    christmasAudio.updateMusicUI();
    musicToggleBtn.addEventListener("click", () => {
      christmasAudio.toggleMusic();
    });
  }

  // Interactive Bells Click Handlers
  const headerBellBtn = document.getElementById("header-bell-btn");
  const heroBellsBtn = document.getElementById("hero-bells-btn");
  const heroBellIcon = document.getElementById("hero-bell-icon");

  const ringBells = () => {
    christmasAudio.playBellChime();
    if (headerBellBtn) {
      headerBellBtn.classList.add("ringing");
      setTimeout(() => headerBellBtn.classList.remove("ringing"), 800);
    }
    if (heroBellIcon) {
      heroBellIcon.classList.add("ringing");
      setTimeout(() => heroBellIcon.classList.remove("ringing"), 800);
    }
  };

  if (headerBellBtn) headerBellBtn.addEventListener("click", ringBells);
  if (heroBellsBtn) heroBellsBtn.addEventListener("click", ringBells);

  // Initialize Countdown
  initChristmasCountdown();
}

// ==========================================
// 7. INITIALIZE ON DOM READY
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  fetchEvents();
  initChristmasFeatures();
});
