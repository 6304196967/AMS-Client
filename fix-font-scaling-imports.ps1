# Fix Font Scaling Migration Errors
# This script fixes the broken imports caused by the migration script

param(
    [switch]$DryRun = $false
)

Write-Host "Font Scaling Migration Fix Tool" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

if ($DryRun) {
    Write-Host "DRY RUN MODE - No files will be modified" -ForegroundColor Yellow
    Write-Host ""
}

# Get all TypeScript files with broken imports
$files = Get-ChildItem -Path "src" -Include "*.tsx","*.ts" -Recurse -File | Where-Object { $_.FullName -notmatch "node_modules" }

Write-Host "Scanning for broken imports..." -ForegroundColor Green
Write-Host ""

$fixedFiles = 0

foreach ($file in $files) {
    $relativePath = $file.FullName.Replace((Get-Location).Path + "\", "")
    $content = Get-Content $file.FullName -Raw
    
    if (-not $content) {
        continue
    }
    
    $originalContent = $content
    $hadFixes = $false
    
    # Fix ViewStyleSheet -> View, StyleSheet
    if ($content -match "ViewStyleSheet") {
        $content = $content -replace "ViewStyleSheet", "View, StyleSheet"
        $hadFixes = $true
    }
    
    # Fix ModalKeyboardAvoidingView -> Modal, KeyboardAvoidingView
    if ($content -match "ModalKeyboardAvoidingView") {
        $content = $content -replace "ModalKeyboardAvoidingView", "Modal, KeyboardAvoidingView"
        $hadFixes = $true
    }
    
    # Fix ViewStyleSheetBackHandler -> View, StyleSheet, BackHandler
    if ($content -match "ViewStyleSheetBackHandler") {
        $content = $content -replace "ViewStyleSheetBackHandler", "View, StyleSheet, BackHandler"
        $hadFixes = $true
    }
    
    # Fix ViewFlatList -> View, FlatList
    if ($content -match "ViewFlatList") {
        $content = $content -replace "ViewFlatList", "View, FlatList"
        $hadFixes = $true
    }
    
    # Fix StyleSheetModal -> StyleSheet, Modal
    if ($content -match "StyleSheetModal") {
        $content = $content -replace "StyleSheetModal", "StyleSheet, Modal"
        $hadFixes = $true
    }
    
    # Fix ModalAlert -> Modal, Alert
    if ($content -match "ModalAlert") {
        $content = $content -replace "ModalAlert", "Modal, Alert"
        $hadFixes = $true
    }
    
    # Fix StyleSheetImage -> StyleSheet, Image
    if ($content -match "StyleSheetImage") {
        $content = $content -replace "StyleSheetImage", "StyleSheet, Image"
        $hadFixes = $true
    }
    
    # Fix FlatListAlert -> FlatList, Alert
    if ($content -match "FlatListAlert") {
        $content = $content -replace "FlatListAlert", "FlatList, Alert"
        $hadFixes = $true
    }
    
    # Fix ViewTextInput -> View (TextInput is in custom components)
    if ($content -match "ViewTextInput,") {
        $content = $content -replace "ViewTextInput,", "View,"
        $hadFixes = $true
    }
    
    # Check if content changed
    if ($content -ne $originalContent) {
        $fixedFiles++
        
        Write-Host "Fixed: $relativePath" -ForegroundColor Green
        
        if (-not $DryRun) {
            Set-Content -Path $file.FullName -Value $content -NoNewline
        }
    }
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Fix Summary" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Files fixed: $fixedFiles" -ForegroundColor $(if ($fixedFiles -gt 0) { "Green" } else { "Yellow" })

if ($DryRun) {
    Write-Host ""
    Write-Host "This was a DRY RUN - no files were modified" -ForegroundColor Yellow
    Write-Host "Run without -DryRun to apply fixes" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Fix complete!" -ForegroundColor Green
