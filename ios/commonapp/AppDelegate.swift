import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
import FirebaseCore
import PushKit
import ObjectiveC

@main
class AppDelegate: UIResponder, UIApplicationDelegate, PKPushRegistryDelegate {
  var window: UIWindow?

  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    if FirebaseApp.app() == nil {
      FirebaseApp.configure()
    }

    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory

    window = UIWindow(frame: UIScreen.main.bounds)

    factory.startReactNative(
      withModuleName: "commonapp",
      in: window,
      launchOptions: launchOptions
    )

    return true
  }

  func application(
    _ application: UIApplication,
    didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data
  ) {
    setFirebaseMessagingApnsToken(deviceToken)
    forwardToRNFBMessagingAppDelegate(
      selector: "application:didRegisterForRemoteNotificationsWithDeviceToken:",
      firstObject: application,
      secondObject: deviceToken as NSData
    )
    NSLog("APNs device token received: %@", deviceToken as NSData)
  }

  func application(
    _ application: UIApplication,
    didFailToRegisterForRemoteNotificationsWithError error: Error
  ) {
    forwardToRNFBMessagingAppDelegate(
      selector: "application:didFailToRegisterForRemoteNotificationsWithError:",
      firstObject: application,
      secondObject: error as NSError
    )
    NSLog("Failed to register for remote notifications: %@", error.localizedDescription)
  }

  func application(
    _ application: UIApplication,
    didReceiveRemoteNotification userInfo: [AnyHashable: Any],
    fetchCompletionHandler completionHandler: @escaping (UIBackgroundFetchResult) -> Void
  ) {
    forwardRemoteNotificationToRNFBMessaging(
      application: application,
      userInfo: userInfo,
      completionHandler: completionHandler
    )
  }

  func pushRegistry(
    _ registry: PKPushRegistry,
    didUpdate credentials: PKPushCredentials,
    for type: PKPushType
  ) {
    forwardToRNVoipPushKit(
      selector: "didUpdatePushCredentials:forType:",
      firstObject: credentials,
      type: type
    )
  }

  func pushRegistry(
    _ registry: PKPushRegistry,
    didInvalidatePushTokenFor type: PKPushType
  ) {}

  func pushRegistry(
    _ registry: PKPushRegistry,
    didReceiveIncomingPushWith payload: PKPushPayload,
    for type: PKPushType
  ) {
    forwardToRNVoipPushKit(
      selector: "didReceiveIncomingPushWithPayload:forType:",
      firstObject: payload,
      type: type
    )
  }

  func pushRegistry(
    _ registry: PKPushRegistry,
    didReceiveIncomingPushWith payload: PKPushPayload,
    for type: PKPushType,
    completion: @escaping () -> Void
  ) {
    var callerName = "RNVoip is Calling"
    var callerId = UUID().uuidString.lowercased()
    var handle = "1234567890"
    var handleType = "generic"
    var hasVideo = false

    if let dataPayload = payload.dictionaryPayload["data"] as? [String: Any] {
      if let name = dataPayload["name"] as? String {
        callerName = "\(name) is Calling"
      }

      if let uuid = dataPayload["uuid"] as? String {
        callerId = uuid
      }

      if let payloadHandle = dataPayload["handle"] as? String {
        handle = payloadHandle
      }

      if let payloadHandleType = dataPayload["handleType"] as? String {
        handleType = payloadHandleType
      }

      if let payloadHasVideo = dataPayload["hasVideo"] as? Bool {
        hasVideo = payloadHasVideo
      }
    }

    let extra = payload.dictionaryPayload["data"] as? [AnyHashable: Any]

    reportIncomingVoipCall(
      callerId: callerId,
      handle: handle,
      handleType: handleType,
      hasVideo: hasVideo,
      callerName: callerName,
      payload: extra,
      completion: completion
    )
    forwardToRNVoipPushKit(
      selector: "didReceiveIncomingPushWithPayload:forType:",
      firstObject: payload,
      type: type
    )
  }

  private func rnfbMessagingAppDelegate() -> NSObject? {
    guard
      let delegateClass = NSClassFromString("RNFBMessagingAppDelegate") as? NSObject.Type,
      let delegate = delegateClass.perform(NSSelectorFromString("sharedInstance"))?
        .takeUnretainedValue() as? NSObject
    else {
      return nil
    }

    return delegate
  }

  private func setFirebaseMessagingApnsToken(_ deviceToken: Data) {
    let messagingSelector = NSSelectorFromString("messaging")
    let apnsTokenSelector = NSSelectorFromString("setAPNSToken:")

    guard
      let messagingClass = NSClassFromString("FIRMessaging") as? NSObject.Type,
      messagingClass.responds(to: messagingSelector),
      let messaging = messagingClass.perform(messagingSelector)?
        .takeUnretainedValue() as? NSObject,
      messaging.responds(to: apnsTokenSelector)
    else {
      NSLog("Firebase Messaging runtime bridge unavailable for APNs token")
      return
    }

    messaging.perform(apnsTokenSelector, with: deviceToken as NSData)
  }

  private func forwardToRNFBMessagingAppDelegate(
    selector selectorName: String,
    firstObject: Any,
    secondObject: Any
  ) {
    let selector = NSSelectorFromString(selectorName)
    guard let delegate = rnfbMessagingAppDelegate(), delegate.responds(to: selector) else {
      return
    }

    delegate.perform(selector, with: firstObject, with: secondObject)
  }

  private func forwardRemoteNotificationToRNFBMessaging(
    application: UIApplication,
    userInfo: [AnyHashable: Any],
    completionHandler: @escaping (UIBackgroundFetchResult) -> Void
  ) {
    let selector = NSSelectorFromString(
      "application:didReceiveRemoteNotification:fetchCompletionHandler:"
    )

    guard let delegate = rnfbMessagingAppDelegate(), delegate.responds(to: selector) else {
      completionHandler(.newData)
      return
    }

    typealias RemoteNotificationHandler = @convention(c) (
      NSObject,
      Selector,
      UIApplication,
      NSDictionary,
      @escaping (UIBackgroundFetchResult) -> Void
    ) -> Void

    let implementation = delegate.method(for: selector)
    let handler = unsafeBitCast(implementation, to: RemoteNotificationHandler.self)
    handler(delegate, selector, application, userInfo as NSDictionary, completionHandler)
  }

  private func forwardToRNVoipPushKit(
    selector selectorName: String,
    firstObject: Any,
    type: PKPushType
  ) {
    let selector = NSSelectorFromString(selectorName)
    guard
      let pushKitClass = NSClassFromString("RNVoipPushKit") as? NSObject.Type,
      pushKitClass.responds(to: selector)
    else {
      return
    }

    pushKitClass.perform(selector, with: firstObject, with: type.rawValue as NSString)
  }

  private func reportIncomingVoipCall(
    callerId: String,
    handle: String,
    handleType: String,
    hasVideo: Bool,
    callerName: String,
    payload: [AnyHashable: Any]?,
    completion: @escaping () -> Void
  ) {
    let selector = NSSelectorFromString(
      "reportNewIncomingCall:handle:handleType:hasVideo:localizedCallerName:fromPushKit:payload:withCompletionHandler:"
    )

    guard
      let voipCallClass = NSClassFromString("RNVoipCall"),
      let method = class_getClassMethod(voipCallClass, selector)
    else {
      completion()
      return
    }

    typealias ReportIncomingCallHandler = @convention(c) (
      AnyClass,
      Selector,
      NSString,
      NSString,
      NSString,
      Bool,
      NSString,
      Bool,
      NSDictionary?,
      @escaping () -> Void
    ) -> Void

    let implementation = method_getImplementation(method)
    let handler = unsafeBitCast(implementation, to: ReportIncomingCallHandler.self)
    handler(
      voipCallClass,
      selector,
      callerId as NSString,
      handle as NSString,
      handleType as NSString,
      hasVideo,
      callerName as NSString,
      true,
      payload as NSDictionary?,
      completion
    )
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
