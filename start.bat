@echo off
echo ==============================================
echo 🚀 Starting AI App Generator...
echo ==============================================

:: 1. Start Database
echo.
echo [1/4] 📦 Checking PostgreSQL Database Container...
docker ps -q -f name=ai-app-postgres >nul
if %errorlevel% equ 0 (
    echo ✅ Database is already running.
) else (
    docker ps -aq -f status=exited -f name=ai-app-postgres >nul
    if %errorlevel% equ 0 (
        echo 🔄 Starting existing database container...
        docker start ai-app-postgres
    ) else (
        echo 🚀 Creating and starting new database container...
        docker run --name ai-app-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=ai_app_generator -p 5432:5432 -d postgres
    )
)

echo ⏳ Waiting 3 seconds for database to initialize...
timeout /t 3 /nobreak >nul

:: 2. Sync Schema
echo.
echo [2/4] 🔄 Syncing database schema...
call npx prisma db push

:: 3. Seed Database
echo.
echo [3/4] 🌱 Seeding initial demo data...
call npm run db:seed

:: 4. Start Next.js App
echo.
echo [4/4] 💻 Starting Next.js frontend ^& backend...
echo 🌐 App will be accessible at http://localhost:3000
echo.
call npm run dev
