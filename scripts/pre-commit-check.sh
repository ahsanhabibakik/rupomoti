#!/bin/bash

# Script to check build before committing to Git

echo "Running pre-commit checks..."

# Run linting
echo "Running linting..."
pnpm lint
RESULT=$?

if [ $RESULT -ne 0 ]; then
  echo "Linting failed! Please fix the issues before committing."
  exit 1
fi

# Generate Prisma client
echo "Generating Prisma client..."
pnpm prisma generate
RESULT=$?

if [ $RESULT -ne 0 ]; then
  echo "Prisma generation failed! Please fix the issues before committing."
  exit 1
fi

# Run build
echo "Running build check..."
pnpm build
RESULT=$?

if [ $RESULT -ne 0 ]; then
  echo "Build failed! Please fix the issues before committing."
  exit 1
fi

echo "All checks passed! Ready to commit."
exit 0
