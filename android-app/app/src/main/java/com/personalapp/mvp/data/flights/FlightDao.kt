package com.personalapp.mvp.data.flights

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import kotlinx.coroutines.flow.Flow

@Dao
interface FlightDao {
    @Query("SELECT * FROM flights WHERE isArchived = 0 ORDER BY date ASC")
    fun observeActive(): Flow<List<FlightEntity>>

    @Query("SELECT * FROM flights WHERE isArchived = 1 ORDER BY date DESC")
    fun observeArchived(): Flow<List<FlightEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsert(flight: FlightEntity): Long

    @Update
    suspend fun update(flight: FlightEntity)

    @Delete
    suspend fun delete(flight: FlightEntity)
}
