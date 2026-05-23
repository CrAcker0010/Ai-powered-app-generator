#!/bin/bash

echo "🚀 Starting AI App Generator..."

# 1. Start Database
echo "📦 Checking PostgreSQL Database Container..."
if [ "$(docker ps -q -f name=ai-app-postgres)" ]; then
    echo "✅ Database is already running."
else
    if [ "$(docker ps -aq -f status=exited -f name=ai-app-postgres)" ]; then
        echo "🔄 Starting existing database container..."
        docker start ai-app-postgres
    else
        echo "🚀 Creating and starting new database container..."
        docker run --name ai-app-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=ai_app_generator -p 5432:5432 -d postgres
    fi
fi

echo "⏳ Waiting for database to be ready..."
sleep 3

# 2. Sync Schema
echo "🔄 Syncing database schema..."
npx prisma db push

# 3. Seed Database
echo "🌱 Seeding initial demo data..."
npm run db:seed

# 4. Start Next.js App
echo "💻 Starting Next.js frontend & backend..."
echo "🌐 App will be accessible at http://localhost:3000"
npm run dev
