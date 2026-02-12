# 프로젝트별 테스트 마이그레이션 스크립트 (PowerShell)
#
# 사용법:
#   .\scripts\migrate-to-project.ps1 -ProjectName "TeacherHub" -TargetPath "C:\GIT\TeacherHub"

param(
    [Parameter(Mandatory=$true)]
    [string]$ProjectName,

    [Parameter(Mandatory=$true)]
    [string]$TargetPath
)

$ErrorActionPreference = "Stop"

$SourcePath = Join-Path $PSScriptRoot "..\projects\$ProjectName"
$TemplatesPath = Join-Path $PSScriptRoot "..\templates"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  QA 테스트 마이그레이션: $ProjectName" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# 소스 확인
if (-not (Test-Path $SourcePath)) {
    Write-Host "❌ 소스 프로젝트를 찾을 수 없습니다: $SourcePath" -ForegroundColor Red
    exit 1
}

# 타겟 확인
if (-not (Test-Path $TargetPath)) {
    Write-Host "❌ 타겟 경로를 찾을 수 없습니다: $TargetPath" -ForegroundColor Red
    exit 1
}

Write-Host "`n📁 디렉토리 구조 생성..." -ForegroundColor Yellow

# 디렉토리 생성
$directories = @(
    "e2e\tests",
    "e2e\utils",
    "e2e\fixtures",
    ".github\workflows"
)

foreach ($dir in $directories) {
    $fullPath = Join-Path $TargetPath $dir
    if (-not (Test-Path $fullPath)) {
        New-Item -ItemType Directory -Path $fullPath -Force | Out-Null
        Write-Host "  ✓ Created: $dir" -ForegroundColor Green
    } else {
        Write-Host "  - Exists: $dir" -ForegroundColor Gray
    }
}

Write-Host "`n📋 테스트 파일 복사..." -ForegroundColor Yellow

# 테스트 파일 복사
$sourceE2e = Join-Path $SourcePath "e2e"
if (Test-Path $sourceE2e) {
    $testFiles = Get-ChildItem -Path $sourceE2e -Filter "*.spec.ts" -Recurse

    foreach ($file in $testFiles) {
        $destPath = Join-Path $TargetPath "e2e\tests\$($file.Name)"
        Copy-Item -Path $file.FullName -Destination $destPath -Force
        Write-Host "  ✓ Copied: $($file.Name)" -ForegroundColor Green
    }
}

Write-Host "`n⚙️ 설정 파일 복사..." -ForegroundColor Yellow

# Playwright 설정 복사
$playwrightConfig = Join-Path $TemplatesPath "playwright.config.template.ts"
$destConfig = Join-Path $TargetPath "e2e\playwright.config.ts"
Copy-Item -Path $playwrightConfig -Destination $destConfig -Force
Write-Host "  ✓ Copied: playwright.config.ts" -ForegroundColor Green

# GitHub Actions 워크플로우 복사
$workflowTemplate = Join-Path $TemplatesPath "e2e-test.yml"
$destWorkflow = Join-Path $TargetPath ".github\workflows\e2e-test.yml"
Copy-Item -Path $workflowTemplate -Destination $destWorkflow -Force
Write-Host "  ✓ Copied: e2e-test.yml" -ForegroundColor Green

Write-Host "`n📦 package.json 업데이트 안내..." -ForegroundColor Yellow

$packageJsonPath = Join-Path $TargetPath "package.json"
if (Test-Path $packageJsonPath) {
    Write-Host @"

다음 스크립트를 package.json에 추가하세요:

"scripts": {
  "test:e2e": "playwright test --config=e2e/playwright.config.ts",
  "test:e2e:ui": "playwright test --config=e2e/playwright.config.ts --ui",
  "test:e2e:headed": "playwright test --config=e2e/playwright.config.ts --headed",
  "test:e2e:report": "playwright show-report e2e/playwright-report"
}

"devDependencies": {
  "@playwright/test": "^1.40.0"
}

"@ -ForegroundColor White
} else {
    Write-Host "  ⚠️ package.json이 없습니다. Node.js 프로젝트가 아닐 수 있습니다." -ForegroundColor Yellow
}

Write-Host "`n✅ 마이그레이션 완료!" -ForegroundColor Green
Write-Host @"

다음 단계:
1. $TargetPath\e2e\playwright.config.ts 파일을 열고 BASE_URL 등을 수정하세요
2. package.json에 테스트 스크립트를 추가하세요
3. npm install @playwright/test 실행
4. npx playwright install chromium 실행
5. npm run test:e2e 로 테스트 실행

"@ -ForegroundColor Cyan
