# Starting the AI App Generator

This guide provides the necessary steps to run the complete application locally. The application consists of a Next.js full-stack application (frontend + API backend) and a PostgreSQL database.

## Prerequisites

- **Node.js** (v18+)
- **Docker Desktop** (Running in the background)
- **npm** (Node Package Manager)

## Step-by-Step Instructions

### 1. Start the Database
The application requires a PostgreSQL database to handle dynamic `Json` schemas. Run the following Docker command to start a containerized PostgreSQL instance in the background:
```bash
docker run --name ai-app-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=ai_app_generator -p 5432:5432 -d postgres
```
*(If the container is already created but stopped, use `docker start ai-app-postgres` instead).*

### 2. Sync the Schema and Seed Data
Once the database is running, you need to apply the Prisma schema and populate the database with the initial demo configurations (CRM, Task Tracker, Inventory).
```bash
npx prisma db push
npm run db:seed
```

### 3. Start the Application
Finally, start the Next.js development server:
```bash
npm run dev
```

The application will be accessible at [http://localhost:3000](http://localhost:3000).

---

## 🚀 One-Click Startup

To automate the startup process, you can use the provided startup scripts.

### On Windows
Double-click `start.bat` or run it from the command line:
```cmd
.\start.bat
```

### On Mac/Linux/WSL (Bash)
Run the bash script:
```bash
bash start.sh
```

These scripts will automatically check the database container, apply the schema, seed the database if necessary, and launch the development server all at once.
