package com.sgrh.app.ui.documents

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import com.sgrh.app.SGRHApplication
import com.sgrh.app.data.api.ApiClient
import com.sgrh.app.data.local.TokenManager

class DocumentsViewModelFactory : ViewModelProvider.Factory {
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        val tokenManager = TokenManager(SGRHApplication.appContext)
        val api = ApiClient.create(tokenManager)
        return DocumentsViewModel(api) as T
    }
}