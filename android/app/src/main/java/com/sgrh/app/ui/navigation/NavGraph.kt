package com.sgrh.app.ui.navigation

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import com.sgrh.app.ui.dashboard.EmployeeDashboardScreen
import com.sgrh.app.ui.leaves.LeavesScreen
import com.sgrh.app.ui.documents.DocumentsScreen
import com.sgrh.app.ui.profile.ProfileScreen
import com.sgrh.app.ui.absences.UnjustifiedAbsencesScreen

sealed class Screen(val route: String, val title: String, val icon: ImageVector) {
    object Dashboard : Screen("dashboard", "Tableau de bord", Icons.Default.Home)
    object Pointage : Screen("pointage", "Pointage", Icons.Default.Fingerprint)
    object Leaves : Screen("leaves", "Mes demandes", Icons.Default.List)
    object Documents : Screen("documents", "Mes documents", Icons.Default.Folder)
    object Profile : Screen("profile", "Mon profil", Icons.Default.Person)
    object Absences : Screen("absences", "Mes absences", Icons.Default.Warning) // ← doit être présent
}

@Composable
fun NavGraph(navController: NavHostController) {
    NavHost(navController = navController, startDestination = Screen.Dashboard.route) {
        composable(Screen.Dashboard.route) { EmployeeDashboardScreen() }
        composable(Screen.Pointage.route) { EmployeeDashboardScreen() }
        composable(Screen.Leaves.route) { LeavesScreen() }
        composable(Screen.Documents.route) { DocumentsScreen() }
        composable(Screen.Profile.route) { ProfileScreen() }
        composable(Screen.Absences.route) { UnjustifiedAbsencesScreen() }
    }
}