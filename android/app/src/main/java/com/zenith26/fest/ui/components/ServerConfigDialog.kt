package com.zenith26.fest.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.zenith26.fest.data.api.ApiConfig
import com.zenith26.fest.ui.theme.*

@Composable
fun ServerConfigDialog(
    onDismiss: () -> Unit,
    onServerUpdated: () -> Unit
) {
    val context = LocalContext.current
    var urlText by remember { mutableStateOf(ApiConfig.getBaseUrl()) }

    Dialog(onDismissRequest = onDismiss) {
        Card(
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            elevation = CardDefaults.cardElevation(defaultElevation = 8.dp),
            modifier = Modifier
                .fillMaxWidth()
                .padding(8.dp)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(20.dp)
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(
                        text = "Backend Server URL",
                        fontSize = 17.sp,
                        fontWeight = FontWeight.Bold,
                        color = Slate800
                    )
                    Text(
                        text = "✕",
                        fontSize = 18.sp,
                        color = Slate400,
                        modifier = Modifier
                            .clickable { onDismiss() }
                            .padding(4.dp)
                    )
                }

                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "Configure the FastAPI endpoint for your environment:",
                    fontSize = 12.sp,
                    color = Slate500
                )

                Spacer(modifier = Modifier.height(14.dp))

                // Presets
                Row(
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Box(
                        modifier = Modifier
                            .weight(1.3f)
                            .clip(RoundedCornerShape(8.dp))
                            .background(if (urlText.contains("vercel.app")) Purple100 else Slate100)
                            .border(
                                1.dp,
                                if (urlText.contains("vercel.app")) Purple600 else Slate200,
                                RoundedCornerShape(8.dp)
                            )
                            .clickable { urlText = "https://hsb-fest-test-gamma.vercel.app/" }
                            .padding(vertical = 8.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "Vercel Cloud\n(Live Production)",
                            fontSize = 10.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = if (urlText.contains("vercel.app")) Purple700 else Slate700,
                            lineHeight = 13.sp
                        )
                    }

                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(8.dp))
                            .background(if (urlText.contains("10.0.2.2")) Purple100 else Slate100)
                            .border(
                                1.dp,
                                if (urlText.contains("10.0.2.2")) Purple600 else Slate200,
                                RoundedCornerShape(8.dp)
                            )
                            .clickable { urlText = "http://10.0.2.2:8081/" }
                            .padding(vertical = 8.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "Emulator\n(10.0.2.2)",
                            fontSize = 10.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = if (urlText.contains("10.0.2.2")) Purple700 else Slate700,
                            lineHeight = 13.sp
                        )
                    }

                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(8.dp))
                            .background(if (urlText.contains("localhost")) Purple100 else Slate100)
                            .border(
                                1.dp,
                                if (urlText.contains("localhost")) Purple600 else Slate200,
                                RoundedCornerShape(8.dp)
                            )
                            .clickable { urlText = "http://localhost:8081/" }
                            .padding(vertical = 8.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "Localhost\n(Local Port)",
                            fontSize = 10.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = if (urlText.contains("localhost")) Purple700 else Slate700,
                            lineHeight = 13.sp
                        )
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                OutlinedTextField(
                    value = urlText,
                    onValueChange = { urlText = it },
                    label = { Text("Base URL", fontSize = 12.sp) },
                    singleLine = true,
                    textStyle = LocalTextStyle.current.copy(fontSize = 13.sp),
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(10.dp)
                )

                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    text = "For a physical phone, enter your computer's LAN IP (e.g. http://192.168.1.15:8081/)",
                    fontSize = 11.sp,
                    color = Slate400,
                    lineHeight = 14.sp
                )

                Spacer(modifier = Modifier.height(20.dp))

                Row(
                    horizontalArrangement = Arrangement.End,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    TextButton(onClick = onDismiss) {
                        Text("Cancel", color = Slate600)
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                    Button(
                        onClick = {
                            ApiConfig.setBaseUrl(context, urlText)
                            onServerUpdated()
                            onDismiss()
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = Purple600),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Text("Save & Connect")
                    }
                }
            }
        }
    }
}
