package com.sgrh.app.ui.dashboard

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.sgrh.app.data.api.ApiService
import com.sgrh.app.data.model.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

data class DashboardUiState(
    val isLoading: Boolean = false,
    val canCheckIn: Boolean = false,
    val todayAttendance: CheckInResponse? = null,
    val leaveToday: Boolean = false,
    val pendingRequests: List<PendingRequestResponse> = emptyList(),
    val recentAttendances: List<CheckInResponse> = emptyList(),
    val monthlySummary: MonthlySummaryResponse? = null,
    val upcomingHolidays: List<HolidayResponse> = emptyList(),
    val hasPendingAbsences: Boolean = false,
    val error: String? = null,
    val checkInSuccess: Boolean = false,
    val checkInMessage: String? = null
)

class EmployeeDashboardViewModel(private val api: ApiService) : ViewModel() {

    private val _uiState = MutableStateFlow(DashboardUiState())
    val uiState: StateFlow<DashboardUiState> = _uiState

    init {
        loadDashboard()
    }

    fun loadDashboard() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            try {
                val response = api.getEmployeeDashboard()
                if (response.isSuccessful) {
                    val data = response.body()!!
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        canCheckIn = data.can_check_in,
                        todayAttendance = data.today_attendance,
                        leaveToday = data.leave_today,
                        pendingRequests = data.pending_requests ?: emptyList(),
                        recentAttendances = data.recent_attendances ?: emptyList(),
                        monthlySummary = data.monthly_summary,
                        upcomingHolidays = data.upcoming_holidays ?: emptyList(),
                        hasPendingAbsences = data.has_pending_absences
                    )
                } else {
                    _uiState.value = _uiState.value.copy(isLoading = false, error = "Erreur ${response.code()}")
                }
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(isLoading = false, error = e.message)
            }
        }
    }

    fun checkIn(latitude: Double, longitude: Double, justification: String? = null) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            try {
                val response = api.checkIn(CheckInRequest(latitude, longitude, justification))
                if (response.isSuccessful) {
                    val data = response.body()!!
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        todayAttendance = data,
                        canCheckIn = false,
                        checkInSuccess = true,
                        checkInMessage = "Pointage enregistré à ${data.check_in_time}"
                    )
                    loadDashboard() // recharge pour mettre à jour les stats
                } else {
                    val errorBody = response.errorBody()?.string()
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = errorBody ?: "Erreur lors du pointage"
                    )
                }
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(isLoading = false, error = e.message)
            }
        }
    }

    fun resetCheckInSuccess() {
        _uiState.value = _uiState.value.copy(checkInSuccess = false, checkInMessage = null)
    }

    fun resetError() {
        _uiState.value = _uiState.value.copy(error = null)
    }
}