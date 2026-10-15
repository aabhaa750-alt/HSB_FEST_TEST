package com.zenith26.fest.ui.screens.student

import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.ui.text.ExperimentalTextApi
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.zenith26.fest.ui.theme.*

@OptIn(ExperimentalTextApi::class)
@Composable
fun HeroSection(modifier: Modifier = Modifier) {
    val bgGradient = Brush.verticalGradient(
        colors = listOf(
            Slate900,
            Purple950,
            Color(0xFF1E1B4B)
        )
    )

    val titleGradient = Brush.horizontalGradient(
        colors = listOf(Purple400, Pink400, Amber300)
    )

    Column(
        modifier = modifier
            .fillMaxWidth()
            .background(bgGradient)
            .padding(horizontal = 20.dp, vertical = 28.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // Tag Pill: Annual National College Fest
        Box(
            modifier = Modifier
                .background(Color(0x99581C87), RoundedCornerShape(50))
                .border(1.dp, Color(0x4DA855F7), RoundedCornerShape(50))
                .padding(horizontal = 14.dp, vertical = 5.dp)
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                Text(
                    text = "🎉 Annual National College Fest",
                    color = Purple200,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Medium
                )
                Text(text = "•", color = Purple400, fontSize = 11.sp)
                Text(
                    text = "Nov 14–15, 2026",
                    color = Purple200,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.SemiBold
                )
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // Big Headline
        Text(
            text = "Experience the Surge at",
            color = Color.White,
            fontSize = 26.sp,
            fontWeight = FontWeight.Black,
            textAlign = TextAlign.Center,
            letterSpacing = (-0.5).sp,
            lineHeight = 32.sp
        )

        Text(
            text = "Zenith '26",
            style = TextStyle(
                brush = titleGradient,
                fontSize = 34.sp,
                fontWeight = FontWeight.Black,
                letterSpacing = (-1).sp,
                textAlign = TextAlign.Center
            )
        )

        Spacer(modifier = Modifier.height(10.dp))

        // Tagline
        Text(
            text = "Compete, create, perform, and connect across 14 adrenaline-fueled technical hackathons, cultural spectacles, esports battles, and masterclasses.",
            color = Slate300,
            fontSize = 13.sp,
            fontWeight = FontWeight.Light,
            textAlign = TextAlign.Center,
            lineHeight = 18.sp,
            modifier = Modifier.padding(horizontal = 12.dp)
        )

        Spacer(modifier = Modifier.height(18.dp))

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
                    color = Slate300,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Medium
                )
            }

            Text(text = "•", color = Slate500, fontSize = 11.sp)

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
                        .background(Purple400)
                )
                Text(
                    text = "2 Days",
                    color = Slate300,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Medium
                )
            }

            Text(text = "•", color = Slate500, fontSize = 11.sp)

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
                        .background(Amber400)
                )
                Text(
                    text = "5 Categories",
                    color = Slate300,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Medium
                )
            }
        }
    }
}
