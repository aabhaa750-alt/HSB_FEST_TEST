package com.zenith26.fest.ui.screens.student

import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.ExperimentalTextApi
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.zenith26.fest.ui.theme.*

@OptIn(ExperimentalTextApi::class)
@Composable
fun HeroSection(
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current

    val bgGradient = Brush.verticalGradient(
        colors = listOf(
            Color(0xFF2B050D), // Deep Xmas Wine
            Color(0xFF4D0B17), // Crimson
            Color(0xFF0A2318)  // Dark Pine
        )
    )

    val titleGradient = Brush.horizontalGradient(
        colors = listOf(
            Color(0xFFFDE68A), // Light Gold
            Color(0xFFF59E0B), // Amber Gold
            Color(0xFFFEF08A)  // Yellow Gold
        )
    )

    Column(
        modifier = modifier
            .fillMaxWidth()
            .background(bgGradient)
            .padding(horizontal = 20.dp, vertical = 24.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // Tag Pill: Christmas Edition
        Box(
            modifier = Modifier
                .background(Color(0x99450A0A), RoundedCornerShape(50))
                .border(1.dp, Color(0xFFD97706).copy(alpha = 0.5f), RoundedCornerShape(50))
                .padding(horizontal = 14.dp, vertical = 5.dp)
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                Text(
                    text = "🎄 Christmas Edition",
                    color = Color(0xFFFDE68A),
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold
                )
                Text(text = "•", color = Color(0xFFD97706), fontSize = 11.sp)
                Text(
                    text = "Nov 14–15, 2026",
                    color = Color(0xFFFED7AA),
                    fontSize = 11.sp,
                    fontWeight = FontWeight.SemiBold
                )
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Interactive Bell Button
        Box(
            modifier = Modifier
                .background(Color(0x66041D14), RoundedCornerShape(50))
                .border(1.dp, Color(0xFFF59E0B).copy(alpha = 0.4f), RoundedCornerShape(50))
                .clickable {
                    Toast.makeText(context, "🔔 Ringing Christmas Bells! Holiday Chimes! ✨", Toast.LENGTH_SHORT).show()
                }
                .padding(horizontal = 14.dp, vertical = 6.dp)
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                Text(text = "🔔", fontSize = 14.sp)
                Text(
                    text = "Tap to ring Christmas bells ✨",
                    color = Color(0xFFFDE68A),
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Medium
                )
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Festive Greeting Script
        Text(
            text = "Welcome to the Christmas Wonderland",
            color = Color(0xFFFDE68A),
            fontSize = 18.sp,
            fontWeight = FontWeight.SemiBold,
            textAlign = TextAlign.Center
        )

        Spacer(modifier = Modifier.height(4.dp))

        // Big Headline
        Text(
            text = "Celebrate the Season at",
            color = Color.White,
            fontSize = 24.sp,
            fontWeight = FontWeight.Black,
            textAlign = TextAlign.Center,
            letterSpacing = (-0.5).sp,
            lineHeight = 28.sp
        )

        Text(
            text = "Zenith '26",
            style = TextStyle(
                brush = titleGradient,
                fontSize = 36.sp,
                fontWeight = FontWeight.Black,
                letterSpacing = (-1).sp,
                textAlign = TextAlign.Center
            )
        )

        Spacer(modifier = Modifier.height(8.dp))

        // Tagline
        Text(
            text = "Step into a magical holiday experience where competitive spirit meets festive cheer across 14 adrenaline-fueled hackathons, cultural spectacles, and esports battles.",
            color = Color(0xFFFEF3C7).copy(alpha = 0.9f),
            fontSize = 12.sp,
            fontWeight = FontWeight.Light,
            textAlign = TextAlign.Center,
            lineHeight = 17.sp,
            modifier = Modifier.padding(horizontal = 8.dp)
        )

        Spacer(modifier = Modifier.height(16.dp))

        // Key stats summary row
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.Center,
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Stat 1
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(5.dp),
                modifier = Modifier.padding(horizontal = 6.dp)
            ) {
                Box(
                    modifier = Modifier
                        .size(7.dp)
                        .clip(CircleShape)
                        .background(Emerald400)
                )
                Text(
                    text = "14 Events",
                    color = Color(0xFFFED7AA),
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Medium
                )
            }

            Text(text = "•", color = Color(0xFFD97706), fontSize = 11.sp)

            // Stat 2
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(5.dp),
                modifier = Modifier.padding(horizontal = 6.dp)
            ) {
                Box(
                    modifier = Modifier
                        .size(7.dp)
                        .clip(CircleShape)
                        .background(Color(0xFFB91C1C))
                )
                Text(
                    text = "2 Days",
                    color = Color(0xFFFED7AA),
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Medium
                )
            }

            Text(text = "•", color = Color(0xFFD97706), fontSize = 11.sp)

            // Stat 3
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(5.dp),
                modifier = Modifier.padding(horizontal = 6.dp)
            ) {
                Box(
                    modifier = Modifier
                        .size(7.dp)
                        .clip(CircleShape)
                        .background(Color(0xFFF59E0B))
                )
                Text(
                    text = "5 Domains",
                    color = Color(0xFFFED7AA),
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Medium
                )
            }
        }
    }
}
