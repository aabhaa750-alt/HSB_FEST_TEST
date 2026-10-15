package com.zenith26.fest.ui.screens.admin

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.zenith26.fest.data.models.EventOut
import com.zenith26.fest.ui.components.CategoryBadge
import com.zenith26.fest.ui.theme.*

@Composable
fun EventUtilizationTable(
    events: List<EventOut>,
    isLoading: Boolean,
    modifier: Modifier = Modifier
) {
    // Sort by utilization descending as strictly required
    val sortedEvents = events.sortedByDescending { it.utilizationPct }

    Card(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
        border = CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(Slate200)),
        modifier = modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.fillMaxWidth()) {
            
            // Header Info Bar
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
                            text = "Live Event Demand Matrix",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold,
                            color = Slate800
                        )

                        Box(
                            modifier = Modifier
                                .background(Rose50, RoundedCornerShape(6.dp))
                                .border(1.dp, Rose200, RoundedCornerShape(6.dp))
                                .padding(horizontal = 6.dp, vertical = 2.dp)
                        ) {
                            Text(
                                text = "• >90% Alert",
                                color = Rose700,
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                    Spacer(modifier = Modifier.height(2.dp))
                    Text(
                        text = "Sorted by utilization % descending. Events >90% capacity highlighted in warning red.",
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
            } else if (sortedEvents.isEmpty()) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(24.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text("No events found in database.", color = Slate500, fontSize = 13.sp)
                }
            } else {
                // Horizontally scrollable complete table to preserve all columns without clipping
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
                        Text("EVENT TITLE", fontWeight = FontWeight.Bold, fontSize = 10.sp, color = Slate600, modifier = Modifier.width(180.dp))
                        Text("CATEGORY", fontWeight = FontWeight.Bold, fontSize = 10.sp, color = Slate600, modifier = Modifier.width(110.dp))
                        Text("DATE & TIME", fontWeight = FontWeight.Bold, fontSize = 10.sp, color = Slate600, modifier = Modifier.width(130.dp))
                        Text("VENUE", fontWeight = FontWeight.Bold, fontSize = 10.sp, color = Slate600, modifier = Modifier.width(130.dp))
                        Text("REG. / CAP.", fontWeight = FontWeight.Bold, fontSize = 10.sp, color = Slate600, modifier = Modifier.width(90.dp))
                        Text("UTILIZATION %", fontWeight = FontWeight.Bold, fontSize = 10.sp, color = Slate600, modifier = Modifier.width(130.dp))
                    }

                    // Table Data Rows
                    sortedEvents.forEach { ev ->
                        val isOver90 = ev.isCriticalDemand
                        val pct = Math.round(ev.utilizationPct * 10.0) / 10.0
                        val rowBg = if (isOver90) Color(0xB3FFF1F2) else Color.White

                        Row(
                            modifier = Modifier
                                .background(rowBg)
                                .border(width = 0.5.dp, color = Slate100)
                                .padding(horizontal = 14.dp, vertical = 10.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            // Title & Icon & ID
                            Row(
                                modifier = Modifier.width(180.dp),
                                horizontalArrangement = Arrangement.spacedBy(8.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(ev.icon ?: "⚡", fontSize = 18.sp)
                                Column {
                                    Row(
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                                    ) {
                                        Text(
                                            text = ev.title,
                                            fontWeight = FontWeight.Bold,
                                            fontSize = 12.sp,
                                            color = Slate800,
                                            maxLines = 1
                                        )
                                        if (isOver90) {
                                            Box(
                                                modifier = Modifier
                                                    .background(Rose600, RoundedCornerShape(3.dp))
                                                    .padding(horizontal = 4.dp, vertical = 1.dp)
                                            ) {
                                                Text(
                                                    text = ">90%",
                                                    color = Color.White,
                                                    fontSize = 9.sp,
                                                    fontWeight = FontWeight.Black
                                                )
                                            }
                                        }
                                    }
                                    Text(
                                        text = "ID #${ev.id} • ${if (ev.fee == 0) "Free" else "₹${ev.fee}"}",
                                        fontSize = 10.sp,
                                        color = Slate400
                                    )
                                }
                            }

                            // Category
                            Box(modifier = Modifier.width(110.dp)) {
                                CategoryBadge(category = ev.category)
                            }

                            // Date & Time
                            Column(modifier = Modifier.width(130.dp)) {
                                Text(ev.eventDate, fontSize = 11.sp, fontWeight = FontWeight.Medium, color = Slate700)
                                Text(ev.eventTime, fontSize = 10.sp, color = Slate400)
                            }

                            // Venue
                            Text(
                                text = ev.venue,
                                fontSize = 11.sp,
                                color = Slate700,
                                maxLines = 1,
                                modifier = Modifier.width(130.dp)
                            )

                            // Reg. / Capacity
                            Row(modifier = Modifier.width(90.dp)) {
                                Text(
                                    text = "${ev.registeredCount}",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = if (isOver90) Rose700 else Slate800
                                )
                                Text(
                                    text = " / ${ev.capacity}",
                                    fontSize = 11.sp,
                                    color = Slate500
                                )
                            }

                            // Utilization % + Bar
                            Row(
                                modifier = Modifier.width(130.dp),
                                horizontalArrangement = Arrangement.spacedBy(8.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = "$pct%",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Black,
                                    color = if (isOver90) Rose700 else Slate800
                                )

                                val barPct = (pct / 100.0).toFloat().coerceIn(0f, 1f)
                                val barColor = when {
                                    isOver90 -> Rose500
                                    pct > 75.0 -> Amber500
                                    else -> Purple600
                                }

                                LinearProgressIndicator(
                                    progress = barPct,
                                    color = barColor,
                                    trackColor = Slate200,
                                    modifier = Modifier
                                        .width(60.dp)
                                        .height(6.dp)
                                        .clip(RoundedCornerShape(3.dp))
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}
