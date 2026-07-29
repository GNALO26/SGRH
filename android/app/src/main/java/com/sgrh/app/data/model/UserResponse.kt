package com.sgrh.app.data.model

data class UserResponse(
    val id: Int,
    val name: String,
    val email: String,
    val role: String,
    val avatar_url: String?,
    val matricule: String?,
    val position: String?,
    val department: String?,
    val base_salary: String?
)