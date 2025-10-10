# Font Optimization Script
# Removes unnecessary font weights to reduce app size by ~1 MB

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Font Optimization Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$projectRoot = $PSScriptRoot
$fontsDir = Join-Path $projectRoot "assets\fonts"

if (-Not (Test-Path $fontsDir)) {
    Write-Host "[ERROR] Fonts directory not found at $fontsDir" -ForegroundColor Red
    exit 1
}

Write-Host "Current fonts in project:" -ForegroundColor Yellow
Get-ChildItem -Path $fontsDir -Filter "*.ttf" | ForEach-Object {
    $sizeKB = [math]::Round($_.Length / 1KB, 2)
    Write-Host "  - $($_.Name) - $sizeKB KB" -ForegroundColor Gray
}

$totalSize = (Get-ChildItem -Path $fontsDir -Filter "*.ttf" | Measure-Object -Property Length -Sum).Sum
$totalSizeMB = [math]::Round($totalSize / 1MB, 2)
Write-Host ""
Write-Host "Total size: $totalSizeMB MB" -ForegroundColor Cyan
Write-Host ""

Write-Host "[WARNING] This will remove 17 font files, keeping only essential weights:" -ForegroundColor Yellow
Write-Host "   [KEEP] WorkSansRegular.ttf" -ForegroundColor Green
Write-Host "   [KEEP] WorkSansMedium.ttf" -ForegroundColor Green
Write-Host "   [KEEP] WorkSansBold.ttf" -ForegroundColor Green
Write-Host "   [KEEP] QuicksandRegular.ttf" -ForegroundColor Green
Write-Host "   [KEEP] QuicksandMedium.ttf" -ForegroundColor Green
Write-Host "   [KEEP] QuicksandBold.ttf" -ForegroundColor Green
Write-Host ""
Write-Host "Expected size reduction: ~1 MB" -ForegroundColor Cyan
Write-Host ""

$confirm = Read-Host "Do you want to proceed? (Y/N)"

if ($confirm -ne "Y" -and $confirm -ne "y") {
    Write-Host "[CANCELLED] Operation cancelled." -ForegroundColor Yellow
    exit 0
}

# Fonts to remove
$fontsToRemove = @(
    "WorkSansBlack.ttf",
    "WorkSansBlackItalic.ttf",
    "WorkSansBoldItalic.ttf",
    "WorkSansExtraBold.ttf",
    "WorkSansExtraBoldItalic.ttf",
    "WorkSansExtraLight.ttf",
    "WorkSansExtraLightItalic.ttf",
    "WorkSansItalic.ttf",
    "WorkSansLight.ttf",
    "WorkSansLightItalic.ttf",
    "WorkSansMediumItalic.ttf",
    "WorkSansSemiBold.ttf",
    "WorkSansSemiBoldItalic.ttf",
    "WorkSansThin.ttf",
    "WorkSansThinItalic.ttf",
    "QuicksandLight.ttf",
    "QuicksandSemiBold.ttf"
)

$removedCount = 0
$savedSize = 0

Write-Host ""
Write-Host "Removing fonts..." -ForegroundColor Yellow

foreach ($font in $fontsToRemove) {
    $fontPath = Join-Path $fontsDir $font
    if (Test-Path $fontPath) {
        $fileSize = (Get-Item $fontPath).Length
        Remove-Item $fontPath -Force
        $removedCount++
        $savedSize += $fileSize
        Write-Host "  [REMOVED] $font" -ForegroundColor Gray
    }
}

$savedSizeMB = [math]::Round($savedSize / 1MB, 2)
$savedSizeKB = [math]::Round($savedSize / 1KB, 2)

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "[SUCCESS] Font Optimization Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Results:" -ForegroundColor Cyan
Write-Host "  Removed: $removedCount fonts" -ForegroundColor White
Write-Host "  Saved: $savedSizeMB MB ($savedSizeKB KB)" -ForegroundColor White
Write-Host ""

Write-Host "Remaining fonts:" -ForegroundColor Yellow
Get-ChildItem -Path $fontsDir -Filter "*.ttf" | ForEach-Object {
    $sizeKB = [math]::Round($_.Length / 1KB, 2)
    Write-Host "  [KEPT] $($_.Name) - $sizeKB KB" -ForegroundColor Green
}

$remainingSize = (Get-ChildItem -Path $fontsDir -Filter "*.ttf" | Measure-Object -Property Length -Sum).Sum
$remainingSizeMB = [math]::Round($remainingSize / 1MB, 2)
Write-Host ""
Write-Host "Total remaining size: $remainingSizeMB MB" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Clean and rebuild your app:" -ForegroundColor White
Write-Host "     cd android" -ForegroundColor Gray
Write-Host "     .\gradlew.bat clean" -ForegroundColor Gray
Write-Host "  2. Build optimized release:" -ForegroundColor White
Write-Host "     .\build-optimized.ps1" -ForegroundColor Gray
Write-Host ""
