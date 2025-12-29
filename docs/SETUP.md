# Setup Guide

## Prerequisites

- **Node.js**: 18.0.0 or higher
- **npm**: 9.0.0 or higher
- **PostgreSQL**: 14.0 or higher
- **pgvector extension**: Required for vector embeddings

## Installation Steps

### 1. Install Dependencies

```bash
npm install
```

This will install dependencies for:
- Root workspace
- `shared/` package
- `backend/` package
- `frontend/` package

### 2. Set Up PostgreSQL Database

#### Install PostgreSQL

**Ubuntu/Debian**:
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

**macOS**:
```bash
brew install postgresql
```

**Windows**: Download from [postgresql.org](https://www.postgresql.org/download/)

#### Install pgvector Extension

**Ubuntu/Debian**:
```bash
sudo apt install postgresql-14-pgvector  # Adjust version as needed
```

**macOS**:
```bash
brew install pgvector
```

**From Source**:
```bash
git clone --branch v0.5.1 https://github.com/pgvector/pgvector.git
cd pgvector
make
sudo make install
```

#### Create Database

```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Create database
CREATE DATABASE ai_english_speaker;

# Connect to database
\c ai_english_speaker

# Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

# Exit
\q
```

### 3. Configure Environment Variables

#### Backend

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` and update:
- `DATABASE_URL`: Your PostgreSQL connection string
- `DIRECT_URL`: Same as DATABASE_URL (for migrations)
- `JWT_SECRET`: Generate a strong secret key
- `JWT_REFRESH_SECRET`: Generate another secret key

**Generate JWT Secrets**:
```bash
# Generate random secrets
openssl rand -base64 32
```

#### Frontend

```bash
cd frontend
```

Create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 4. Set Up Database

```bash
# Generate Prisma Client
npm run db:generate

# Run migrations
npm run db:migrate

# (Optional) Seed initial data
npm run db:seed
```

### 5. Start Development Servers

```bash
# From root directory
npm run dev
```

This starts:
- **Backend**: http://localhost:3001
- **Frontend**: http://localhost:3000

Or start individually:
```bash
# Backend only
npm run dev:backend

# Frontend only
npm run dev:frontend
```

## Verify Installation

### Backend Health Check

```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Frontend

Open http://localhost:3000 in your browser. You should see the landing page.

## Database Management

### Prisma Studio

View and edit database records:
```bash
npm run db:studio
```

### Create Migration

After changing `schema.prisma`:
```bash
npm run db:migrate
```

### Reset Database (Development Only)

```bash
cd backend
npx prisma migrate reset
```

⚠️ **Warning**: This will delete all data!

## Troubleshooting

### Database Connection Issues

1. Check PostgreSQL is running:
   ```bash
   sudo systemctl status postgresql  # Linux
   brew services list                 # macOS
   ```

2. Verify connection string in `.env`:
   ```
   postgresql://username:password@localhost:5432/ai_english_speaker
   ```

3. Test connection:
   ```bash
   psql -U username -d ai_english_speaker -h localhost
   ```

### pgvector Extension Not Found

1. Verify extension is installed:
   ```sql
   SELECT * FROM pg_available_extensions WHERE name = 'vector';
   ```

2. If not found, install pgvector (see above)

3. Enable in database:
   ```sql
   CREATE EXTENSION vector;
   ```

### Port Already in Use

If port 3000 or 3001 is already in use:

**Backend**: Change `PORT` in `backend/.env`

**Frontend**: Change port in `frontend/package.json`:
```json
{
  "scripts": {
    "dev": "next dev -p 3002"
  }
}
```

### Module Resolution Issues

If you see "Cannot find module" errors:

1. Rebuild shared package:
   ```bash
   cd shared
   npm run build
   ```

2. Reinstall dependencies:
   ```bash
   npm install
   ```

## Development Workflow

1. **Make changes** to code
2. **Type check**: `npm run type-check`
3. **Lint**: `npm run lint`
4. **Format**: `npm run format`
5. **Test**: Run your changes
6. **Commit**: Follow conventional commits

## Next Steps

After setup, proceed with:
1. Module 2: Database Setup (verify migrations)
2. Module 3: Authentication (build auth system)
3. Continue with remaining modules

See [MODULES.md](./MODULES.md) for detailed module breakdown.

