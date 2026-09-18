package com.personalapp.mvp.data.tasks

import androidx.room.Entity
import androidx.room.PrimaryKey

enum class TaskPriority { HIGH, MEDIUM, LOW }

@Entity(tableName = "tasks")
data class TaskEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val text: String,
    val dueDateTime: Long? = null,
    val priority: TaskPriority = TaskPriority.MEDIUM,
    val isDone: Boolean = false,
    val createdAt: Long = System.currentTimeMillis()
)
