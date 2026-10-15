package com.zenith26.fest.ui.screens.student

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.zenith26.fest.data.api.ApiClient
import com.zenith26.fest.data.models.EventOut
import com.zenith26.fest.ui.components.EmptyState
import com.zenith26.fest.ui.components.ErrorBanner
import com.zenith26.fest.ui.components.LoadingState
import com.zenith26.fest.ui.theme.Slate50
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@Composable
fun StudentPortalScreen(
    modifier: Modifier = Modifier
) {
    val coroutineScope = rememberCoroutineScope()
    var events by remember { mutableStateOf<List<EventOut>>(emptyList()) }
    var isLoading by remember { mutableStateOf(true) }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    var searchQuery by remember { mutableStateOf("") }
    var selectedCategory by remember { mutableStateOf("All") }
    var activeModalEventId by remember { mutableStateOf<Int?>(null) }

    var searchJob by remember { mutableStateOf<Job?>(null) }

    fun fetchEvents(category: String, search: String) {
        isLoading = true
        errorMessage = null
        coroutineScope.launch {
            try {
                val catParam = if (category != "All") category else null
                val searchParam = if (search.isNotBlank()) search.trim() else null

                val response = ApiClient.getService().getEvents(catParam, searchParam)
                if (response.isSuccessful && response.body() != null) {
                    events = response.body()!!
                } else {
                    errorMessage = ApiClient.parseErrorMessage(response)
                }
            } catch (e: Exception) {
                errorMessage = e.localizedMessage ?: "Failed to connect to server"
            } finally {
                isLoading = false
            }
        }
    }

    // Initial load
    LaunchedEffect(Unit) {
        fetchEvents(selectedCategory, searchQuery)
    }

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(Slate50)
    ) {
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(bottom = 32.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // 1. Hero Section
            item {
                HeroSection()
            }

            // 2. Flying Santa Claus & Interactive Gift Banner
            item {
                SantaFlightBanner()
            }

            // 3. Live Christmas Countdown Card
            item {
                ChristmasCountdownCard()
            }

            // 4. Controls: Search Bar & Categories
            item {
                Box(modifier = Modifier.padding(horizontal = 16.dp)) {
                    SearchBarAndFilters(
                        searchQuery = searchQuery,
                        onSearchQueryChange = { query ->
                            searchQuery = query
                            searchJob?.cancel()
                            searchJob = coroutineScope.launch {
                                delay(300) // 300ms debounce
                                fetchEvents(selectedCategory, query)
                            }
                        },
                        selectedCategory = selectedCategory,
                        onCategorySelected = { cat ->
                            selectedCategory = cat
                            fetchEvents(cat, searchQuery)
                        },
                        onResetAll = {
                            searchQuery = ""
                            selectedCategory = "All"
                            fetchEvents("All", "")
                        }
                    )
                }
            }

            // 3. States / Event Cards Grid
            when {
                isLoading -> {
                    item {
                        LoadingState(modifier = Modifier.padding(horizontal = 16.dp))
                    }
                }
                errorMessage != null -> {
                    item {
                        Box(modifier = Modifier.padding(horizontal = 16.dp)) {
                            ErrorBanner(
                                errorMessage = errorMessage!!,
                                onRetry = { fetchEvents(selectedCategory, searchQuery) }
                            )
                        }
                    }
                }
                events.isEmpty() -> {
                    item {
                        Box(modifier = Modifier.padding(horizontal = 16.dp)) {
                            EmptyState(
                                category = selectedCategory,
                                search = searchQuery,
                                onReset = {
                                    searchQuery = ""
                                    selectedCategory = "All"
                                    fetchEvents("All", "")
                                }
                            )
                        }
                    }
                }
                else -> {
                    items(events, key = { it.id }) { event ->
                        Box(modifier = Modifier.padding(horizontal = 16.dp)) {
                            EventCard(
                                event = event,
                                onViewDetails = { id ->
                                    activeModalEventId = id
                                }
                            )
                        }
                    }
                }
            }
        }

        // Event Detail & Registration Dialog
        if (activeModalEventId != null) {
            EventDetailDialog(
                eventId = activeModalEventId!!,
                onDismiss = { activeModalEventId = null },
                onRegistrationSuccess = {
                    fetchEvents(selectedCategory, searchQuery)
                }
            )
        }
    }
}
