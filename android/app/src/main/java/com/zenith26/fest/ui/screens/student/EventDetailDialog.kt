package com.zenith26.fest.ui.screens.student

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.zenith26.fest.data.api.ApiClient
import com.zenith26.fest.data.models.EventOut
import com.zenith26.fest.data.models.RegistrationIn
import com.zenith26.fest.ui.components.CategoryBadge
import com.zenith26.fest.ui.theme.*
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@Composable
fun EventDetailDialog(
    eventId: Int,
    onDismiss: () -> Unit,
    onRegistrationSuccess: () -> Unit
) {
    val coroutineScope = rememberCoroutineScope()
    var event by remember { mutableStateOf<EventOut?>(null) }
    var isLoadingEvent by remember { mutableStateOf(true) }
    var eventLoadError by remember { mutableStateOf<String?>(null) }

    // Form inputs
    var studentName by remember { mutableStateOf("") }
    var rollNumber by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }

    // Inline client errors
    var errorName by remember { mutableStateOf<String?>(null) }
    var errorRoll by remember { mutableStateOf<String?>(null) }
    var errorEmail by remember { mutableStateOf<String?>(null) }

    // Alert banner inside dialog
    var alertMessage by remember { mutableStateOf<String?>(null) }
    var isAlertSuccess by remember { mutableStateOf(false) }
    var isSubmitting by remember { mutableStateOf(false) }

    // Load fresh event detail
    LaunchedEffect(eventId) {
        isLoadingEvent = true
        eventLoadError = null
        try {
            val response = ApiClient.getService().getEventDetail(eventId)
            if (response.isSuccessful && response.body() != null) {
                event = response.body()
            } else {
                eventLoadError = ApiClient.parseErrorMessage(response)
            }
        } catch (e: Exception) {
            eventLoadError = e.localizedMessage ?: "Failed to load event details"
        } finally {
            isLoadingEvent = false
        }
    }

    Dialog(
        onDismissRequest = { if (!isSubmitting) onDismiss() },
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Card(
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            elevation = CardDefaults.cardElevation(defaultElevation = 10.dp),
            modifier = Modifier
                .fillMaxWidth(0.94f)
                .fillMaxHeight(0.90f)
                .padding(vertical = 16.dp)
        ) {
            Column(modifier = Modifier.fillMaxSize()) {

                // Modal Header with Gradient
                val headerGradient = Brush.horizontalGradient(
                    colors = listOf(Purple900, Color(0xFF312E81))
                )

                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(headerGradient)
                        .padding(18.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.Top
                    ) {
                        Row(
                            modifier = Modifier.weight(1f),
                            horizontalArrangement = Arrangement.spacedBy(12.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(46.dp)
                                    .clip(RoundedCornerShape(12.dp))
                                    .background(Color(0x33FFFFFF))
                                    .border(1.dp, Color(0x4DFFFFFF), RoundedCornerShape(12.dp)),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = event?.icon ?: "⚡",
                                    fontSize = 24.sp
                                )
                            }

                            Column {
                                Row(
                                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    if (event != null) {
                                        CategoryBadge(category = event!!.category)

                                        val feeText = if (event!!.fee == 0) "Free" else "₹${event!!.fee}"
                                        Box(
                                            modifier = Modifier
                                                .background(Color(0x3310B981), RoundedCornerShape(50))
                                                .border(1.dp, Color(0x6610B981), RoundedCornerShape(50))
                                                .padding(horizontal = 8.dp, vertical = 2.dp)
                                        ) {
                                            Text(
                                                text = feeText,
                                                color = Color(0xFFA7F3D0),
                                                fontSize = 11.sp,
                                                fontWeight = FontWeight.Bold
                                            )
                                        }
                                    }
                                }

                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = event?.title ?: "Loading...",
                                    color = Color.White,
                                    fontSize = 17.sp,
                                    fontWeight = FontWeight.Bold,
                                    lineHeight = 22.sp
                                )
                            }
                        }

                        // Close Button
                        Box(
                            modifier = Modifier
                                .size(30.dp)
                                .clip(RoundedCornerShape(50))
                                .background(Color(0x26FFFFFF))
                                .clickable { onDismiss() },
                            contentAlignment = Alignment.Center
                        ) {
                            Text(text = "✕", color = Purple200, fontSize = 14.sp)
                        }
                    }
                }

                // Modal Body (Scrollable)
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .weight(1f)
                        .verticalScroll(rememberScrollState())
                        .padding(18.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    if (isLoadingEvent) {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(160.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            CircularProgressIndicator(color = Purple600)
                        }
                    } else if (eventLoadError != null) {
                        Text(
                            text = "Error: $eventLoadError",
                            color = Rose600,
                            fontSize = 13.sp
                        )
                    } else if (event != null) {
                        val currentEv = event!!
                        val isFull = currentEv.isFull

                        // Meta details (Date, Venue, Seats)
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            // Date
                            Box(
                                modifier = Modifier
                                    .weight(1f)
                                    .clip(RoundedCornerShape(12.dp))
                                    .background(Slate50)
                                    .border(1.dp, Slate200, RoundedCornerShape(12.dp))
                                    .padding(10.dp)
                            ) {
                                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                    Text("📅", fontSize = 14.sp)
                                    Column {
                                        Text("Date & Time", fontSize = 11.sp, color = Slate400, fontWeight = FontWeight.Medium)
                                        Text("${currentEv.eventDate}\n${currentEv.eventTime}", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = Slate800)
                                    }
                                }
                            }

                            // Venue
                            Box(
                                modifier = Modifier
                                    .weight(1f)
                                    .clip(RoundedCornerShape(12.dp))
                                    .background(Slate50)
                                    .border(1.dp, Slate200, RoundedCornerShape(12.dp))
                                    .padding(10.dp)
                            ) {
                                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                    Text("📍", fontSize = 14.sp)
                                    Column {
                                        Text("Venue", fontSize = 11.sp, color = Slate400, fontWeight = FontWeight.Medium)
                                        Text(currentEv.venue, fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = Slate800)
                                    }
                                }
                            }
                        }

                        // Seats availability row
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(12.dp))
                                .background(Slate50)
                                .border(1.dp, Slate200, RoundedCornerShape(12.dp))
                                .padding(horizontal = 12.dp, vertical = 10.dp)
                        ) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                                ) {
                                    Text("🎟️", fontSize = 14.sp)
                                    Text("Available Seats:", fontSize = 12.sp, color = Slate500, fontWeight = FontWeight.Medium)
                                }

                                if (isFull) {
                                    Box(
                                        modifier = Modifier
                                            .background(Rose100, RoundedCornerShape(4.dp))
                                            .border(1.dp, Rose200, RoundedCornerShape(4.dp))
                                            .padding(horizontal = 8.dp, vertical = 2.dp)
                                    ) {
                                        Text(
                                            text = "FULL (0 seats left)",
                                            color = Rose600,
                                            fontSize = 11.sp,
                                            fontWeight = FontWeight.ExtraBold
                                        )
                                    }
                                } else {
                                    Text(
                                        text = "${currentEv.availableSeats} / ${currentEv.capacity} remaining",
                                        color = Emerald700,
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.Bold
                                    )
                                }
                            }
                        }

                        // Description Box
                        Column {
                            Text(
                                text = "ABOUT THIS EVENT",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = Slate400,
                                letterSpacing = 0.5.sp
                            )
                            Spacer(modifier = Modifier.height(6.dp))
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clip(RoundedCornerShape(12.dp))
                                    .background(Color(0x80F8FAFC))
                                    .border(1.dp, Slate100, RoundedCornerShape(12.dp))
                                    .padding(12.dp)
                            ) {
                                Text(
                                    text = currentEv.description ?: "No detailed description provided.",
                                    fontSize = 13.sp,
                                    color = Slate600,
                                    lineHeight = 18.sp
                                )
                            }
                        }

                        // Divider & Registration Form
                        Divider(color = Slate200, thickness = 1.dp)

                        Column {
                            Text(
                                text = "Register for this Event",
                                fontSize = 15.sp,
                                fontWeight = FontWeight.Bold,
                                color = Slate800
                            )
                            Text(
                                text = "Please provide your student details. Confirmation is instant.",
                                fontSize = 11.sp,
                                color = Slate500
                            )
                        }

                        // Alert Notification Banner (Success or Error)
                        if (alertMessage != null) {
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clip(RoundedCornerShape(12.dp))
                                    .background(if (isAlertSuccess) Emerald50 else Rose50)
                                    .border(1.dp, if (isAlertSuccess) Emerald400 else Rose200, RoundedCornerShape(12.dp))
                                    .padding(12.dp)
                            ) {
                                Row(
                                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(if (isAlertSuccess) "🎉" else "⚠️", fontSize = 18.sp)
                                    Text(
                                        text = alertMessage!!,
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.Medium,
                                        color = if (isAlertSuccess) Emerald700 else Rose800
                                    )
                                }
                            }
                        }

                        // Registration Form Fields
                        OutlinedTextField(
                            value = studentName,
                            onValueChange = {
                                studentName = it
                                errorName = null
                            },
                            label = { Text("Student Full Name *", fontSize = 12.sp) },
                            placeholder = { Text("e.g. Rahul Sharma", fontSize = 12.sp, color = Slate400) },
                            isError = errorName != null,
                            supportingText = {
                                if (errorName != null) {
                                    Text(errorName!!, color = Rose600, fontSize = 11.sp)
                                }
                            },
                            singleLine = true,
                            enabled = !isFull && !isSubmitting,
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(10.dp)
                        )

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            OutlinedTextField(
                                value = rollNumber,
                                onValueChange = {
                                    rollNumber = it
                                    errorRoll = null
                                },
                                label = { Text("Roll / ID Number *", fontSize = 12.sp) },
                                placeholder = { Text("e.g. 2026CS108", fontSize = 12.sp, color = Slate400) },
                                isError = errorRoll != null,
                                supportingText = {
                                    if (errorRoll != null) {
                                        Text(errorRoll!!, color = Rose600, fontSize = 11.sp)
                                    }
                                },
                                singleLine = true,
                                enabled = !isFull && !isSubmitting,
                                modifier = Modifier.weight(1f),
                                shape = RoundedCornerShape(10.dp)
                            )

                            OutlinedTextField(
                                value = phone,
                                onValueChange = { phone = it },
                                label = { Text("Phone (optional)", fontSize = 12.sp) },
                                placeholder = { Text("+91 9876543210", fontSize = 12.sp, color = Slate400) },
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                                singleLine = true,
                                enabled = !isFull && !isSubmitting,
                                modifier = Modifier.weight(1f),
                                shape = RoundedCornerShape(10.dp)
                            )
                        }

                        OutlinedTextField(
                            value = email,
                            onValueChange = {
                                email = it
                                errorEmail = null
                            },
                            label = { Text("College Email Address *", fontSize = 12.sp) },
                            placeholder = { Text("e.g. rahul@college.edu", fontSize = 12.sp, color = Slate400) },
                            isError = errorEmail != null,
                            supportingText = {
                                if (errorEmail != null) {
                                    Text(errorEmail!!, color = Rose600, fontSize = 11.sp)
                                }
                            },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                            singleLine = true,
                            enabled = !isFull && !isSubmitting,
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(10.dp)
                        )

                        // Form Actions
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(top = 8.dp),
                            horizontalArrangement = Arrangement.End,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            TextButton(
                                onClick = onDismiss,
                                enabled = !isSubmitting
                            ) {
                                Text("Cancel", color = Slate600, fontSize = 13.sp)
                            }

                            Spacer(modifier = Modifier.width(8.dp))

                            Button(
                                onClick = {
                                    // Client side validation
                                    var hasError = false
                                    if (studentName.trim().isEmpty()) {
                                        errorName = "Student name is required."
                                        hasError = true
                                    }
                                    if (rollNumber.trim().isEmpty()) {
                                        errorRoll = "Roll number is required."
                                        hasError = true
                                    }
                                    if (email.trim().isEmpty() || !email.contains("@")) {
                                        errorEmail = "A valid email address containing '@' is required."
                                        hasError = true
                                    }

                                    if (hasError) return@Button

                                    isSubmitting = true
                                    alertMessage = null

                                    coroutineScope.launch {
                                        try {
                                            val req = RegistrationIn(
                                                studentName = studentName.trim(),
                                                rollNumber = rollNumber.trim(),
                                                email = email.trim(),
                                                phone = if (phone.isNotBlank()) phone.trim() else null
                                            )
                                            val res = ApiClient.getService().registerForEvent(currentEv.id, req)
                                            if (res.isSuccessful && res.body() != null) {
                                                isAlertSuccess = true
                                                alertMessage = "You are successfully registered for ${currentEv.title}! A confirmation has been recorded."
                                                onRegistrationSuccess()
                                                delay(2200)
                                                onDismiss()
                                            } else {
                                                isAlertSuccess = false
                                                alertMessage = ApiClient.parseErrorMessage(res)
                                            }
                                        } catch (e: Exception) {
                                            isAlertSuccess = false
                                            alertMessage = "Network error: ${e.localizedMessage ?: "Could not reach the server"}"
                                        } finally {
                                            isSubmitting = false
                                        }
                                    }
                                },
                                enabled = !isFull && !isSubmitting,
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = Purple600,
                                    disabledContainerColor = if (isFull) Slate200 else Purple600.copy(alpha = 0.5f)
                                ),
                                shape = RoundedCornerShape(10.dp)
                            ) {
                                if (isSubmitting) {
                                    CircularProgressIndicator(
                                        color = Color.White,
                                        strokeWidth = 2.dp,
                                        modifier = Modifier.size(16.dp)
                                    )
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text("Submitting...", fontSize = 13.sp)
                                } else {
                                    Text(
                                        text = if (isFull) "Registration Closed (Full)" else "Confirm Registration",
                                        color = if (isFull) Slate700 else Color.White,
                                        fontSize = 13.sp,
                                        fontWeight = FontWeight.SemiBold
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
