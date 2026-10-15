package com.zenith26.fest.data.api

import android.content.Context
import android.content.SharedPreferences

object ApiConfig {
    private const val PREFS_NAME = "zenith26_prefs"
    private const val KEY_BASE_URL = "api_base_url"

    // Public live tunnel URL / Vercel cloud deployment for external devices & emulators
    const val DEFAULT_CLOUD_URL = "https://hsb-fest-test-gamma.vercel.app/"
    const val DEFAULT_EMULATOR_URL = "http://10.0.2.2:8081/"
    const val DEFAULT_LOCALHOST_URL = "http://localhost:8081/"

    private var currentBaseUrl: String = DEFAULT_CLOUD_URL

    fun init(context: Context) {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val saved = prefs.getString(KEY_BASE_URL, DEFAULT_CLOUD_URL) ?: DEFAULT_CLOUD_URL
        currentBaseUrl = if (saved.contains("trycloudflare.com")) {
            DEFAULT_CLOUD_URL
        } else {
            saved
        }
        if (!currentBaseUrl.endsWith("/")) {
            currentBaseUrl += "/"
        }
    }

    fun getBaseUrl(): String = currentBaseUrl

    fun setBaseUrl(context: Context, url: String) {
        var cleanUrl = url.trim()
        if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
            cleanUrl = "http://$cleanUrl"
        }
        if (!cleanUrl.endsWith("/")) {
            cleanUrl += "/"
        }
        currentBaseUrl = cleanUrl
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        prefs.edit().putString(KEY_BASE_URL, currentBaseUrl).apply()
        ApiClient.rebuildClient()
    }
}
