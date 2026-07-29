package com.sgrh.app.ui.absences

import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun UnjustifiedAbsencesScreen(
    viewModel: UnjustifiedAbsenceViewModel = androidx.lifecycle.viewmodel.compose.viewModel(
        factory = UnjustifiedAbsenceViewModelFactory()
    )
) {
    val uiState by viewModel.uiState.collectAsState()
    val context = LocalContext.current

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Mes absences") },
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
            LazyColumn(
                modifier = Modifier.fillMaxSize().padding(padding).padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                if (uiState.absences.isEmpty()) {
                    item { Text("Aucune absence à justifier.", modifier = Modifier.padding(16.dp)) }
                } else {
                    items(uiState.absences) { absence ->
                        Card(modifier = Modifier.fillMaxWidth()) {
                            Column(modifier = Modifier.padding(12.dp)) {
                                Text("Absence du ${absence.from_date} au ${absence.to_date}", style = MaterialTheme.typography.titleSmall)
                                var explanation by remember { mutableStateOf("") }
                                var fileUri by remember { mutableStateOf<Uri?>(null) }

                                val launcher = rememberLauncherForActivityResult(
                                    contract = ActivityResultContracts.GetContent()
                                ) { uri -> fileUri = uri }

                                OutlinedTextField(
                                    value = explanation,
                                    onValueChange = { explanation = it },
                                    label = { Text("Explication *") },
                                    modifier = Modifier.fillMaxWidth()
                                )
                                Spacer(modifier = Modifier.height(4.dp))
                                Button(onClick = { launcher.launch("image/*") }) {
                                    Text(if (fileUri != null) "Justificatif choisi" else "Ajouter un justificatif")
                                }
                                Spacer(modifier = Modifier.height(8.dp))
                                Button(
                                    onClick = { viewModel.explainAbsence(absence.id, explanation, fileUri, context) },
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    Text("Soumettre")
                                }
                            }
                        }
                    }
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