# PowerShell pre-commit script for Windows environments
Write-Host "Running pre-commit checks..."

# Run linting
Write-Host "Running linting..."
pnpm lint
if ($LASTEXITCODE -ne 0) {
    Write-Host "Linting failed! Please fix the issues before committing."
    exit 1
}

# Generate Prisma client
Write-Host "Generating Prisma client..."
pnpm prisma generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "Prisma generation failed! Please fix the issues before committing."
    exit 1
}

# Run build
Write-Host "Running build check..."
pnpm build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed! Please fix the issues before committing."
    exit 1
}

Write-Host "All checks passed! Ready to commit."
exit 0
