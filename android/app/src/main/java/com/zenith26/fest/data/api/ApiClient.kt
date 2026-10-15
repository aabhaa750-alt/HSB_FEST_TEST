package com.zenith26.fest.data.api

import com.google.gson.Gson
import com.google.gson.JsonObject
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Response
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

object ApiClient {
    private val gson = Gson()
    private var cachedService: ZenithApiService? = null

    private val okHttpClient: OkHttpClient by lazy {
        val logging = HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        }
        OkHttpClient.Builder()
            .addInterceptor(logging)
            .connectTimeout(15, TimeUnit.SECONDS)
            .readTimeout(15, TimeUnit.SECONDS)
            .writeTimeout(15, TimeUnit.SECONDS)
            .build()
    }

    @Synchronized
    fun getService(): ZenithApiService {
        if (cachedService == null) {
            val retrofit = Retrofit.Builder()
                .baseUrl(ApiConfig.getBaseUrl())
                .client(okHttpClient)
                .addConverterFactory(GsonConverterFactory.create(gson))
                .build()
            cachedService = retrofit.create(ZenithApiService::class.java)
        }
        return cachedService!!
    }

    @Synchronized
    fun rebuildClient() {
        cachedService = null
    }

    /**
     * Extracts meaningful error message from FastAPI responses (400, 404, 409).
     */
    fun parseErrorMessage(response: Response<*>): String {
        return try {
            val errorBody = response.errorBody()?.string() ?: return "HTTP ${response.code()}: ${response.message()}"
            val json = gson.fromJson(errorBody, JsonObject::class.java)
            if (json.has("detail")) {
                val detail = json.get("detail")
                if (detail.isJsonPrimitive) {
                    detail.asString
                } else if (detail.isJsonArray) {
                    val array = detail.asJsonArray
                    val first = array.firstOrNull()?.asJsonObject
                    first?.get("msg")?.asString ?: detail.toString()
                } else {
                    detail.toString()
                }
            } else {
                errorBody
            }
        } catch (e: Exception) {
            "Error (${response.code()}): ${response.message()}"
        }
    }
}
