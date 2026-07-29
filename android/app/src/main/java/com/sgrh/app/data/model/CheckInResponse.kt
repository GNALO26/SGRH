package com.sgrh.app.data.model

data class CheckInResponse(
    val id: Int,
    val date: String,
    val check_in_time: String,
    val status: String,
    val late_minutes: Int?,
    val is_justified: Boolean,
    val justification: String?
)