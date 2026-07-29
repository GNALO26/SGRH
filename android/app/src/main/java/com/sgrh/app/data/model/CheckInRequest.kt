package com.sgrh.app.data.model

data class CheckInRequest(
    val latitude: Double,
    val longitude: Double,
    val justification: String? = null
)