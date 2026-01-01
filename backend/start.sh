#!/bin/bash
set -e

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BACKEND_DIR="$SCRIPT_DIR"
ROOT_DIR="$(dirname "$BACKEND_DIR")"

echo "📦 Installing all workspace dependencies (including dev dependencies)..."
cd "$ROOT_DIR"
# Install from root to properly handle workspace dependencies
npm install --include=dev

echo "🔨 Building shared package first (required by backend)..."
cd "$ROOT_DIR/shared"
npm run build

echo "🔨 Building backend application..."
cd "$BACKEND_DIR"
npm run build

echo "🗄️  Generating Prisma client..."
npm run db:generate

echo "🗄️  Running database migrations..."
npm run db:migrate:deploy

echo "🚀 Starting server..."
node dist/index.js

