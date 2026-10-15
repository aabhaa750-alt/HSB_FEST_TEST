package com.zenith26.fest.ui.screens.admin

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
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
import com.zenith26.fest.data.models.StatsOut
import com.zenith26.fest.ui.theme.*

@Composable
fun StatsCardsSection(
    stats: StatsOut?,
    modifier: Modifier = Modifier
) {
    Column(modifier = modifier.fillMaxWidth()) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Overview Metrics",
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold,
                color = Slate800
            )
            Text(
                text = "Live computed from SQLite",
                fontSize = 11.sp,
                color = Slate500
            )
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Grid of 4 Cards: 2 rows of 2
        Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
            // Row 1: Total Events & Total Registrations
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                // Card 1: Total Events
                StatCard(
                    modifier = Modifier.weight(1f),
                    title = "TOTAL EVENTS",
                    icon = "🎪",
                    iconBg = Purple50,
                    value = stats?.totalEvents?.toString() ?: "--",
                    subtext = "Across 5 fest domains"
                )

                // Card 2: Total Registrations
                StatCard(
                    modifier = Modifier.weight(1f),
                    title = "TOTAL REGISTRATIONS",
                    icon = "👥",
                    iconBg = Blue100,
                    value = stats?.totalRegistrations?.toString() ?: "--",
                    subtext = "Students enrolled"
                )
            }

            // Row 2: Capacity Utilization & Upcoming Events
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                // Card 3: Overall Utilization
                Card(
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
                    border = CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(Slate200)),
                    modifier = Modifier.weight(1f)
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "OVERALL UTILIZATION",
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                color = Slate500,
                                letterSpacing = 0.5.sp
                            )
                            Box(
                                modifier = Modifier
                                    .size(32.dp)
                                    .clip(RoundedCornerShape(10.dp))
                                    .background(Emerald50),
                                contentAlignment = Alignment.Center
                            ) {
                                Text("📈", fontSize = 15.sp)
                            }
                        }

                        Spacer(modifier = Modifier.height(6.dp))
                        Row(
                            verticalAlignment = Alignment.Bottom,
                            horizontalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            Text(
                                text = if (stats != null) "${stats.overallUtilizationPct}%" else "--%",
                                fontSize = 24.sp,
                                fontWeight = FontWeight.Black,
                                color = Slate900
                            )
                            Text(
                                text = if (stats != null) "of ${stats.totalCapacity} seats" else "of 0 total seats",
                                fontSize = 10.sp,
                                color = Slate500,
                                modifier = Modifier.padding(bottom = 3.dp)
                            )
                        }

                        Spacer(modifier = Modifier.height(8.dp))
                        val pctFloat = ((stats?.overallUtilizationPct ?: 0.0) / 100.0).toFloat().coerceIn(0f, 1f)
                        LinearProgressIndicator(
                            progress = pctFloat,
                            color = Purple600,
                            trackColor = Slate100,
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(5.dp)
                                .clip(RoundedCornerShape(3.dp))
                        )
                    }
                }

                // Card 4: Upcoming Events
                StatCard(
                    modifier = Modifier.weight(1f),
                    title = "UPCOMING EVENTS",
                    icon = "⏳",
                    iconBg = Amber100,
                    value = stats?.upcomingEventsCount?.toString() ?: "--",
                    subtext = "Scheduled today or later"
                )
            }
        }
    }
}

@Composable
private fun StatCard(
    title: String,
    icon: String,
    iconBg: Color,
    value: String,
    subtext: String,
    modifier: Modifier = Modifier
) {
    Card(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
        border = CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(Slate200)),
        modifier = modifier
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = title,
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold,
                    color = Slate500,
                    letterSpacing = 0.5.sp
                )
                Box(
                    modifier = Modifier
                        .size(32.dp)
                        .clip(RoundedCornerShape(10.dp))
                        .background(iconBg),
                    contentAlignment = Alignment.Center
                ) {
                    Text(icon, fontSize = 15.sp)
                }
            }

            Spacer(modifier = Modifier.height(6.dp))
            Text(
                text = value,
                fontSize = 24.sp,
                fontWeight = FontWeight.Black,
                color = Slate900
            )

            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = subtext,
                fontSize = 10.sp,
                color = Slate400
            )
        }
    }
}
