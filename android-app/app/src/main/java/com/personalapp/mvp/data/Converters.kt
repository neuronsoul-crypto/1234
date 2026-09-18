package com.personalapp.mvp.data

import androidx.room.TypeConverter
import com.personalapp.mvp.data.tasks.TaskPriority

class Converters {
    @TypeConverter
    fun fromPriority(priority: TaskPriority): String = priority.name

    @TypeConverter
    fun toPriority(value: String): TaskPriority = TaskPriority.valueOf(value)
}
