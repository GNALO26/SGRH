package com.sgrh.app.data.model

data class LeaveResponse(
    val id: Int,
    val type: String,
    val start_date: String,
    val end_date: String,
    val reason: String,
    val status: String
)