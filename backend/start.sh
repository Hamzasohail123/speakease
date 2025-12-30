#!/bin/bash
set -e

echo "🔨 Building application..."
npm run build

echo "🗄️  Running database migrations..."
npm run db:migrate:deploy

echo "🚀 Starting server..."
node dist/index.js

