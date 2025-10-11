# rebuild-release.ps1
# Complete rebuild script for release APK

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  React Native Release Build Script" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Clean
Write-Host "Step 1/5: Cleaning Android build..." -ForegroundColor Yellow
cd android
./gradlew clean
cd ..
Write-Host "Clean complete" -ForegroundColor Green
Write-Host ""

# Step 2: Clear Metro cache
Write-Host "Step 2/5: Clearing Metro bundler cache..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "npx react-native start --reset-cache" -PassThru
Start-Sleep -Seconds 5
Write-Host "Metro started with fresh cache" -ForegroundColor Green
Write-Host ""

# Step 3: Build Release APK
Write-Host "Step 3/5: Building Release APK..." -ForegroundColor Yellow
Write-Host "This may take a few minutes..." -ForegroundColor Cyan
cd android
./gradlew assembleRelease
cd ..
Write-Host "Build complete" -ForegroundColor Green
Write-Host ""

# Step 4: Uninstall old app
Write-Host "Step 4/5: Uninstalling old app from device..." -ForegroundColor Yellow
try {
    adb uninstall com.amsrkv 2>$null
    Write-Host "Old app uninstalled" -ForegroundColor Green
} catch {
    Write-Host "No previous installation found" -ForegroundColor Cyan
}
Write-Host ""

# Step 5: Install new APK
Write-Host "Step 5/5: Installing new APK..." -ForegroundColor Yellow
$apkPath = "android\app\build\outputs\apk\release\app-arm64-v8a-release.apk"

if (Test-Path $apkPath) {
    adb install $apkPath
    Write-Host "Installation complete!" -ForegroundColor Green
} else {
    Write-Host "APK not found at: $apkPath" -ForegroundColor Red
    Write-Host "Available APKs:" -ForegroundColor Cyan
    Get-ChildItem "android\app\build\outputs\apk\release\" -Filter "*.apk" | Select-Object Name
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Build and Install Complete!" -ForegroundColor Green
Write-Host "  Test the app on your device" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
