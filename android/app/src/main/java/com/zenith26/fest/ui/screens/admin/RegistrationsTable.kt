package com.zenith26.fest.ui.screens.admin

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowDropDown
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.zenith26.fest.data.models.EventOut
import com.zenith26.fest.data.models.RegistrationListItem
import com.zenith26.fest.ui.theme.*

@Composable
fun RegistrationsTable(
    registrations: List<RegistrationListItem>,
    events: List<EventOut>,
    selectedEventId: Int?,
    onEventFilterChanged: (Int?) -> Unit,
    onCancelRegistration: (RegistrationListItem) -> Unit,
    isLoading: Boolean,
    modifier: Modifier = Modifier
) {
    var dropdownExpanded by remember { mutableStateOf(false) }

    Card(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
        border = CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(Slate200)),
        modifier = modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.fillMaxWidth()) {
            
            // Header Bar & Event Filter Dropdown
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color(0x99F8FAFC))
                    .border(width = 1.dp, color = Slate200)
                    .padding(14.dp)
            ) {
                Column {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Student Registrations Ledger",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold,
                            color = Slate800
                        )

                        // Filter Dropdown Anchor
                        Box {
                            val selectedTitle = if (selectedEventId == null) {
                                "All Events (${events.size})"
                            } else {
                                val ev = events.find { it.id == selectedEventId }
                                ev?.let { "ID ${it.id}: ${it.title}" } ?: "All Events"
                            }

                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(10.dp))
                                    .background(Color.White)
                                    .border(1.dp, Slate200, RoundedCornerShape(10.dp))
                                    .clickable { dropdownExpanded = true }
                                    .padding(horizontal = 10.dp, vertical = 6.dp)
                            ) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                                ) {
                                    Text(
                                        text = selectedTitle,
                                        fontSize = 11.sp,
                                        color = Slate700,
                                        fontWeight = FontWeight.Medium
                                    )
                                    Icon(
                                        imageVector = Icons.Default.ArrowDropDown,
                                        contentDescription = "Dropdown",
                                        tint = Slate500,
                                        modifier = Modifier.size(16.dp)
                                    )
                                }
                            }

                            DropdownMenu(
                                expanded = dropdownExpanded,
                                onDismissRequest = { dropdownExpanded = false }
                            ) {
                                DropdownMenuItem(
                                    text = { Text("All Events (${events.size})", fontSize = 12.sp) },
                                    onClick = {
                                        onEventFilterChanged(null)
                                        dropdownExpanded = false
                                    }
                                )
                                events.forEach { ev ->
                                    DropdownMenuItem(
                                        text = { Text("ID ${ev.id}: ${ev.title}", fontSize = 12.sp) },
                                        onClick = {
                                            onEventFilterChanged(ev.id)
                                            dropdownExpanded = false
                                        }
                                    )
                                }
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(2.dp))
                    Text(
                        text = "Inspect every enrolled student and cancel registrations when necessary.",
                        fontSize = 11.sp,
                        color = Slate500
                    )
                }
            }

            if (isLoading) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(140.dp),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator(color = Purple600, modifier = Modifier.size(32.dp))
                }
            } else if (registrations.isEmpty()) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(24.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text("No student registrations recorded yet.", color = Slate500, fontSize = 13.sp)
                }
            } else {
                val horizontalScrollState = rememberScrollState()

                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .horizontalScroll(horizontalScrollState)
                ) {
                    // Table Header Row
                    Row(
                        modifier = Modifier
                            .background(Slate50)
                            .border(width = 1.dp, color = Slate200)
                            .padding(horizontal = 14.dp, vertical = 10.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("#ID", fontWeight = FontWeight.Bold, fontSize = 10.sp, color = Slate600, modifier = Modifier.width(55.dp))
                        Text("STUDENT NAME", fontWeight = FontWeight.Bold, fontSize = 10.sp, color = Slate600, modifier = Modifier.width(130.dp))
                        Text("ROLL NUMBER", fontWeight = FontWeight.Bold, fontSize = 10.sp, color = Slate600, modifier = Modifier.width(100.dp))
                        Text("EMAIL", fontWeight = FontWeight.Bold, fontSize = 10.sp, color = Slate600, modifier = Modifier.width(160.dp))
                        Text("PHONE", fontWeight = FontWeight.Bold, fontSize = 10.sp, color = Slate600, modifier = Modifier.width(100.dp))
                        Text("EVENT", fontWeight = FontWeight.Bold, fontSize = 10.sp, color = Slate600, modifier = Modifier.width(140.dp))
                        Text("REGISTERED AT", fontWeight = FontWeight.Bold, fontSize = 10.sp, color = Slate600, modifier = Modifier.width(130.dp))
                        Text("ACTION", fontWeight = FontWeight.Bold, fontSize = 10.sp, color = Slate600, modifier = Modifier.width(80.dp))
                    }

                    // Rows
                    registrations.forEach { reg ->
                        Row(
                            modifier = Modifier
                                .background(Color.White)
                                .border(width = 0.5.dp, color = Slate100)
                                .padding(horizontal = 14.dp, vertical = 10.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "#${reg.id}",
                                fontSize = 11.sp,
                                fontFamily = FontFamily.Monospace,
                                color = Slate500,
                                modifier = Modifier.width(55.dp)
                            )

                            Text(
                                text = reg.studentName,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = Slate800,
                                modifier = Modifier.width(130.dp)
                            )

                            Text(
                                text = reg.rollNumber,
                                fontSize = 11.sp,
                                fontFamily = FontFamily.Monospace,
                                color = Slate600,
                                modifier = Modifier.width(100.dp)
                            )

                            Text(
                                text = reg.email,
                                fontSize = 11.sp,
                                color = Purple700,
                                fontWeight = FontWeight.Medium,
                                modifier = Modifier.width(160.dp)
                            )

                            Text(
                                text = reg.phone ?: "—",
                                fontSize = 11.sp,
                                color = Slate500,
                                modifier = Modifier.width(100.dp)
                            )

                            Box(modifier = Modifier.width(140.dp)) {
                                Box(
                                    modifier = Modifier
                                        .background(Slate100, RoundedCornerShape(6.dp))
                                        .border(1.dp, Slate200, RoundedCornerShape(6.dp))
                                        .padding(horizontal = 6.dp, vertical = 2.dp)
                                ) {
                                    Text(
                                        text = reg.eventTitle,
                                        fontSize = 11.sp,
                                        color = Slate700,
                                        fontWeight = FontWeight.Medium,
                                        maxLines = 1
                                    )
                                }
                            }

                            Text(
                                text = reg.registeredAt,
                                fontSize = 10.sp,
                                color = Slate400,
                                modifier = Modifier.width(130.dp)
                            )

                            // Cancel Button
                            Box(
                                modifier = Modifier.width(80.dp),
                                contentAlignment = Alignment.CenterStart
                            ) {
                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(6.dp))
                                        .background(Rose50)
                                        .border(1.dp, Rose200, RoundedCornerShape(6.dp))
                                        .clickable { onCancelRegistration(reg) }
                                        .padding(horizontal = 8.dp, vertical = 4.dp)
                                ) {
                                    Text(
                                        text = "Cancel",
                                        color = Rose600,
                                        fontSize = 11.sp,
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
