# ============================================
# Build Optimized Release APK/AAB
# ============================================
# This script builds optimized, size-reduced APKs and AAB

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  React Native App Size Optimizer" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$projectRoot = $PSScriptRoot
$androidDir = Join-Path $projectRoot "android"

# Check if android directory exists
if (-Not (Test-Path $androidDir)) {
    Write-Host "[ERROR] Android directory not found!" -ForegroundColor Red
    exit 1
}

# Menu
Write-Host "Select build type:" -ForegroundColor Yellow
Write-Host "1. Build Release APKs (separate per architecture)" -ForegroundColor White
Write-Host "2. Build Android App Bundle (AAB) - Recommended for Play Store" -ForegroundColor White
Write-Host "3. Build Both APKs and AAB" -ForegroundColor White
Write-Host "4. Clean build cache first, then build" -ForegroundColor White
Write-Host "5. Analyze APK size" -ForegroundColor White
Write-Host "0. Exit" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter your choice (0-5)"

function Clean-Build {
    Write-Host ""
    Write-Host "Cleaning build cache..." -ForegroundColor Yellow
    Set-Location $androidDir
    .\gradlew.bat clean
    Set-Location $projectRoot
    Write-Host "[SUCCESS] Clean complete!" -ForegroundColor Green
}

function Build-APKs {
    Write-Host ""
    Write-Host "Building Release APKs..." -ForegroundColor Yellow
    Write-Host "This will create separate APKs for different CPU architectures" -ForegroundColor Gray
    Set-Location $androidDir
    .\gradlew.bat assembleRelease
    Set-Location $projectRoot
    
    Write-Host ""
    Write-Host "[SUCCESS] Build complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host "APK Sizes:" -ForegroundColor Cyan
    
    $apkPath = Join-Path $androidDir "app\build\outputs\apk\release"
    if (Test-Path $apkPath) {
        Get-ChildItem -Path $apkPath -Filter "*.apk" | ForEach-Object {
            $sizeMB = [math]::Round($_.Length / 1MB, 2)
            $sizeKB = [math]::Round($_.Length / 1KB, 0)
            Write-Host "  - $($_.Name): $sizeMB MB ($sizeKB KB)" -ForegroundColor White
        }
        Write-Host ""
        Write-Host "Location: $apkPath" -ForegroundColor Gray
    } else {
        Write-Host "[WARNING] APK files not found in expected location" -ForegroundColor Yellow
    }
}

function Build-AAB {
    Write-Host ""
    Write-Host "Building Android App Bundle (AAB)..." -ForegroundColor Yellow
    Write-Host "This creates a bundle that Google Play will optimize for each device" -ForegroundColor Gray
    Set-Location $androidDir
    .\gradlew.bat bundleRelease
    Set-Location $projectRoot
    
    Write-Host ""
    Write-Host "[SUCCESS] Build complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host "AAB Size:" -ForegroundColor Cyan
    
    $aabPath = Join-Path $androidDir "app\build\outputs\bundle\release"
    if (Test-Path $aabPath) {
        Get-ChildItem -Path $aabPath -Filter "*.aab" | ForEach-Object {
            $sizeMB = [math]::Round($_.Length / 1MB, 2)
            $sizeKB = [math]::Round($_.Length / 1KB, 0)
            Write-Host "  - $($_.Name): $sizeMB MB ($sizeKB KB)" -ForegroundColor White
        }
        Write-Host ""
        Write-Host "Location: $aabPath" -ForegroundColor Gray
        Write-Host ""
        Write-Host "[INFO] Note: End users will download ~60-70% smaller APKs from Play Store" -ForegroundColor Cyan
    } else {
        Write-Host "[WARNING] AAB file not found in expected location" -ForegroundColor Yellow
    }
}

function Analyze-APK {
    Write-Host ""
    Write-Host "Analyzing APK sizes..." -ForegroundColor Yellow
    
    $apkPath = Join-Path $androidDir "app\build\outputs\apk\release"
    $aabPath = Join-Path $androidDir "app\build\outputs\bundle\release"
    
    Write-Host ""
    Write-Host "=== RELEASE APKs ===" -ForegroundColor Cyan
    if (Test-Path $apkPath) {
        Get-ChildItem -Path $apkPath -Filter "*.apk" | ForEach-Object {
            $sizeMB = [math]::Round($_.Length / 1MB, 2)
            Write-Host "  - $($_.Name): $sizeMB MB" -ForegroundColor White
        }
    } else {
        Write-Host "  [WARNING] No APKs found. Run build first." -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "=== APP BUNDLES ===" -ForegroundColor Cyan
    if (Test-Path $aabPath) {
        Get-ChildItem -Path $aabPath -Filter "*.aab" | ForEach-Object {
            $sizeMB = [math]::Round($_.Length / 1MB, 2)
            Write-Host "  - $($_.Name): $sizeMB MB" -ForegroundColor White
        }
    } else {
        Write-Host "  [WARNING] No AAB found. Run build first." -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "=== DEBUG APK ===" -ForegroundColor Cyan
    $debugApkPath = Join-Path $androidDir "app\build\outputs\apk\debug"
    if (Test-Path $debugApkPath) {
        Get-ChildItem -Path $debugApkPath -Filter "*.apk" | ForEach-Object {
            $sizeMB = [math]::Round($_.Length / 1MB, 2)
            Write-Host "  - $($_.Name): $sizeMB MB" -ForegroundColor White
        }
    }
}

# Execute based on choice
switch ($choice) {
    "1" {
        Build-APKs
    }
    "2" {
        Build-AAB
    }
    "3" {
        Build-APKs
        Build-AAB
    }
    "4" {
        Clean-Build
        Write-Host ""
        $buildChoice = Read-Host "Build APKs (1), AAB (2), or Both (3)?"
        switch ($buildChoice) {
            "1" { Build-APKs }
            "2" { Build-AAB }
            "3" { 
                Build-APKs
                Build-AAB
            }
        }
    }
    "5" {
        Analyze-APK
    }
    "0" {
        Write-Host "Goodbye!" -ForegroundColor Cyan
        exit 0
    }
    default {
        Write-Host "[ERROR] Invalid choice!" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Build Process Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Test the APKs on real devices" -ForegroundColor White
Write-Host "  2. For Play Store: Upload the AAB file" -ForegroundColor White
Write-Host "  3. For direct distribution: Use architecture-specific APKs" -ForegroundColor White
Write-Host ""
