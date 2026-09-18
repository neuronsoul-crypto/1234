package com.personalapp.mvp.data

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.room.TypeConverters
import com.personalapp.mvp.data.flights.FlightDao
import com.personalapp.mvp.data.flights.FlightEntity
import com.personalapp.mvp.data.notes.NoteDao
import com.personalapp.mvp.data.notes.NoteEntity
import com.personalapp.mvp.data.shopping.ShoppingDao
import com.personalapp.mvp.data.shopping.ShoppingItemEntity
import com.personalapp.mvp.data.shopping.ShoppingListEntity
import com.personalapp.mvp.data.tasks.TaskDao
import com.personalapp.mvp.data.tasks.TaskEntity

@Database(
    entities = [
        FlightEntity::class,
        ShoppingListEntity::class,
        ShoppingItemEntity::class,
        TaskEntity::class,
        NoteEntity::class
    ],
    version = 1,
    exportSchema = true
)
@TypeConverters(Converters::class)
abstract class AppDatabase : RoomDatabase() {

    abstract fun flightDao(): FlightDao
    abstract fun shoppingDao(): ShoppingDao
    abstract fun taskDao(): TaskDao
    abstract fun noteDao(): NoteDao

    companion object {
        @Volatile
        private var instance: AppDatabase? = null

        fun getInstance(context: Context): AppDatabase =
            instance ?: synchronized(this) {
                instance ?: Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "personal_app.db"
                ).build().also { instance = it }
            }
    }
}
