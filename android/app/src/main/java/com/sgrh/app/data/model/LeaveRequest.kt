package com.sgrh.app.data.model

data class LeaveRequest(
    val start_date: String,
    val end_date: String,
    val type: String,
    val reason: String
)