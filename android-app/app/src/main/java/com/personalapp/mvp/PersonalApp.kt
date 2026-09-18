package com.personalapp.mvp

import android.app.Application
import com.personalapp.mvp.data.AppDatabase

class PersonalApp : Application() {

    val database: AppDatabase by lazy { AppDatabase.getInstance(this) }
}
