package com.amsrkv

import android.app.ActivityManager
import android.content.Context
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import android.view.WindowManager
import android.widget.Toast
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import com.facebook.react.modules.core.DeviceEventManagerModule

class MainActivity : ReactActivity() {

  private var isAppInForeground = true
  private var hasShownOverlayWarning = false

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "AMSRKV"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

  /**
   * Disable multi-window mode to prevent split-screen and other window behaviors
   * Also prevent screenshots, screen recording, and screen sharing
   */
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    
    // Prevent screenshots, screen recording, and screen sharing
    // FLAG_SECURE makes the window content protected from screenshots and screen recording
    window.setFlags(
      WindowManager.LayoutParams.FLAG_SECURE,
      WindowManager.LayoutParams.FLAG_SECURE
    )
    
    // Disable multi-window mode on Android N (API 24) and above
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
      // This will be handled by manifest resizeableActivity="false"
      // but we can add runtime checks here if needed
    }
  }

  /**
   * Disable entering picture-in-picture mode
   */
  override fun onUserLeaveHint() {
    // Don't call super to prevent default PiP behavior
    // super.onUserLeaveHint() - commented out to disable PiP
  }

  /**
   * Detect when window focus changes - this helps detect overlays and split-screen
   */
  override fun onWindowFocusChanged(hasFocus: Boolean) {
    super.onWindowFocusChanged(hasFocus)
    
    if (!hasFocus) {
      // Window lost focus - could be overlay, split-screen, or another app appearing
      isAppInForeground = false
      
      // Check for overlays
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
        if (Settings.canDrawOverlays(this)) {
          sendEventToReactNative("onOverlayDetected", true)
          if (!hasShownOverlayWarning) {
            runOnUiThread {
              Toast.makeText(
                this,
                "⚠️ Overlay/Popup apps detected! Please close them.",
                Toast.LENGTH_LONG
              ).show()
            }
            hasShownOverlayWarning = true
          }
        }
      }
      
      // Notify React Native that focus was lost
      sendEventToReactNative("onWindowFocusLost", true)
    } else {
      isAppInForeground = true
      hasShownOverlayWarning = false
      sendEventToReactNative("onWindowFocusGained", true)
    }
  }

  /**
   * Detect if app is in multi-window mode (split-screen)
   */
  override fun onMultiWindowModeChanged(isInMultiWindowMode: Boolean) {
    super.onMultiWindowModeChanged(isInMultiWindowMode)
    
    if (isInMultiWindowMode) {
      // App entered multi-window mode
      sendEventToReactNative("onMultiWindowDetected", true)
      runOnUiThread {
        Toast.makeText(
          this,
          "⚠️ Multi-window/Split-screen mode detected! This is not allowed.",
          Toast.LENGTH_LONG
        ).show()
      }
      
      // Optionally, you can finish the activity to close the app
      // finish()
    }
  }

  /**
   * Monitor when app goes to background or comes to foreground
   */
  override fun onPause() {
    super.onPause()
    isAppInForeground = false
    
    // Check if other apps are running in foreground
    checkForOverlayApps()
  }

  override fun onResume() {
    super.onResume()
    isAppInForeground = true
    
    // Check for multi-window mode
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
      if (isInMultiWindowMode) {
        sendEventToReactNative("onMultiWindowDetected", true)
        runOnUiThread {
          Toast.makeText(
            this,
            "⚠️ Please exit split-screen mode to continue",
            Toast.LENGTH_LONG
          ).show()
        }
      }
    }
    
    // Check for overlay permission
    checkForOverlayApps()
  }

  /**
   * Check if there are overlay apps or permissions enabled
   */
  private fun checkForOverlayApps() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
      if (Settings.canDrawOverlays(this)) {
        sendEventToReactNative("onOverlayDetected", true)
      }
    }
  }

  /**
   * Send events to React Native JavaScript layer
   */
  private fun sendEventToReactNative(eventName: String, value: Boolean) {
    try {
      val reactContext = reactInstanceManager.currentReactContext
      if (reactContext != null) {
        val params: WritableMap = Arguments.createMap()
        params.putBoolean("detected", value)
        
        reactContext
          .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
          .emit(eventName, params)
      }
    } catch (e: Exception) {
      // React context not ready yet
    }
  }
}
