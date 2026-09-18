package com.personalapp.mvp

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.navigation.compose.rememberNavController
import com.personalapp.mvp.navigation.AppBottomNavBar
import com.personalapp.mvp.navigation.AppNavHost
import com.personalapp.mvp.ui.theme.PersonalAppTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            PersonalAppTheme {
                PersonalAppRoot()
            }
        }
    }
}

@Composable
private fun PersonalAppRoot() {
    val navController = rememberNavController()
    Scaffold(
        bottomBar = { AppBottomNavBar(navController) }
    ) { innerPadding ->
        Box(modifier = Modifier.padding(innerPadding)) {
            AppNavHost(navController)
        }
    }
}
