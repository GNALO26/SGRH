package com.sgrh.app.data.api

import com.sgrh.app.data.model.*
import okhttp3.MultipartBody
import okhttp3.RequestBody
import retrofit2.Response
import retrofit2.http.*

interface ApiService {

    @POST("login")
    suspend fun login(@Body request: LoginRequest): Response<LoginResponse>

    @GET("me")
    suspend fun getMe(): Response<UserResponse>

    @GET("employee/dashboard")
    suspend fun getEmployeeDashboard(
        @Query("month") month: Int? = null,
        @Query("year") year: Int? = null
    ): Response<EmployeeDashboardResponse>

    @POST("employee/attendance")
    suspend fun checkIn(@Body request: CheckInRequest): Response<CheckInResponse>

    @GET("employee/attendance/today")
    suspend fun getTodayAttendance(): Response<TodayAttendanceResponse>

    @GET("employee/leaves")
    suspend fun getLeaves(): Response<List<LeaveResponse>>

    @POST("employee/leaves")
    suspend fun createLeave(@Body request: LeaveRequest): Response<LeaveResponse>

    @DELETE("employee/leaves/{id}")
    suspend fun deleteLeave(@Path("id") id: Int): Response<Unit>

    @GET("employee/documents")
    suspend fun getDocuments(): Response<List<DocumentResponse>>

    @Multipart
    @POST("user/avatar")
    suspend fun uploadAvatar(@Part file: MultipartBody.Part): Response<AvatarResponse>

    @GET("employee/unjustified-absences")
    suspend fun getUnjustifiedAbsences(
        @Query("status") status: String? = null
    ): Response<List<UnjustifiedAbsenceResponse>>

    @Multipart
    @POST("employee/unjustified-absences/{id}/explain")
    suspend fun explainAbsence(
        @Path("id") id: Int,
        @Part("explanation") explanation: RequestBody,
        @Part justificatif: MultipartBody.Part?
    ): Response<Unit>

    @GET("holidays")
    suspend fun getHolidays(): Response<List<HolidayResponse>>
}