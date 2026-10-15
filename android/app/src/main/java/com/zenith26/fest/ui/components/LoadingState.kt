package com.zenith26.fest.ui.components

import androidx.compose.foundation.layout.*
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.zenith26.fest.ui.theme.Purple600
import com.zenith26.fest.ui.theme.Slate400
import com.zenith26.fest.ui.theme.Slate700

@Composable
fun LoadingState(
    message: String = "Loading festival events...",
    subtext: String = "Connecting to FastAPI backend",
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .padding(vertical = 48.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        CircularProgressIndicator(
            modifier = Modifier.size(44.dp),
            color = Purple600,
            strokeWidth = 3.5.dp
        )
        Spacer(modifier = Modifier.height(16.dp))
        Text(
            text = message,
            fontSize = 15.sp,
            fontWeight = FontWeight.SemiBold,
            color = Slate700
        )
        Spacer(modifier = Modifier.height(4.dp))
        Text(
            text = subtext,
            fontSize = 12.sp,
            color = Slate400
        )
    }
}
