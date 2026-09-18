package com.personalapp.mvp.ui.screens.notes

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextAlign
import com.personalapp.mvp.R

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun NotesScreen() {
    Scaffold(
        topBar = { TopAppBar(title = { Text(stringResource(R.string.notes_title)) }) },
        floatingActionButton = {
            FloatingActionButton(onClick = { /* TODO: новая заметка + голосовой ввод */ }) {
                Icon(Icons.Filled.Add, contentDescription = stringResource(R.string.notes_add))
            }
        }
    ) { padding ->
        Box(modifier = Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) {
            Text(text = stringResource(R.string.notes_empty), textAlign = TextAlign.Center)
        }
    }
}
