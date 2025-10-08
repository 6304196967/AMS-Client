import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
  var window: UIWindow?
  var blurView: UIVisualEffectView?

  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory

    window = UIWindow(frame: UIScreen.main.bounds)

    factory.startReactNative(
      withModuleName: "AMSRKV",
      in: window,
      launchOptions: launchOptions
    )

    return true
  }

  // SECURITY: Hide screen content when app goes to background (prevents preview in app switcher)
  func applicationWillResignActive(_ application: UIApplication) {
    guard let window = window else { return }
    
    let blurEffect = UIBlurEffect(style: .light)
    let effectView = UIVisualEffectView(effect: blurEffect)
    effectView.frame = window.bounds
    effectView.tag = 999 // Tag to identify the blur view
    
    window.addSubview(effectView)
    blurView = effectView
  }

  // SECURITY: Remove blur when app becomes active again
  func applicationDidBecomeActive(_ application: UIApplication) {
    blurView?.removeFromSuperview()
    blurView = nil
    
    // Also remove by tag if needed
    window?.viewWithTag(999)?.removeFromSuperview()
  }
}

class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
#else
    Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}
