package com.zenith26.fest.ui.theme

import android.app.Activity
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val LightColorScheme = lightColorScheme(
    primary = Purple600,
    onPrimary = androidx.compose.ui.graphics.Color.White,
    primaryContainer = Purple100,
    onPrimaryContainer = Purple900,
    secondary = Slate700,
    onSecondary = androidx.compose.ui.graphics.Color.White,
    background = Slate50,
    surface = androidx.compose.ui.graphics.Color.White,
    onBackground = Slate800,
    onSurface = Slate800,
    error = Rose600,
    onError = androidx.compose.ui.graphics.Color.White
)

@Composable
fun Zenith26Theme(
    content: @Composable () -> Unit
) {
    val colorScheme = LightColorScheme
    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = Slate900.toArgb()
            window.navigationBarColor = Slate900.toArgb()
            val insetsController = WindowCompat.getInsetsController(window, view)
            insetsController.isAppearanceLightStatusBars = false
            insetsController.isAppearanceLightNavigationBars = false
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
