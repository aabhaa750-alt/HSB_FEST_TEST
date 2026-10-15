package com.zenith26.fest

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.animation.Crossfade
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import com.zenith26.fest.ui.components.ServerConfigDialog
import com.zenith26.fest.ui.components.TopNavBar
import com.zenith26.fest.ui.screens.admin.AdminDashboardScreen
import com.zenith26.fest.ui.screens.student.StudentPortalScreen
import com.zenith26.fest.ui.theme.Zenith26Theme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            Zenith26Theme {
                var isAdminMode by remember { mutableStateOf(false) }
                var showServerConfig by remember { mutableStateOf(false) }
                var refreshTrigger by remember { mutableIntStateOf(0) }

                Scaffold(
                    topBar = {
                        TopNavBar(
                            isAdminMode = isAdminMode,
                            onToggleMode = { isAdminMode = !isAdminMode },
                            onRefresh = { refreshTrigger++ },
                            onOpenServerConfig = { showServerConfig = true }
                        )
                    },
                    modifier = Modifier.fillMaxSize()
                ) { innerPadding ->
                    Crossfade(
                        targetState = isAdminMode,
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(innerPadding),
                        label = "ScreenTransition"
                    ) { admin ->
                        if (admin) {
                            AdminDashboardScreen(refreshTrigger = refreshTrigger)
                        } else {
                            StudentPortalScreen()
                        }
                    }

                    if (showServerConfig) {
                        ServerConfigDialog(
                            onDismiss = { showServerConfig = false },
                            onServerUpdated = {
                                refreshTrigger++
                            }
                        )
                    }
                }
            }
        }
    }
}
