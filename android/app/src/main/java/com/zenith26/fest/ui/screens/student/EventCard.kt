package com.zenith26.fest.ui.screens.student

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.zenith26.fest.data.models.EventOut
import com.zenith26.fest.ui.components.CategoryBadge
import com.zenith26.fest.ui.theme.*

@Composable
fun EventCard(
    event: EventOut,
    onViewDetails: (Int) -> Unit,
    modifier: Modifier = Modifier
) {
    val isFull = event.isFull
    val registered = event.registeredCount
    val pct = if (event.capacity > 0) (registered.toFloat() / event.capacity.toFloat()).coerceIn(0f, 1f) else 0f

    val feeBg = if (event.fee == 0) Emerald50 else Amber50
    val feeText = if (event.fee == 0) Emerald700 else Amber700
    val feeBorder = if (event.fee == 0) Emerald400.copy(alpha = 0.5f) else Amber300
    val feeLabel = if (event.fee == 0) "Free" else "₹${event.fee}"

    Card(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        border = CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(Slate200)),
        modifier = modifier
            .fillMaxWidth()
            .clickable { onViewDetails(event.id) }
    ) {
        Column(modifier = Modifier.fillMaxWidth()) {
            
            // Top Section
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp)
            ) {
                // Header row: Icon + Category + Title + Fee Badge
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
                        // Icon Box
                        Box(
                            modifier = Modifier
                                .size(46.dp)
                                .clip(RoundedCornerShape(14.dp))
                                .background(Slate100)
                                .border(1.dp, Slate200, RoundedCornerShape(14.dp)),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = event.icon ?: "🎉",
                                fontSize = 24.sp
                            )
                        }

                        Column {
                            CategoryBadge(category = event.category)
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = event.title,
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold,
                                color = Slate800,
                                lineHeight = 20.sp,
                                maxLines = 2,
                                overflow = TextOverflow.Ellipsis
                            )
                        }
                    }

                    // Fee Badge
                    Box(
                        modifier = Modifier
                            .background(feeBg, RoundedCornerShape(6.dp))
                            .border(1.dp, feeBorder, RoundedCornerShape(6.dp))
                            .padding(horizontal = 8.dp, vertical = 2.dp)
                    ) {
                        Text(
                            text = feeLabel,
                            color = feeText,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }

                // Description
                Spacer(modifier = Modifier.height(10.dp))
                Text(
                    text = event.description ?: "Join us for an exciting college fest event.",
                    color = Slate500,
                    fontSize = 12.sp,
                    lineHeight = 16.sp,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis
                )

                // Date & Venue Section
                Spacer(modifier = Modifier.height(12.dp))
                Divider(color = Slate100, thickness = 1.dp)
                Spacer(modifier = Modifier.height(10.dp))

                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Text(text = "📅", fontSize = 12.sp)
                    Text(
                        text = "${event.eventDate} • ${event.eventTime}",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Medium,
                        color = Slate600
                    )
                }

                Spacer(modifier = Modifier.height(4.dp))

                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Text(text = "📍", fontSize = 12.sp)
                    Text(
                        text = event.venue,
                        fontSize = 12.sp,
                        color = Slate600,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                }
            }

            // Bottom Section: Capacity bar & CTA
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Slate50)
                    .border(width = 1.dp, color = Slate100)
                    .padding(horizontal = 16.dp, vertical = 12.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                // Availability column
                Column(
                    modifier = Modifier
                        .weight(1f)
                        .padding(end = 16.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Availability",
                            fontSize = 11.sp,
                            color = Slate500,
                            fontWeight = FontWeight.Medium
                        )

                        if (isFull) {
                            Box(
                                modifier = Modifier
                                    .background(Rose100, RoundedCornerShape(4.dp))
                                    .border(1.dp, Rose200, RoundedCornerShape(4.dp))
                                    .padding(horizontal = 6.dp, vertical = 1.dp)
                            ) {
                                Text(
                                    text = "FULL",
                                    color = Rose600,
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.ExtraBold,
                                    letterSpacing = 0.5.sp
                                )
                            }
                        } else {
                            Text(
                                text = "${event.availableSeats} / ${event.capacity} seats",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = Slate700
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(4.dp))

                    // Progress Bar
                    val barColor = when {
                        isFull -> Rose500
                        pct > 0.8f -> Amber500
                        else -> Purple600
                    }

                    LinearProgressIndicator(
                        progress = pct,
                        color = barColor,
                        trackColor = Slate200,
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(6.dp)
                            .clip(RoundedCornerShape(3.dp))
                    )
                }

                // View Details Button
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(10.dp))
                        .background(if (isFull) Slate200 else Purple600)
                        .clickable { onViewDetails(event.id) }
                        .padding(horizontal = 14.dp, vertical = 8.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "View Details",
                        color = if (isFull) Slate700 else Color.White,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.SemiBold
                    )
                }
            }
        }
    }
}
