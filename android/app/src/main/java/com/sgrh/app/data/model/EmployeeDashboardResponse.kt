package com.sgrh.app.data.model

data class EmployeeDashboardResponse(
    val today_attendance: CheckInResponse?,
    val can_check_in: Boolean,
    val leave_today: Boolean,
    val pending_requests: List<PendingRequestResponse>?,
    val recent_attendances: List<CheckInResponse>?,
    val monthly_summary: MonthlySummaryResponse?,
    val calendar_events: List<CalendarEventResponse>?,
    val has_pending_absences: Boolean,
    val upcoming_holidays: List<HolidayResponse>?
)

data class PendingRequestResponse(
    val id: Int,
    val type: String,
    val date: String,
    val reason: String,
    val statusClass: String,
    val statusLabel: String
)

data class MonthlySummaryResponse(
    val worked_days: Int,
    val present_days: Int,
    val late_count: Int,
    val late_minutes: Int,
    val absence_days: Int
)

data class CalendarEventResponse(
    val date: String,
    val status: String
)