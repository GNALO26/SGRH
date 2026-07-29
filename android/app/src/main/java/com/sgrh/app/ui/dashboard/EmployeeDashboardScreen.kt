package com.sgrh.app.ui.dashboard

import android.Manifest
import android.content.pm.PackageManager
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Fingerprint
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.core.content.ContextCompat
import com.google.android.gms.location.LocationServices
import com.sgrh.app.data.model.CheckInResponse
import com.sgrh.app.data.model.PendingRequestResponse

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EmployeeDashboardScreen(
    viewModel: EmployeeDashboardViewModel = androidx.lifecycle.viewmodel.compose.viewModel(
        factory = EmployeeDashboardViewModelFactory()
    )
) {
    val uiState by viewModel.uiState.collectAsState()
    val context = LocalContext.current

    // Demande de permission de localisation
    val launcher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission()
    ) { granted ->
        if (granted) {
            val fusedLocationClient = LocationServices.getFusedLocationProviderClient(context)
            if (ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
                fusedLocationClient.lastLocation.addOnSuccessListener { location ->
                    location?.let {
                        viewModel.checkIn(it.latitude, it.longitude)
                    }
                }
            }
        }
    }

    fun requestLocationAndCheckIn() {
        if (ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
            val fusedLocationClient = LocationServices.getFusedLocationProviderClient(context)
            fusedLocationClient.lastLocation.addOnSuccessListener { location ->
                location?.let {
                    viewModel.checkIn(it.latitude, it.longitude)
                }
            }
        } else {
            launcher.launch(Manifest.permission.ACCESS_FINE_LOCATION)
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("SGRH") },
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
                // Carte de pointage
                item {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
                    ) {
                        Column(
                            modifier = Modifier.padding(16.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Text("Pointage du jour", style = MaterialTheme.typography.titleMedium)
                            Spacer(modifier = Modifier.height(8.dp))
                            if (uiState.todayAttendance != null) {
                                Text("Pointé à ${uiState.todayAttendance!!.check_in_time}", color = MaterialTheme.colorScheme.primary)
                            } else if (uiState.canCheckIn) {
                                Button(
                                    onClick = { requestLocationAndCheckIn() },
                                    modifier = Modifier.fillMaxWidth().height(50.dp)
                                ) {
                                    Icon(Icons.Default.Fingerprint, contentDescription = null)
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text("Marquer ma présence")
                                }
                            } else {
                                Text("Pointage non disponible", color = MaterialTheme.colorScheme.onSurfaceVariant)
                            }
                            if (uiState.checkInSuccess) {
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(uiState.checkInMessage ?: "", color = MaterialTheme.colorScheme.primary)
                            }
                        }
                    }
                }

                // Demandes en attente
                if (uiState.pendingRequests.isNotEmpty()) {
                    item {
                        Text("Mes demandes en attente", style = MaterialTheme.typography.titleSmall)
                    }
                    items(uiState.pendingRequests) { req ->
                        Card(modifier = Modifier.fillMaxWidth()) {
                            Column(modifier = Modifier.padding(12.dp)) {
                                Text("${if (req.type == "leave") "Congé" else "Retard"} - ${req.date}")
                                Text(req.reason, style = MaterialTheme.typography.bodySmall)
                                Text(req.statusLabel, color = MaterialTheme.colorScheme.primary)
                            }
                        }
                    }
                }

                // Derniers pointages
                if (uiState.recentAttendances.isNotEmpty()) {
                    item {
                        Text("Derniers pointages", style = MaterialTheme.typography.titleSmall)
                    }
                    items(uiState.recentAttendances) { att ->
                        Card(modifier = Modifier.fillMaxWidth()) {
                            Row(modifier = Modifier.padding(12.dp)) {
                                Text(att.date)
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(att.check_in_time)
                                Spacer(modifier = Modifier.weight(1f))
                                Text(att.status, fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }

                // Résumé mensuel
                uiState.monthlySummary?.let { summary ->
                    item {
                        Card(modifier = Modifier.fillMaxWidth()) {
                            Column(modifier = Modifier.padding(16.dp)) {
                                Text("Résumé du mois", style = MaterialTheme.typography.titleSmall)
                                Text("Jours travaillés : ${summary.worked_days}")
                                Text("Présences : ${summary.present_days}")
                                Text("Retards : ${summary.late_count} (${summary.late_minutes} min)")
                                Text("Absences : ${summary.absence_days}")
                            }
                        }
                    }
                }
            }
        }

        // Dialog d'erreur
        if (uiState.error != null) {
            AlertDialog(
                onDismissRequest = { viewModel.resetError() },
                title = { Text("Erreur") },
                text = { Text(uiState.error!!) },
                confirmButton = {
                    TextButton(onClick = { viewModel.resetError() }) { Text("OK") }
                }
            )
        }
    }
}