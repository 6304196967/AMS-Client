# quick-rebuild.ps1
# Quick rebuild without full clean (faster for testing)

Write-Host "Building Release APK (without clean)..." -ForegroundColor Yellow
cd android
./gradlew assembleRelease
cd ..

Write-Host ""
Write-Host "Uninstalling old app..." -ForegroundColor Yellow
adb uninstall com.amsrkv 2>$null

Write-Host ""
Write-Host "Installing new APK..." -ForegroundColor Green
$apkPath = "android\app\build\outputs\apk\release\app-arm64-v8a-release.apk"

if (Test-Path $apkPath) {
    adb install $apkPath
    Write-Host "Done! App installed." -ForegroundColor Green
} else {
    Write-Host "APK not found. Try running: ./rebuild-release.ps1" -ForegroundColor Red
}
