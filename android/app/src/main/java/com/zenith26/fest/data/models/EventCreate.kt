package com.zenith26.fest.data.models

import com.google.gson.annotations.SerializedName

data class EventCreate(
    val title: String,
    val category: String,
    val description: String? = "",
    @SerializedName("event_date") val eventDate: String,
    @SerializedName("event_time") val eventTime: String,
    val venue: String,
    val capacity: Int,
    val fee: Int = 0,
    val icon: String? = "🎉"
)
