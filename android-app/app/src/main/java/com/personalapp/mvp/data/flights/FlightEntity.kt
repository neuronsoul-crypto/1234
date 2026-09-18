package com.personalapp.mvp.data.flights

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "flights")
data class FlightEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val flightNumber: String,
    val date: String,
    val departureAirport: String? = null,
    val arrivalAirport: String? = null,
    val status: String? = null,
    val gate: String? = null,
    val scheduledTime: Long? = null,
    val actualTime: Long? = null,
    val isArchived: Boolean = false
)
