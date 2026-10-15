package com.zenith26.fest.data.models

import com.google.gson.annotations.SerializedName

data class EventOut(
    val id: Int,
    val title: String,
    val category: String,
    val description: String? = null,
    @SerializedName("event_date") val eventDate: String,
    @SerializedName("event_time") val eventTime: String,
    val venue: String,
    val capacity: Int,
    val fee: Int = 0,
    val icon: String? = null,
    @SerializedName("available_seats") val availableSeats: Int
) {
    val registeredCount: Int
        get() = (capacity - availableSeats).coerceAtLeast(0)

    val utilizationPct: Double
        get() = if (capacity > 0) (registeredCount.toDouble() / capacity.toDouble()) * 100.0 else 0.0

    val isFull: Boolean
        get() = availableSeats <= 0

    val isCriticalDemand: Boolean
        get() = utilizationPct >= 90.0
}
