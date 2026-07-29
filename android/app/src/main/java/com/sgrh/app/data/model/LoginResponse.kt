package com.sgrh.app.data.model

data class LoginResponse(
    val token: String,
    val user: UserResponse,
    val requires_explanation: Boolean?,
    val pending_absences: List<PendingAbsenceResponse>?
)