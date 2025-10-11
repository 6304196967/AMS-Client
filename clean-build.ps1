# clean-build.ps1
# Clean build script for React Native Android

Write-Host "Cleaning Android build cache..." -ForegroundColor Yellow
cd android
./gradlew clean
cd ..

Write-Host "Starting Metro bundler with fresh cache..." -ForegroundColor Yellow
Write-Host "Metro will start in a new window" -ForegroundColor Cyan
Start-Process powershell -ArgumentList "npx react-native start --reset-cache"

Write-Host "Waiting for Metro to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 8

Write-Host "Building and installing debug APK..." -ForegroundColor Green
npm run android

Write-Host "Done! Check your device." -ForegroundColor Green
