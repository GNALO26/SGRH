package com.sgrh.app.ui.absences

import android.content.Context
import android.net.Uri
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.sgrh.app.data.api.ApiService
import com.sgrh.app.data.model.UnjustifiedAbsenceResponse
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.asRequestBody
import okhttp3.RequestBody.Companion.toRequestBody
import java.io.File
import java.io.FileOutputStream

data class UnjustifiedAbsenceUiState(
    val isLoading: Boolean = false,
    val absences: List<UnjustifiedAbsenceResponse> = emptyList(),
    val error: String? = null,
    val explainSuccess: Boolean = false,
    val explainMessage: String? = null
)

class UnjustifiedAbsenceViewModel(private val api: ApiService) : ViewModel() {

    private val _uiState = MutableStateFlow(UnjustifiedAbsenceUiState())
    val uiState: StateFlow<UnjustifiedAbsenceUiState> = _uiState

    init {
        loadAbsences()
    }

    fun loadAbsences() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            try {
                val response = api.getUnjustifiedAbsences(status = "pending")
                if (response.isSuccessful) {
                    _uiState.value = _uiState.value.copy(isLoading = false, absences = response.body() ?: emptyList())
                } else {
                    _uiState.value = _uiState.value.copy(isLoading = false, error = "Erreur ${response.code()}")
                }
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(isLoading = false, error = e.message)
            }
        }
    }

    fun explainAbsence(id: Int, explanation: String, justificatifUri: Uri?, context: Context) {
        if (explanation.isBlank()) {
            _uiState.value = _uiState.value.copy(error = "L'explication est obligatoire.")
            return
        }
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            try {
                val explanationPart = explanation.toRequestBody("text/plain".toMediaTypeOrNull())
                var justificatifPart: MultipartBody.Part? = null
                if (justificatifUri != null) {
                    val file = uriToFile(context, justificatifUri)
                    val requestBody = file.asRequestBody("image/*".toMediaTypeOrNull())
                    justificatifPart = MultipartBody.Part.createFormData("justificatif", file.name, requestBody)
                }
                val response = api.explainAbsence(id, explanationPart, justificatifPart)
                if (response.isSuccessful) {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        explainSuccess = true,
                        explainMessage = "Justification envoyée."
                    )
                    loadAbsences()
                } else {
                    val errorBody = response.errorBody()?.string()
                    _uiState.value = _uiState.value.copy(isLoading = false, error = errorBody ?: "Erreur lors de la justification.")
                }
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(isLoading = false, error = e.message)
            }
        }
    }

    private fun uriToFile(context: Context, uri: Uri): File {
        val inputStream = context.contentResolver.openInputStream(uri)!!
        val file = File(context.cacheDir, "justificatif_${System.currentTimeMillis()}.jpg")
        val outputStream = FileOutputStream(file)
        inputStream.copyTo(outputStream)
        inputStream.close()
        outputStream.close()
        return file
    }

    fun resetMessages() {
        _uiState.value = _uiState.value.copy(error = null, explainSuccess = false, explainMessage = null)
    }
}