package com.zenith26.fest.ui.screens.admin

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.zenith26.fest.data.api.ApiClient
import com.zenith26.fest.data.models.EventOut
import com.zenith26.fest.data.models.RegistrationListItem
import com.zenith26.fest.data.models.StatsOut
import com.zenith26.fest.ui.components.ErrorBanner
import com.zenith26.fest.ui.theme.*
import kotlinx.coroutines.launch

@Composable
fun AdminDashboardScreen(
    refreshTrigger: Int,
    modifier: Modifier = Modifier
) {
    val coroutineScope = rememberCoroutineScope()
    var stats by remember { mutableStateOf<StatsOut?>(null) }
    var events by remember { mutableStateOf<List<EventOut>>(emptyList()) }
    var registrations by remember { mutableStateOf<List<RegistrationListItem>>(emptyList()) }

    var isLoadingStats by remember { mutableStateOf(true) }
    var isLoadingEvents by remember { mutableStateOf(true) }
    var isLoadingRegs by remember { mutableStateOf(false) }

    var statsError by remember { mutableStateOf<String?>(null) }

    // Active Tab: 0 = Events Matrix, 1 = Registrations List
    var activeTab by remember { mutableIntStateOf(0) }
    var filterEventId by remember { mutableStateOf<Int?>(null) }

    var showAddEventDialog by remember { mutableStateOf(false) }
    var regToCancel by remember { mutableStateOf<RegistrationListItem?>(null) }

    fun loadStats() {
        isLoadingStats = true
        statsError = null
        coroutineScope.launch {
            try {
                val res = ApiClient.getService().getStats()
                if (res.isSuccessful && res.body() != null) {
                    stats = res.body()
                } else {
                    statsError = ApiClient.parseErrorMessage(res)
                }
            } catch (e: Exception) {
                statsError = e.localizedMessage ?: "Failed to fetch stats"
            } finally {
                isLoadingStats = false
            }
        }
    }

    fun loadEvents() {
        isLoadingEvents = true
        coroutineScope.launch {
            try {
                val res = ApiClient.getService().getEvents()
                if (res.isSuccessful && res.body() != null) {
                    events = res.body()!!
                }
            } catch (_: Exception) {
            } finally {
                isLoadingEvents = false
            }
        }
    }

    fun loadRegistrations(eventId: Int? = null) {
        isLoadingRegs = true
        coroutineScope.launch {
            try {
                val res = ApiClient.getService().getRegistrations(eventId)
                if (res.isSuccessful && res.body() != null) {
                    registrations = res.body()!!
                }
            } catch (_: Exception) {
            } finally {
                isLoadingRegs = false
            }
        }
    }

    fun refreshAll() {
        loadStats()
        loadEvents()
        if (activeTab == 1) {
            loadRegistrations(filterEventId)
        }
    }

    LaunchedEffect(refreshTrigger) {
        refreshAll()
    }

    LaunchedEffect(activeTab, filterEventId) {
        if (activeTab == 1) {
            loadRegistrations(filterEventId)
        }
    }

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(Slate100)
    ) {
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(18.dp)
        ) {
            // Stats Error Banner if any
            if (statsError != null) {
                item {
                    ErrorBanner(
                        title = "Failed to Fetch Dashboard Metrics",
                        errorMessage = statsError!!,
                        onRetry = { refreshAll() }
                    )
                }
            }

            // 1. Overview Metrics (Top 4 Stat Cards)
            item {
                StatsCardsSection(stats = stats)
            }

            // 2. Category Breakdown Row
            item {
                CategoryBreakdownSection(categories = stats?.eventsByCategory)
            }

            // 3. Tab Buttons + Add Event Action Button
            item {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        // Tabs
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            // Tab 1 Button
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(12.dp))
                                    .background(if (activeTab == 0) Purple600 else Color.White)
                                    .clickable { activeTab = 0 }
                                    .padding(horizontal = 14.dp, vertical = 9.dp)
                            ) {
                                Text(
                                    text = "Event Matrix",
                                    fontSize = 12.sp,
                                    fontWeight = if (activeTab == 0) FontWeight.Bold else FontWeight.SemiBold,
                                    color = if (activeTab == 0) Color.White else Slate600
                                )
                            }

                            // Tab 2 Button
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(12.dp))
                                    .background(if (activeTab == 1) Purple600 else Color.White)
                                    .clickable { activeTab = 1 }
                                    .padding(horizontal = 14.dp, vertical = 9.dp)
                            ) {
                                Text(
                                    text = "Registrations",
                                    fontSize = 12.sp,
                                    fontWeight = if (activeTab == 1) FontWeight.Bold else FontWeight.SemiBold,
                                    color = if (activeTab == 1) Color.White else Slate600
                                )
                            }
                        }

                        // Add Event Button
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(12.dp))
                                .background(Emerald600)
                                .clickable { showAddEventDialog = true }
                                .padding(horizontal = 12.dp, vertical = 8.dp)
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(4.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Add,
                                    contentDescription = "Add",
                                    tint = Color.White,
                                    modifier = Modifier.size(15.dp)
                                )
                                Text(
                                    text = "Add Event",
                                    color = Color.White,
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                    }
                }
            }

            // 4. Tab Views
            item {
                if (activeTab == 0) {
                    EventUtilizationTable(
                        events = events,
                        isLoading = isLoadingEvents
                    )
                } else {
                    RegistrationsTable(
                        registrations = registrations,
                        events = events,
                        selectedEventId = filterEventId,
                        onEventFilterChanged = { id ->
                            filterEventId = id
                            loadRegistrations(id)
                        },
                        onCancelRegistration = { reg ->
                            regToCancel = reg
                        },
                        isLoading = isLoadingRegs
                    )
                }
            }
        }

        // Add Event Dialog
        if (showAddEventDialog) {
            AddEventDialog(
                onDismiss = { showAddEventDialog = false },
                onEventCreated = {
                    refreshAll()
                }
            )
        }

        // Cancel Registration Confirmation Dialog
        if (regToCancel != null) {
            AlertDialog(
                onDismissRequest = { regToCancel = null },
                title = { Text("Cancel Registration?", fontSize = 16.sp, fontWeight = FontWeight.Bold) },
                text = {
                    Text(
                        "Are you sure you want to cancel the registration for \"${regToCancel!!.studentName}\" in \"${regToCancel!!.eventTitle}\"? This will immediately free up 1 seat in the database.",
                        fontSize = 13.sp,
                        color = Slate600
                    )
                },
                confirmButton = {
                    Button(
                        onClick = {
                            val id = regToCancel!!.id
                            regToCancel = null
                            coroutineScope.launch {
                                try {
                                    ApiClient.getService().deleteRegistration(id)
                                    refreshAll()
                                } catch (_: Exception) {}
                            }
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = Rose600)
                    ) {
                        Text("Confirm Cancel")
                    }
                },
                dismissButton = {
                    TextButton(onClick = { regToCancel = null }) {
                        Text("Keep Registration", color = Slate600)
                    }
                }
            )
        }
    }
}
