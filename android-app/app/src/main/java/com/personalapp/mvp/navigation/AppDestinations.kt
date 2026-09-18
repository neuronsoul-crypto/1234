package com.personalapp.mvp.navigation

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Flight
import androidx.compose.material.icons.filled.Notes
import androidx.compose.material.icons.filled.ShoppingCart
import androidx.compose.ui.graphics.vector.ImageVector
import com.personalapp.mvp.R

enum class AppDestination(
    val route: String,
    val labelRes: Int,
    val icon: ImageVector
) {
    Flights(route = "flights", labelRes = R.string.nav_flights, icon = Icons.Filled.Flight),
    Shopping(route = "shopping", labelRes = R.string.nav_shopping, icon = Icons.Filled.ShoppingCart),
    Tasks(route = "tasks", labelRes = R.string.nav_tasks, icon = Icons.Filled.CheckCircle),
    Notes(route = "notes", labelRes = R.string.nav_notes, icon = Icons.Filled.Notes)
}
