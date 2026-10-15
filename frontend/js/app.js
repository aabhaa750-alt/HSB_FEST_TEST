// Zenith '26 - Student Event Portal (app.js)

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

// Helper: Category badge color mapping
function getCategoryBadgeClasses(category) {
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

// Fetch Events from real API with query parameters (Step 6 & 9)
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

// Step 9: Loading State
function renderLoadingState() {
  eventsGrid.innerHTML = `
    <div class="col-span-full py-16 flex flex-col items-center justify-center text-center">
      <div class="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
      <p class="text-base font-semibold text-slate-700">Loading festival events...</p>
      <p class="text-xs text-slate-400 mt-1">Connecting to FastAPI backend</p>
    </div>
  `;
}

// Step 9: Error State
function renderErrorState(errorMessage) {
  eventsGrid.innerHTML = `
    <div class="col-span-full py-12 px-6 bg-rose-50 border border-rose-200 rounded-2xl text-center">
      <div class="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl">⚠️</div>
      <h3 class="text-base font-bold text-rose-800">Unable to Load Events</h3>
      <p class="text-sm text-rose-600 mt-1 max-w-md mx-auto">
        Could not connect to the backend server. Make sure the FastAPI backend is running (<code class="bg-rose-100 px-1 py-0.5 rounded text-xs">uvicorn backend.main:app --reload</code>).
      </p>
      <p class="text-xs text-rose-500 mt-2 font-mono">Detail: ${errorMessage}</p>
      <button onclick="fetchEvents()" class="mt-4 px-4 py-2 bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-medium text-xs rounded-xl shadow-sm transition-colors">
        Try Again
      </button>
    </div>
  `;
}

// Step 9: Empty State
function renderEmptyState() {
  eventsGrid.innerHTML = `
    <div class="col-span-full py-16 px-6 bg-white border border-slate-200/80 rounded-2xl text-center">
      <div class="text-4xl mb-3">🔍</div>
      <h3 class="text-base font-bold text-slate-800">No events match your criteria</h3>
      <p class="text-sm text-slate-500 mt-1 max-w-md mx-auto">
        We couldn't find any events matching category "<strong class="text-slate-700">${currentCategory}</strong>" 
        ${currentSearch ? `and query "<strong class="text-slate-700">${escapeHtml(currentSearch)}</strong>"` : ""}.
      </p>
      <button id="empty-reset-btn" class="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-colors">
        Reset All Filters
      </button>
    </div>
  `;

  document.getElementById("empty-reset-btn")?.addEventListener("click", resetAllFilters);
}

// Render Event Cards (Step 6)
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
      ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
      : "bg-amber-50 text-amber-700 border-amber-200";

    // Capacity progress bar percentage
    const registered = event.capacity - event.available_seats;
    const pct = Math.min(100, Math.round((registered / event.capacity) * 100));

    return `
      <div class="card-transition bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md flex flex-col overflow-hidden animate-fadeIn">
        
        <!-- Card Top Bar -->
        <div class="p-5 pb-4 flex-1">
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center space-x-3">
              <span class="text-3xl p-2.5 rounded-2xl bg-slate-100/90 border border-slate-200/60 select-none">
                ${event.icon || "🎉"}
              </span>
              <div>
                <span class="inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${badgeClasses}">
                  ${event.category}
                </span>
                <h3 class="text-lg font-bold text-slate-800 tracking-tight mt-1 leading-snug">
                  ${escapeHtml(event.title)}
                </h3>
              </div>
            </div>
            <span class="text-xs font-bold px-2 py-0.5 rounded-md border ${feeClass}">
              ${feeText}
            </span>
          </div>

          <!-- Description preview -->
          <p class="mt-3 text-xs text-slate-500 line-clamp-2 leading-relaxed">
            ${escapeHtml(event.description || "Join us for an exciting college fest event.")}
          </p>

          <!-- Date & Venue info -->
          <div class="mt-4 space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
            <div class="flex items-center space-x-2">
              <span class="text-slate-400">📅</span>
              <span class="font-medium">${event.event_date} • ${event.event_time}</span>
            </div>
            <div class="flex items-center space-x-2">
              <span class="text-slate-400">📍</span>
              <span class="truncate">${escapeHtml(event.venue)}</span>
            </div>
          </div>
        </div>

        <!-- Card Bottom Bar: Seat Utilization & CTA -->
        <div class="px-5 py-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-3">
          
          <!-- Seats Indicator (Step 6) -->
          <div class="flex-1">
            <div class="flex items-center justify-between text-[11px] mb-1">
              <span class="text-slate-500 font-medium">Availability</span>
              ${
                isFull
                  ? `<span class="font-extrabold text-rose-600 bg-rose-100 border border-rose-200 px-2 py-0.5 rounded text-[10px] tracking-wider uppercase">FULL</span>`
                  : `<span class="font-bold text-slate-700">${event.available_seats} / ${event.capacity} seats</span>`
              }
            </div>
            <div class="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
              <div 
                class="h-1.5 rounded-full ${isFull ? 'bg-rose-500' : pct > 80 ? 'bg-amber-500' : 'bg-purple-600'}" 
                style="width: ${pct}%"
              ></div>
            </div>
          </div>

          <!-- Action Button -->
          <button 
            onclick="openEventDetails(${event.id})"
            class="px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-sm transition-all whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-purple-400
              ${
                isFull
                  ? 'bg-slate-200 hover:bg-slate-300 active:bg-slate-400 text-slate-700'
                  : 'bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white'
              }
            "
          >
            View Details
          </button>
        </div>

      </div>
    `;
  }).join("");
}

// Step 7: Open Event Details Modal
async function openEventDetails(eventId) {
  // Clear any past alerts or input errors
  resetRegistrationForm();
  modalAlert.className = "hidden mt-3 p-3.5 rounded-xl text-xs sm:text-sm font-medium border";
  modalAlert.innerHTML = "";

  formEventId.value = eventId;
  eventModal.classList.remove("hidden");
  document.body.classList.add("overflow-hidden");

  // Show loading indicator inside modal while fetching fresh details
  modalTitle.textContent = "Loading event details...";
  modalDescription.textContent = "Fetching latest seat availability and details from server...";

  try {
    const res = await fetch(`/api/events/${eventId}`);
    if (!res.ok) {
      throw new Error(`Failed to load event details (Status ${res.status})`);
    }
    const event = await res.json();
    currentEventData = event;

    // Populate modal fields
    modalIcon.textContent = event.icon || "⚡";
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
      modalSeatsBadge.innerHTML = `<span class="text-rose-600 font-extrabold bg-rose-100 px-2 py-0.5 rounded border border-rose-200">FULL (0 seats left)</span>`;
      submitRegBtn.disabled = true;
      submitBtnText.textContent = "Registration Closed (Full)";
    } else {
      modalSeatsBadge.innerHTML = `<span class="text-emerald-700 font-bold">${event.available_seats} seats available</span> <span class="text-slate-400 font-normal">of ${event.capacity} total</span>`;
      submitRegBtn.disabled = false;
      submitBtnText.textContent = "Confirm Registration";
    }

  } catch (err) {
    console.error("Modal load error:", err);
    modalTitle.textContent = "Error";
    modalDescription.textContent = err.message;
    showModalAlert("danger", "Could not load event information. Please try again.");
  }
}

// Close Modal
function closeEventModal() {
  eventModal.classList.add("hidden");
  document.body.classList.remove("overflow-hidden");
  resetRegistrationForm();
}

function resetRegistrationForm() {
  registrationForm.reset();
  formEventId.value = "";
  clearFormErrors();
  submitRegBtn.disabled = false;
  submitBtnText.textContent = "Confirm Registration";
  submitSpinner.classList.add("hidden");
}

function clearFormErrors() {
  document.querySelectorAll(".field-error").forEach(el => el.classList.add("hidden"));
  [inputStudentName, inputRollNumber, inputStudentEmail].forEach(input => {
    input.classList.remove("border-rose-400", "focus:ring-rose-400");
  });
}

function showModalAlert(type, message) {
  modalAlert.classList.remove("hidden");
  if (type === "success") {
    modalAlert.className = "mt-3 p-3.5 rounded-xl text-xs sm:text-sm font-medium border bg-emerald-50 border-emerald-200 text-emerald-800 animate-fadeIn";
    modalAlert.innerHTML = `
      <div class="flex items-center gap-2">
        <span class="text-base">🎉</span>
        <div>${message}</div>
      </div>
    `;
  } else {
    modalAlert.className = "mt-3 p-3.5 rounded-xl text-xs sm:text-sm font-medium border bg-rose-50 border-rose-200 text-rose-800 animate-fadeIn";
    modalAlert.innerHTML = `
      <div class="flex items-center gap-2">
        <span class="text-base">⚠️</span>
        <div><strong>Registration Failed:</strong> ${escapeHtml(message)}</div>
      </div>
    `;
  }
}

// Step 7: Handle Registration Form Submission
registrationForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearFormErrors();
  modalAlert.classList.add("hidden");

  const eventId = parseInt(formEventId.value, 10);
  const studentName = inputStudentName.value.trim();
  const rollNumber = inputRollNumber.value.trim();
  const email = inputStudentEmail.value.trim();
  const phone = inputStudentPhone.value.trim();

  // Client-side validation (Step 7)
  let hasClientError = false;

  if (!studentName) {
    errorStudentName.classList.remove("hidden");
    inputStudentName.classList.add("border-rose-400", "focus:ring-rose-400");
    hasClientError = true;
  }

  if (!rollNumber) {
    errorRollNumber.classList.remove("hidden");
    inputRollNumber.classList.add("border-rose-400", "focus:ring-rose-400");
    hasClientError = true;
  }

  if (!email || !email.includes("@")) {
    errorStudentEmail.classList.remove("hidden");
    inputStudentEmail.classList.add("border-rose-400", "focus:ring-rose-400");
    hasClientError = true;
  }

  if (hasClientError) {
    return;
  }

  // Submit to POST /api/events/{event_id}/register
  submitRegBtn.disabled = true;
  submitBtnText.textContent = "Submitting...";
  submitSpinner.classList.remove("hidden");

  try {
    const response = await fetch(`/api/events/${eventId}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        student_name: studentName,
        roll_number: rollNumber,
        email: email,
        phone: phone || null,
      }),
    });

    const responseData = await response.json().catch(() => ({}));

    if (response.status === 201) {
      // Step 7: Success!
      const eventTitle = currentEventData ? currentEventData.title : "this event";
      showModalAlert(
        "success",
        `You are successfully registered for <strong>${escapeHtml(eventTitle)}</strong>! A confirmation has been recorded.`
      );
      submitBtnText.textContent = "Registered!";
      submitSpinner.classList.add("hidden");

      // Re-fetch events list so seat counter drops immediately
      fetchEvents();

      // Close modal automatically after 2.2 seconds
      setTimeout(() => {
        closeEventModal();
      }, 2200);

    } else {
      // Step 7 & 9: Server returned error (400, 404, or 409)
      submitRegBtn.disabled = false;
      submitBtnText.textContent = "Confirm Registration";
      submitSpinner.classList.add("hidden");

      const serverMessage = responseData.detail || "Registration failed. Please check your inputs.";
      showModalAlert("danger", serverMessage);
    }

  } catch (networkError) {
    console.error("Network error submitting registration:", networkError);
    submitRegBtn.disabled = false;
    submitBtnText.textContent = "Confirm Registration";
    submitSpinner.classList.add("hidden");
    showModalAlert("danger", "Network error: Could not reach the server. Please check your connection.");
  }
});

// Category Filter Click Handler (Step 6)
categoryFilterContainer.addEventListener("click", (e) => {
  const btn = e.target.closest(".cat-btn");
  if (!btn) return;

  const category = btn.getAttribute("data-category");
  if (category === currentCategory) return;

  currentCategory = category;

  // Update button visual styles
  document.querySelectorAll(".cat-btn").forEach(b => {
    b.className = "cat-btn px-3.5 py-2 rounded-xl border transition-all whitespace-nowrap bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-800";
  });
  btn.className = "cat-btn active-cat px-3.5 py-2 rounded-xl border transition-all whitespace-nowrap bg-purple-600 text-white border-purple-600 shadow-sm";

  fetchEvents();
});

// Search Input with Debounce (Step 6)
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
      b.className = "cat-btn active-cat px-3.5 py-2 rounded-xl border transition-all whitespace-nowrap bg-purple-600 text-white border-purple-600 shadow-sm";
    } else {
      b.className = "cat-btn px-3.5 py-2 rounded-xl border transition-all whitespace-nowrap bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-800";
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

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  fetchEvents();
});
