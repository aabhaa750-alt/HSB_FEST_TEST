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
// 4. FESTIVE INTERACTIVE CONTROLS SETUP
// ==========================================
function initChristmasFeatures() {
  // Initialize Falling Snow
  const snowEngine = new SnowfallEngine("snow-canvas");

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
// 5. INITIALIZE ON DOM READY
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  fetchEvents();
  initChristmasFeatures();
});
