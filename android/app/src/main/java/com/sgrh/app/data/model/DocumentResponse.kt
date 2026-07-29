package com.sgrh.app.data.model

data class DocumentResponse(
    val id: Int,
    val title: String,
    val file_url: String,
    val type: String,
    val created_at: String
)