package com.sgrh.app.ui.profile

import android.content.Context
import android.net.Uri
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.sgrh.app.data.api.ApiService
import com.sgrh.app.data.model.UserResponse
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.asRequestBody
import java.io.File
import java.io.FileOutputStream

data class ProfileUiState(
    val isLoading: Boolean = false,
    val user: UserResponse? = null,
    val error: String? = null,
    val uploadSuccess: Boolean = false
)

class ProfileViewModel(private val api: ApiService) : ViewModel() {

    private val _uiState = MutableStateFlow(ProfileUiState())
    val uiState: StateFlow<ProfileUiState> = _uiState

    init {
        loadProfile()
    }

    fun loadProfile() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            try {
                val response = api.getMe()
                if (response.isSuccessful) {
                    _uiState.value = _uiState.value.copy(isLoading = false, user = response.body())
                } else {
                    _uiState.value = _uiState.value.copy(isLoading = false, error = "Erreur ${response.code()}")
                }
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(isLoading = false, error = e.message)
            }
        }
    }

    fun uploadAvatar(context: Context, uri: Uri) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            try {
                val file = uriToFile(context, uri)
                val requestBody = file.asRequestBody("image/*".toMediaTypeOrNull())
                val part = MultipartBody.Part.createFormData("avatar", file.name, requestBody)
                val response = api.uploadAvatar(part)
                if (response.isSuccessful) {
                    _uiState.value = _uiState.value.copy(isLoading = false, uploadSuccess = true)
                    loadProfile()
                } else {
                    _uiState.value = _uiState.value.copy(isLoading = false, error = "Erreur lors de l'upload.")
                }
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(isLoading = false, error = e.message)
            }
        }
    }

    private fun uriToFile(context: Context, uri: Uri): File {
        val inputStream = context.contentResolver.openInputStream(uri)!!
        val file = File(context.cacheDir, "avatar.jpg")
        val outputStream = FileOutputStream(file)
        inputStream.copyTo(outputStream)
        inputStream.close()
        outputStream.close()
        return file
    }

    fun resetMessages() {
        _uiState.value = _uiState.value.copy(error = null, uploadSuccess = false)
    }
}