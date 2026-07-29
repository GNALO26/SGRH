package com.sgrh.app.ui.leaves

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LeavesScreen(
    viewModel: LeavesViewModel = androidx.lifecycle.viewmodel.compose.viewModel(
        factory = LeavesViewModelFactory()
    )
) {
    val uiState by viewModel.uiState.collectAsState()
    var showCreateDialog by remember { mutableStateOf(false) }
    var startDate by remember { mutableStateOf("") }
    var endDate by remember { mutableStateOf("") }
    var reason by remember { mutableStateOf("") }
    var type by remember { mutableStateOf("absence") }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Mes demandes") },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primary,
                    titleContentColor = MaterialTheme.colorScheme.onPrimary
                )
            )
        },
        floatingActionButton = {
            FloatingActionButton(onClick = { showCreateDialog = true }) {
                Text("+")
            }
        }
    ) { padding ->
        if (uiState.isLoading) {
            Box(modifier = Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) {
                CircularProgressIndicator()
            }
        } else {
            LazyColumn(
                modifier = Modifier.fillMaxSize().padding(padding).padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                if (uiState.leaves.isEmpty()) {
                    item {
                        Text("Aucune demande.", modifier = Modifier.padding(16.dp))
                    }
                } else {
                    items(uiState.leaves) { leave ->
                        Card(modifier = Modifier.fillMaxWidth()) {
                            Column(modifier = Modifier.padding(12.dp)) {
                                Text("${leave.type} - ${leave.start_date} → ${leave.end_date}")
                                Text(leave.reason, style = MaterialTheme.typography.bodySmall)
                                Text(leave.status, color = when (leave.status) {
                                    "approved" -> MaterialTheme.colorScheme.primary
                                    "rejected" -> MaterialTheme.colorScheme.error
                                    else -> MaterialTheme.colorScheme.onSurfaceVariant
                                })
                                if (leave.status == "pending") {
                                    TextButton(onClick = { viewModel.deleteLeave(leave.id) }) {
                                        Text("Annuler")
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        // Dialogue de création
        if (showCreateDialog) {
            AlertDialog(
                onDismissRequest = { showCreateDialog = false },
                title = { Text("Nouvelle demande") },
                text = {
                    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        OutlinedTextField(value = startDate, onValueChange = { startDate = it }, label = { Text("Début (YYYY-MM-DD)") })
                        OutlinedTextField(value = endDate, onValueChange = { endDate = it }, label = { Text("Fin (YYYY-MM-DD)") })
                        OutlinedTextField(value = reason, onValueChange = { reason = it }, label = { Text("Motif") })
                        Row {
                            RadioButton(selected = type == "absence", onClick = { type = "absence" })
                            Text("Absence")
                            Spacer(modifier = Modifier.width(16.dp))
                            RadioButton(selected = type == "vacation", onClick = { type = "vacation" })
                            Text("Congé")
                        }
                    }
                },
                confirmButton = {
                    TextButton(onClick = {
                        viewModel.createLeave(startDate, endDate, type, reason)
                        showCreateDialog = false
                    }) { Text("Envoyer") }
                },
                dismissButton = {
                    TextButton(onClick = { showCreateDialog = false }) { Text("Annuler") }
                }
            )
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