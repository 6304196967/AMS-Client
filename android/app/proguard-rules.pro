# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# ================================
# React Native ProGuard Rules
# ================================

# Keep React Native classes
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }

# Keep native methods
-keepclassmembers class * {
    native <methods>;
}

# Keep React Native Modules
-keepclassmembers,includedescriptorclasses class * {
    @com.facebook.react.bridge.ReactMethod <methods>;
}

# Keep TurboModules
-keep class com.facebook.react.turbomodule.** { *; }

# ================================
# Firebase / Google Services
# ================================

-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.firebase.**
-dontwarn com.google.android.gms.**

# ================================
# React Native Firebase
# ================================

-keep class io.invertase.firebase.** { *; }
-dontwarn io.invertase.firebase.**

# ================================
# React Native Biometrics
# ================================

-keep class com.rnbiometrics.** { *; }
-dontwarn com.rnbiometrics.**

# ================================
# React Native Device Info
# ================================

-keep class com.learnium.RNDeviceInfo.** { *; }
-dontwarn com.learnium.RNDeviceInfo.**

# ================================
# React Native Vector Icons
# ================================

-keep class com.oblador.vectoricons.** { *; }
-dontwarn com.oblador.vectoricons.**

# ================================
# React Native Image Picker
# ================================

-keep class com.imagepicker.** { *; }
-dontwarn com.imagepicker.**

# ================================
# React Native File Picker / FS
# ================================

-keep class com.rnfs.** { *; }
-dontwarn com.rnfs.**

# ================================
# React Native Gesture Handler
# ================================

-keep class com.swmansion.gesturehandler.** { *; }
-dontwarn com.swmansion.gesturehandler.**

# ================================
# React Native Reanimated
# ================================

-keep class com.swmansion.reanimated.** { *; }
-dontwarn com.swmansion.reanimated.**

# ================================
# React Native Screens
# ================================

-keep class com.swmansion.rnscreens.** { *; }
-dontwarn com.swmansion.rnscreens.**

# ================================
# React Native SVG
# ================================

-keep class com.horcrux.svg.** { *; }
-dontwarn com.horcrux.svg.**

# ================================
# Google Sign-In
# ================================

-keep class com.google.android.gms.auth.** { *; }
-keep class com.reactnativegooglesignin.** { *; }
-dontwarn com.reactnativegooglesignin.**

# ================================
# AsyncStorage
# ================================

-keep class com.reactnativecommunity.asyncstorage.** { *; }
-dontwarn com.reactnativecommunity.asyncstorage.**

# ================================
# General Android
# ================================

# Keep SourceFile and LineNumberTable attributes for better stack traces
-keepattributes SourceFile,LineNumberTable

# Keep annotations
-keepattributes *Annotation*

# Keep Serializable classes
-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}

# ================================
# Optimization Settings
# ================================

# Enable optimization
-optimizationpasses 5
-dontusemixedcaseclassnames
-dontskipnonpubliclibraryclasses
-verbose

# Keep line numbers for debugging stack traces
-renamesourcefileattribute SourceFile
-keepattributes SourceFile,LineNumberTable

# Remove logging in release builds
-assumenosideeffects class android.util.Log {
    public static *** d(...);
    public static *** v(...);
    public static *** i(...);
    public static *** w(...);
    public static *** e(...);
}
