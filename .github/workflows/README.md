# GitHub Actions Workflows

This directory contains GitHub Actions workflow files that automate CI/CD processes for this project.

## Workflows

### CI (ci.yml)

The CI workflow runs on every push and pull request to main, master, and develop branches.

**What it does:**
- Checks out the code
- Sets up Node.js and pnpm
- Installs dependencies
- Generates Prisma client
- Runs linting
- Builds the application

### Deploy (deploy.yml)

The deployment workflow runs after successful CI completion on main/master branches, or can be triggered manually.

**What it does:**
- Checks out the code
- Sets up Node.js and pnpm
- Installs Vercel CLI
- Pulls environment variables from Vercel
- Builds the project for production
- Deploys to Vercel

## Setup

To set up these workflows for your own deployment, you need to add these secrets to your GitHub repository:
- `VERCEL_TOKEN`: Your Vercel API token
- `VERCEL_ORG_ID`: Your Vercel organization ID
- `VERCEL_PROJECT_ID`: Your Vercel project ID

## Local Development

For local development, you can use the pre-commit hooks in the scripts directory:
- `scripts/pre-commit-check.sh`: For Unix-based systems
- `scripts/pre-commit-check.ps1`: For Windows systems

These scripts will run linting, Prisma generation, and build checks before each commit.
