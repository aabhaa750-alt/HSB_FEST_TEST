package com.zenith26.fest.data.api

import com.zenith26.fest.data.models.*
import retrofit2.Response
import retrofit2.http.*

interface ZenithApiService {

    @GET("api/events")
    suspend fun getEvents(
        @Query("category") category: String? = null,
        @Query("search") search: String? = null
    ): Response<List<EventOut>>

    @GET("api/events/{event_id}")
    suspend fun getEventDetail(
        @Path("event_id") eventId: Int
    ): Response<EventOut>

    @POST("api/events/{event_id}/register")
    suspend fun registerForEvent(
        @Path("event_id") eventId: Int,
        @Body registration: RegistrationIn
    ): Response<RegistrationOut>

    @GET("api/registrations")
    suspend fun getRegistrations(
        @Query("event_id") eventId: Int? = null
    ): Response<List<RegistrationListItem>>

    @GET("api/stats")
    suspend fun getStats(): Response<StatsOut>

    @POST("api/events")
    suspend fun createEvent(
        @Body eventCreate: EventCreate
    ): Response<EventOut>

    @DELETE("api/registrations/{registration_id}")
    suspend fun deleteRegistration(
        @Path("registration_id") registrationId: Int
    ): Response<Map<String, Any>>
}
