package com.zenith26.fest.data.models

import com.google.gson.annotations.SerializedName

data class RegistrationIn(
    @SerializedName("student_name") val studentName: String,
    @SerializedName("roll_number") val rollNumber: String,
    val email: String,
    val phone: String? = null
)

data class RegistrationOut(
    val id: Int,
    @SerializedName("event_id") val eventId: Int,
    @SerializedName("student_name") val studentName: String,
    @SerializedName("registered_at") val registeredAt: String
)

data class RegistrationListItem(
    val id: Int,
    @SerializedName("event_id") val eventId: Int,
    @SerializedName("student_name") val studentName: String,
    @SerializedName("roll_number") val rollNumber: String,
    val email: String,
    val phone: String? = null,
    @SerializedName("registered_at") val registeredAt: String,
    @SerializedName("event_title") val eventTitle: String
)
