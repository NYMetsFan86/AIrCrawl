# PostgreSQL Database Migration Commands

## Setup Environment Variables
```bash
# Set your PostgreSQL database URL in .env file
echo "DATABASE_URL=postgresql://username:password@localhost:5432/ai_crawler_lite" > .env
```

## Generate Prisma Client
```bash
# Generate Prisma client based on your schema
npx prisma generate
```

## Create Initial Migration
```bash
# Create a migration for your PostgreSQL schema
npx prisma migrate dev --name init
```

## Deploy Migrations to Production
```bash
# For production deployment
npx prisma migrate deploy
```

## Reset Database (Development Only)
```bash
# Warning: This will delete all data
npx prisma migrate reset
```

## View Database in Prisma Studio
```bash
# Open Prisma Studio to view and edit data
npx prisma studio
```

## Validate Schema
```bash
# Validate your Prisma schema
npx prisma validate
```

## Export Database Schema
```bash
# Export current database schema
npx prisma db pull
```

## Data Migration from SQLite (if needed)
```bash
# Export data from SQLite
sqlite3 old_database.db .dump > sqlite_dump.sql

# Convert SQLite dump to PostgreSQL format (may require manual adjustments)
# Import to PostgreSQL
psql -U username -d ai_crawler_lite -f converted_dump.sql
```
