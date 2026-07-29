package com.sgrh.app

import android.app.Application

class SGRHApplication : Application() {
    companion object {
        lateinit var appContext: android.content.Context
    }

    override fun onCreate() {
        super.onCreate()
        appContext = applicationContext
    }
}