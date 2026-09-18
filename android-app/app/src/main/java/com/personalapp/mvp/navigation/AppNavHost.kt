package com.personalapp.mvp.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import com.personalapp.mvp.ui.screens.flights.FlightsScreen
import com.personalapp.mvp.ui.screens.notes.NotesScreen
import com.personalapp.mvp.ui.screens.shopping.ShoppingScreen
import com.personalapp.mvp.ui.screens.tasks.TasksScreen

@Composable
fun AppNavHost(navController: NavHostController) {
    NavHost(navController = navController, startDestination = AppDestination.Flights.route) {
        composable(AppDestination.Flights.route) { FlightsScreen() }
        composable(AppDestination.Shopping.route) { ShoppingScreen() }
        composable(AppDestination.Tasks.route) { TasksScreen() }
        composable(AppDestination.Notes.route) { NotesScreen() }
    }
}
