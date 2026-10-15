package com.zenith26.fest

import com.zenith26.fest.data.models.EventOut
import org.junit.Assert.*
import org.junit.Test

class EventModelTest {

    @Test
    fun testEventCalculations() {
        val eventNormal = EventOut(
            id = 1,
            title = "Code Sprint 2.0",
            category = "Technical",
            description = "Test desc",
            eventDate = "2026-11-14",
            eventTime = "10:00 AM",
            venue = "Auditorium",
            capacity = 100,
            fee = 0,
            icon = "💻",
            availableSeats = 20
        )

        assertEquals(80, eventNormal.registeredCount)
        assertEquals(80.0, eventNormal.utilizationPct, 0.01)
        assertFalse(eventNormal.isFull)
        assertFalse(eventNormal.isCriticalDemand)

        // Event > 90%
        val eventCritical = eventNormal.copy(availableSeats = 5)
        assertEquals(95, eventCritical.registeredCount)
        assertEquals(95.0, eventCritical.utilizationPct, 0.01)
        assertFalse(eventCritical.isFull)
        assertTrue(eventCritical.isCriticalDemand)

        // Event Full
        val eventFull = eventNormal.copy(availableSeats = 0)
        assertEquals(100, eventFull.registeredCount)
        assertEquals(100.0, eventFull.utilizationPct, 0.01)
        assertTrue(eventFull.isFull)
        assertTrue(eventFull.isCriticalDemand)
    }
}
