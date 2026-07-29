package com.sgrh.app.ui.leaves

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.sgrh.app.data.api.ApiService
import com.sgrh.app.data.model.LeaveRequest
import com.sgrh.app.data.model.LeaveResponse
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

data class LeavesUiState(
    val isLoading: Boolean = false,
    val leaves: List<LeaveResponse> = emptyList(),
    val error: String? = null,
    val createSuccess: Boolean = false,
    val createMessage: String? = null,
    val deleteSuccess: Boolean = false
)

class LeavesViewModel(private val api: ApiService) : ViewModel() {

    private val _uiState = MutableStateFlow(LeavesUiState())
    val uiState: StateFlow<LeavesUiState> = _uiState

    init {
        loadLeaves()
    }

    fun loadLeaves() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            try {
                val response = api.getLeaves()
                if (response.isSuccessful) {
                    _uiState.value = _uiState.value.copy(isLoading = false, leaves = response.body() ?: emptyList())
                } else {
                    _uiState.value = _uiState.value.copy(isLoading = false, error = "Erreur ${response.code()}")
                }
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(isLoading = false, error = e.message)
            }
        }
    }

    fun createLeave(startDate: String, endDate: String, type: String, reason: String) {
        if (startDate.isBlank() || endDate.isBlank() || reason.isBlank()) {
            _uiState.value = _uiState.value.copy(error = "Tous les champs sont obligatoires.")
            return
        }
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            try {
                val response = api.createLeave(LeaveRequest(startDate, endDate, type, reason))
                if (response.isSuccessful) {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        createSuccess = true,
                        createMessage = "Demande envoyée avec succès."
                    )
                    loadLeaves()
                } else {
                    val errorBody = response.errorBody()?.string()
                    _uiState.value = _uiState.value.copy(isLoading = false, error = errorBody ?: "Erreur lors de la création.")
                }
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(isLoading = false, error = e.message)
            }
        }
    }

    fun deleteLeave(id: Int) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            try {
                val response = api.deleteLeave(id)
                if (response.isSuccessful) {
                    _uiState.value = _uiState.value.copy(isLoading = false, deleteSuccess = true)
                    loadLeaves()
                } else {
                    _uiState.value = _uiState.value.copy(isLoading = false, error = "Erreur lors de l'annulation.")
                }
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(isLoading = false, error = e.message)
            }
        }
    }

    fun resetMessages() {
        _uiState.value = _uiState.value.copy(createSuccess = false, createMessage = null, deleteSuccess = false, error = null)
    }
}