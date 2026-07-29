package com.sgrh.app.ui.profile

import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProfileScreen(
    viewModel: ProfileViewModel = androidx.lifecycle.viewmodel.compose.viewModel(
        factory = ProfileViewModelFactory()
    )
) {
    val uiState by viewModel.uiState.collectAsState()
    val context = LocalContext.current
    var selectedUri by remember { mutableStateOf<Uri?>(null) }

    val launcher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri -> selectedUri = uri }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Mon profil") },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primary,
                    titleContentColor = MaterialTheme.colorScheme.onPrimary
                )
            )
        }
    ) { padding ->
        if (uiState.isLoading) {
            Box(modifier = Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) {
                CircularProgressIndicator()
            }
        } else {
            val user = uiState.user
            Column(
                modifier = Modifier.fillMaxSize().padding(padding).padding(16.dp).verticalScroll(rememberScrollState()),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                // Avatar
                AsyncImage(
                    model = user?.avatar_url ?: "https://ui-avatars.com/api/?name=${user?.name ?: "User"}&background=0D47A1&color=fff",
                    contentDescription = "Avatar",
                    modifier = Modifier.size(100.dp)
                )
                TextButton(onClick = { launcher.launch("image/*") }) {
                    Text("Changer la photo")
                }
                selectedUri?.let { uri ->
                    Button(onClick = {
                        viewModel.uploadAvatar(context, uri)
                        selectedUri = null
                    }) { Text("Mettre à jour") }
                }

                Divider(modifier = Modifier.fillMaxWidth())

                // Infos
                user?.let {
                    Text("${it.name}", style = MaterialTheme.typography.titleLarge)
                    Text("${it.email}", style = MaterialTheme.typography.bodyMedium)
                    Text("Matricule : ${it.matricule ?: "-"}")
                    Text("Poste : ${it.position ?: "-"}")
                    Text("Service : ${it.department ?: "-"}")
                    Text("Salaire de base : ${it.base_salary ?: "-"} FCFA")
                }
            }
        }

        // Erreur
        if (uiState.error != null) {
            AlertDialog(
                onDismissRequest = { viewModel.resetMessages() },
                title = { Text("Erreur") },
                text = { Text(uiState.error!!) },
                confirmButton = { TextButton(onClick = { viewModel.resetMessages() }) { Text("OK") } }
            )
        }
    }
}