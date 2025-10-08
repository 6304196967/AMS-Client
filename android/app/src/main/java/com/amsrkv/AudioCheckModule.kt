package com.amsrkv

import android.content.Context
import android.media.AudioManager
import android.telecom.TelecomManager
import android.os.Build
import android.provider.Settings
import android.view.WindowManager
import android.hardware.display.DisplayManager
import android.media.projection.MediaProjectionManager
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import java.io.File

class AudioCheckModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "AudioCheckModule"
    }

    @ReactMethod
    fun isCallActive(promise: Promise) {
        try {
            val context = reactApplicationContext
            val audioManager = context.getSystemService(Context.AUDIO_SERVICE) as AudioManager
            
            // Check multiple indicators of an active call
            val isInCall = audioManager.mode == AudioManager.MODE_IN_CALL ||
                          audioManager.mode == AudioManager.MODE_IN_COMMUNICATION ||
                          audioManager.isMusicActive ||
                          audioManager.isSpeakerphoneOn
            
            // Additional check for Android 6.0+
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                try {
                    val telecomManager = context.getSystemService(Context.TELECOM_SERVICE) as TelecomManager
                    val isInTelecomCall = telecomManager.isInCall
                    promise.resolve(isInCall || isInTelecomCall)
                    return
                } catch (e: Exception) {
                    // If TelecomManager fails, fall back to AudioManager only
                }
            }
            
            promise.resolve(isInCall)
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to check call status: ${e.message}")
        }
    }

    @ReactMethod
    fun isMicrophoneInUse(promise: Promise) {
        try {
            val context = reactApplicationContext
            val audioManager = context.getSystemService(Context.AUDIO_SERVICE) as AudioManager
            
            // Check if audio mode suggests microphone is in use
            val micInUse = audioManager.mode == AudioManager.MODE_IN_CALL ||
                          audioManager.mode == AudioManager.MODE_IN_COMMUNICATION
            
            promise.resolve(micInUse)
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to check microphone status: ${e.message}")
        }
    }

    @ReactMethod
    fun isScreenMirroring(promise: Promise) {
        try {
            val context = reactApplicationContext
            val displayManager = context.getSystemService(Context.DISPLAY_SERVICE) as DisplayManager
            val displays = displayManager.displays
            
            // If more than 1 display detected, screen might be mirroring
            val isMirroring = displays.size > 1
            
            promise.resolve(isMirroring)
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to check screen mirroring: ${e.message}")
        }
    }

    @ReactMethod
    fun hasOverlayPermission(promise: Promise) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                val hasPermission = Settings.canDrawOverlays(reactApplicationContext)
                promise.resolve(hasPermission)
            } else {
                promise.resolve(false)
            }
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to check overlay permission: ${e.message}")
        }
    }

    @ReactMethod
    fun isDeviceRooted(promise: Promise) {
        try {
            val isRooted = checkRootMethod1() || checkRootMethod2() || checkRootMethod3()
            promise.resolve(isRooted)
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to check root status: ${e.message}")
        }
    }

    private fun checkRootMethod1(): Boolean {
        val buildTags = Build.TAGS
        return buildTags != null && buildTags.contains("test-keys")
    }

    private fun checkRootMethod2(): Boolean {
        val paths = arrayOf(
            "/system/app/Superuser.apk",
            "/sbin/su",
            "/system/bin/su",
            "/system/xbin/su",
            "/data/local/xbin/su",
            "/data/local/bin/su",
            "/system/sd/xbin/su",
            "/system/bin/failsafe/su",
            "/data/local/su",
            "/su/bin/su"
        )
        for (path in paths) {
            if (File(path).exists()) return true
        }
        return false
    }

    private fun checkRootMethod3(): Boolean {
        var process: Process? = null
        return try {
            process = Runtime.getRuntime().exec(arrayOf("/system/xbin/which", "su"))
            val bufferedReader = process.inputStream.bufferedReader()
            bufferedReader.readLine() != null
        } catch (t: Throwable) {
            false
        } finally {
            process?.destroy()
        }
    }

    @ReactMethod
    fun isAccessibilityServiceEnabled(promise: Promise) {
        try {
            val context = reactApplicationContext
            val enabledServices = Settings.Secure.getString(
                context.contentResolver,
                Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
            )
            
            val hasAccessibilityEnabled = enabledServices?.isNotEmpty() == true
            promise.resolve(hasAccessibilityEnabled)
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to check accessibility services: ${e.message}")
        }
    }
}
