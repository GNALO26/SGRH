package com.sgrh.app.data.model

data class UnjustifiedAbsenceResponse(
    val id: Int,
    val from_date: String,
    val to_date: String,
    val status: String,
    val explanation: String?,
    val justificatif_url: String?
)