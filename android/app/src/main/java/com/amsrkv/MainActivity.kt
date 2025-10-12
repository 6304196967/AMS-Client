package com.amsrkv

import android.os.Build
import android.os.Bundle
import android.view.WindowManager
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

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
}
