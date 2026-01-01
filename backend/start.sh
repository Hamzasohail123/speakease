#!/bin/bash
set -e

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BACKEND_DIR="$SCRIPT_DIR"
ROOT_DIR="$(dirname "$BACKEND_DIR")"

echo "📦 Installing root dependencies (including dev dependencies for build)..."
cd "$ROOT_DIR"
npm install --include=dev

echo "🔨 Building shared package first..."
cd "$ROOT_DIR/shared"
npm install --include=dev
npm run build

echo "🔨 Building backend application..."
cd "$BACKEND_DIR"
npm install --include=dev
npm run build

echo "🗄️  Generating Prisma client..."
npm run db:generate

echo "🗄️  Running database migrations..."
npm run db:migrate:deploy

echo "🚀 Starting server..."
node dist/index.js

