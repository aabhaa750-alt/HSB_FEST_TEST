package com.zenith26.fest.ui.theme

import androidx.compose.ui.graphics.Color

// Slates
val Slate950 = Color(0xFF020617)
val Slate900 = Color(0xFF0F172A)
val Slate800 = Color(0xFF1E293B)
val Slate700 = Color(0xFF334155)
val Slate600 = Color(0xFF475569)
val Slate500 = Color(0xFF64748B)
val Slate400 = Color(0xFF94A3B8)
val Slate300 = Color(0xFFCBD5E1)
val Slate200 = Color(0xFFE2E8F0)
val Slate100 = Color(0xFFF1F5F9)
val Slate50  = Color(0xFFF8FAFC)

// Purples (Brand)
val Purple950 = Color(0xFF3B0764)
val Purple900 = Color(0xFF4C1D95)
val Purple800 = Color(0xFF5B21B6)
val Purple700 = Color(0xFF6D28D9)
val Purple600 = Color(0xFF7C3AED)
val Purple500 = Color(0xFF8B5CF6)
val Purple400 = Color(0xFFC084FC)
val Purple300 = Color(0xFFD8B4FE)
val Purple200 = Color(0xFFE9D5FF)
val Purple100 = Color(0xFFEDE9FE)
val Purple50  = Color(0xFFF5F3FF)

// Accents
val Pink400  = Color(0xFFF472B6)
val Amber300 = Color(0xFFFCD34D)
val Amber400 = Color(0xFFFBBF24)
val Amber500 = Color(0xFFF59E0B)
val Amber700 = Color(0xFFB45309)
val Amber100 = Color(0xFFFEF3C7)
val Amber50  = Color(0xFFFFFBEB)

// Emeralds
val Emerald400 = Color(0xFF34D399)
val Emerald500 = Color(0xFF10B981)
val Emerald600 = Color(0xFF059669)
val Emerald700 = Color(0xFF047857)
val Emerald100 = Color(0xFFD1FAE5)
val Emerald50  = Color(0xFFECFDF5)

// Blues (Technical)
val Blue700 = Color(0xFF1D4ED8)
val Blue200 = Color(0xFFBFDBFE)
val Blue100 = Color(0xFFDBEAFE)

// Fuchsia (Cultural)
val Fuchsia700 = Color(0xFFA21CAF)
val Fuchsia200 = Color(0xFFF5D0FE)
val Fuchsia100 = Color(0xFFFAE8FF)

// Cyan (Workshop)
val Cyan700 = Color(0xFF0E7490)
val Cyan200 = Color(0xFFA5F3FC)
val Cyan100 = Color(0xFFCFFAFE)

// Roses (Critical / Full / Errors)
val Rose800 = Color(0xFF9F1239)
val Rose700 = Color(0xFFBE123C)
val Rose600 = Color(0xFFE11D48)
val Rose500 = Color(0xFFF43F5E)
val Rose200 = Color(0xFFFECDD3)
val Rose100 = Color(0xFFFFE4E6)
val Rose50  = Color(0xFFFFF1F2)

// Category Badge Color Palette
data class BadgeColors(
    val background: Color,
    val text: Color,
    val border: Color
)

fun getCategoryColors(category: String): BadgeColors {
    return when (category.lowercase()) {
        "technical" -> BadgeColors(
            background = Blue100,
            text = Blue700,
            border = Blue200
        )
        "cultural" -> BadgeColors(
            background = Fuchsia100,
            text = Fuchsia700,
            border = Fuchsia200
        )
        "sports" -> BadgeColors(
            background = Emerald100,
            text = Emerald700,
            border = Emerald400.copy(alpha = 0.5f)
        )
        "gaming" -> BadgeColors(
            background = Amber100,
            text = Amber700,
            border = Amber300
        )
        "workshop" -> BadgeColors(
            background = Cyan100,
            text = Cyan700,
            border = Cyan200
        )
        else -> BadgeColors(
            background = Purple100,
            text = Purple700,
            border = Purple300
        )
    }
}
