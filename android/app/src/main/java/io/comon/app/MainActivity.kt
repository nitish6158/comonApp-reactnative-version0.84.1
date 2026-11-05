package io.comon.app

import android.content.Intent
import android.os.Build
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import io.branch.rnbranch.RNBranchModule

class MainActivity : ReactActivity() {

  /**
   * Must match the app name from app.json
   */
  override fun getMainComponentName(): String = "commonapp"

  /**
   * Android R and below: move app to background instead of finishing
   */
  override fun invokeDefaultOnBackPressed() {
    if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.R) {
      if (!moveTaskToBack(false)) {
        super.invokeDefaultOnBackPressed()
      }
      return
    }
    super.invokeDefaultOnBackPressed()
  }

  /**
   * Enable Fabric when New Architecture is on
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

  /**
   * Branch deep link session init
   */
  override fun onStart() {
    super.onStart()
    RNBranchModule.initSession(intent?.data, this)
  }

  /**
   * Handle new deep link intents
   */
  override fun onNewIntent(intent: Intent) {
    super.onNewIntent(intent)
    setIntent(intent)
    RNBranchModule.onNewIntent(intent)
  }
}
