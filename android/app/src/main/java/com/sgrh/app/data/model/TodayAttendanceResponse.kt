package com.sgrh.app.data.model

data class TodayAttendanceResponse(
    val attendance: CheckInResponse?,
    val canCheckIn: Boolean
)