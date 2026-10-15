package com.zenith26.fest.ui.screens.student

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.zenith26.fest.ui.theme.*
import kotlinx.coroutines.delay
import java.util.Calendar

data class TimeRemaining(
    val days: Long,
    val hours: Long,
    val minutes: Long,
    val seconds: Long,
    val isChristmas: Boolean
)

fun calculateTimeRemaining(): TimeRemaining {
    val now = Calendar.getInstance()
    val currentYear = now.get(Calendar.YEAR)

    val target = Calendar.getInstance().apply {
        set(Calendar.YEAR, currentYear)
        set(Calendar.MONTH, Calendar.DECEMBER)
        set(Calendar.DAY_OF_MONTH, 25)
        set(Calendar.HOUR_OF_DAY, 0)
        set(Calendar.MINUTE, 0)
        set(Calendar.SECOND, 0)
        set(Calendar.MILLISECOND, 0)
    }

    if (now.after(target)) {
        if (now.get(Calendar.MONTH) == Calendar.DECEMBER && now.get(Calendar.DAY_OF_MONTH) == 25) {
            return TimeRemaining(0, 0, 0, 0, isChristmas = true)
        }
        target.set(Calendar.YEAR, currentYear + 1)
    }

    val diffMillis = target.timeInMillis - now.timeInMillis
    if (diffMillis <= 0) {
        return TimeRemaining(0, 0, 0, 0, isChristmas = true)
    }

    val secondsTotal = diffMillis / 1000
    val days = secondsTotal / (24 * 3600)
    val hours = (secondsTotal % (24 * 3600)) / 3600
    val minutes = (secondsTotal % 3600) / 60
    val seconds = secondsTotal % 60

    return TimeRemaining(days, hours, minutes, seconds, isChristmas = false)
}

@Composable
fun ChristmasCountdownCard(
    title: String = "The Magic of Christmas Begins In...",
    modifier: Modifier = Modifier
) {
    var timeRemaining by remember { mutableStateOf(calculateTimeRemaining()) }

    LaunchedEffect(Unit) {
        while (true) {
            timeRemaining = calculateTimeRemaining()
            delay(1000)
        }
    }

    val cardBg = Brush.verticalGradient(
        colors = listOf(
            Color(0xFF064E3B), // Forest Green
            Color(0xFF022C22),
            Color(0xFF041D14)
        )
    )

    Box(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp)
            .background(cardBg, RoundedCornerShape(20.dp))
            .border(2.dp, Color(0xFFF59E0B).copy(alpha = 0.5f), RoundedCornerShape(20.dp))
            .padding(16.dp)
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.fillMaxWidth()
        ) {
            // Badge
            Box(
                modifier = Modifier
                    .background(Color(0x66451A03), RoundedCornerShape(50))
                    .border(1.dp, Color(0xFFF59E0B).copy(alpha = 0.4f), RoundedCornerShape(50))
                    .padding(horizontal = 12.dp, vertical = 4.dp)
            ) {
                Text(
                    text = "✨ Holiday Countdown ✨",
                    color = Color(0xFFFDE68A),
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Title
            Text(
                text = title,
                color = Color.White,
                fontSize = 16.sp,
                fontWeight = FontWeight.ExtraBold,
                textAlign = TextAlign.Center
            )

            Text(
                text = "Counting down to Dec 25 at midnight",
                color = Color(0xFFA7F3D0),
                fontSize = 11.sp,
                fontWeight = FontWeight.Light,
                textAlign = TextAlign.Center
            )

            Spacer(modifier = Modifier.height(14.dp))

            if (timeRemaining.isChristmas) {
                // Merry Christmas Banner
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(
                            Brush.horizontalGradient(
                                listOf(Color(0xFF991B1B), Color(0xFF065F46), Color(0xFF991B1B))
                            ),
                            RoundedCornerShape(12.dp)
                        )
                        .border(1.dp, Color(0xFFFBBF24), RoundedCornerShape(12.dp))
                        .padding(12.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "🎅 Merry Christmas! 🎄\nMay your season be filled with joy!",
                        color = Color(0xFFFEF08A),
                        fontWeight = FontWeight.Bold,
                        fontSize = 15.sp,
                        textAlign = TextAlign.Center
                    )
                }
            } else {
                // 4 Time Cards: Days, Hours, Minutes, Seconds
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceEvenly
                ) {
                    CountdownTile(label = "Days", value = String.format("%02d", timeRemaining.days))
                    CountdownTile(label = "Hours", value = String.format("%02d", timeRemaining.hours))
                    CountdownTile(label = "Minutes", value = String.format("%02d", timeRemaining.minutes))
                    CountdownTile(label = "Seconds", value = String.format("%02d", timeRemaining.seconds))
                }
            }
        }
    }
}

@Composable
fun CountdownTile(
    label: String,
    value: String
) {
    val tileBg = Brush.verticalGradient(
        colors = listOf(
            Color(0xFF8B1524),
            Color(0xFF5C0A15)
        )
    )

    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier
            .width(68.dp)
            .background(tileBg, RoundedCornerShape(12.dp))
            .border(1.dp, Color(0xFFF59E0B).copy(alpha = 0.4f), RoundedCornerShape(12.dp))
            .padding(vertical = 8.dp)
    ) {
        Text(
            text = value,
            color = Color(0xFFFDE68A),
            fontSize = 20.sp,
            fontWeight = FontWeight.Black
        )
        Text(
            text = label.uppercase(),
            color = Color(0xFFFBBF24).copy(alpha = 0.8f),
            fontSize = 9.sp,
            fontWeight = FontWeight.Bold,
            letterSpacing = 0.5.sp
        )
    }
}
