package com.sgrh.app.ui.auth

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.sgrh.app.data.api.ApiClient
import com.sgrh.app.data.local.TokenManager
import com.sgrh.app.data.model.LoginRequest
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

data class AuthUiState(
    val isLoading: Boolean = false,
    val isLoggedIn: Boolean = false,
    val error: String? = null
)

class AuthViewModel(application: Application) : AndroidViewModel(application) {

    private val tokenManager = TokenManager(application)
    private val api = ApiClient.create(tokenManager)

    private val _uiState = MutableStateFlow(AuthUiState())
    val uiState: StateFlow<AuthUiState> = _uiState

    fun login(email: String, password: String) {
        if (email.isBlank() || password.isBlank()) {
            _uiState.value = AuthUiState(error = "Veuillez remplir tous les champs.")
            return
        }

        viewModelScope.launch {
            _uiState.value = AuthUiState(isLoading = true)
            try {
                val response = api.login(LoginRequest(email, password))
                if (response.isSuccessful) {
                    val data = response.body()!!
                    tokenManager.saveToken(data.token, data.user.role)
                    _uiState.value = AuthUiState(isLoggedIn = true)
                } else {
                    _uiState.value = AuthUiState(error = "Email ou mot de passe incorrect.")
                }
            } catch (e: Exception) {
                _uiState.value = AuthUiState(error = e.message ?: "Erreur réseau.")
            }
        }
    }

    fun resetError() {
        _uiState.value = _uiState.value.copy(error = null)
    }
}