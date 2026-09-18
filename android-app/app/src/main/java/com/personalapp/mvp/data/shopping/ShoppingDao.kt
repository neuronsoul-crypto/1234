package com.personalapp.mvp.data.shopping

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import kotlinx.coroutines.flow.Flow

@Dao
interface ShoppingDao {
    @Query("SELECT * FROM shopping_lists ORDER BY id ASC")
    fun observeLists(): Flow<List<ShoppingListEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertList(list: ShoppingListEntity): Long

    @Delete
    suspend fun deleteList(list: ShoppingListEntity)

    @Query("SELECT * FROM shopping_items WHERE listId = :listId ORDER BY isChecked ASC, sortOrder ASC")
    fun observeItems(listId: Long): Flow<List<ShoppingItemEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertItem(item: ShoppingItemEntity): Long

    @Update
    suspend fun updateItem(item: ShoppingItemEntity)

    @Delete
    suspend fun deleteItem(item: ShoppingItemEntity)

    @Query("DELETE FROM shopping_items WHERE listId = :listId AND isChecked = 1")
    suspend fun clearChecked(listId: Long)
}
