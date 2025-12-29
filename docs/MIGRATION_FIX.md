# Fixing Prisma Migration Error with pgvector

## Problem

When running `npm run db:migrate`, you get this error:

```
Error: P3006
Migration failed to apply cleanly to the shadow database.
ERROR: type "vector" does not exist
```

## Root Cause

Prisma uses a "shadow database" to validate migrations. This shadow database also needs the `pgvector` extension, but it's not automatically enabled.

## Solution for Neon PostgreSQL

Since you're using Neon, the shadow database is automatically created but doesn't have the extension. Here are the solutions:

### Option 1: Enable Extension Manually (Recommended for Neon)

1. **Go to Neon Console** → Your Database → SQL Editor
2. **Run this SQL:**
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```
3. **Try migration again:**
   ```bash
   npm run db:migrate
   ```

### Option 2: Use Migrate Deploy (If Migration Already Applied)

If the migration is already applied to your main database:

```bash
# Check migration status
cd backend
npx prisma migrate status

# If migration is already applied, use deploy instead
npm run db:migrate:deploy
```

### Option 3: Reset and Reapply (Development Only)

⚠️ **Warning: This will delete all data!**

```bash
# Reset database and migrations
npm run db:reset

# This will:
# 1. Drop all tables
# 2. Recreate database
# 3. Apply all migrations fresh
```

### Option 4: Fix Migration File (Already Done)

The migration file has been updated to include:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

But if Prisma still uses the old shadow database, you may need to:

1. **Delete the shadow database** (Prisma will recreate it)
2. **Or reset migrations** (Option 3)

## Quick Fix Steps

1. **Enable extension in Neon:**
   - Go to Neon Console
   - SQL Editor
   - Run: `CREATE EXTENSION IF NOT EXISTS vector;`

2. **Verify extension:**
   ```bash
   npm run db:verify
   ```

3. **Try migration:**
   ```bash
   npm run db:migrate
   ```

## If Still Failing

If the error persists:

1. **Check if tables already exist:**
   ```bash
   npm run db:verify
   ```

2. **If tables exist, migration is already applied:**
   - You can skip `db:migrate`
   - Just run: `npm run db:generate` and `npm run db:seed`

3. **If you need to reapply:**
   ```bash
   npm run db:reset  # ⚠️ Deletes all data
   ```

## For Production

In production, always use:
```bash
npm run db:migrate:deploy
```

This doesn't use shadow database validation.

---

## Verification

After fixing, verify everything works:

```bash
# 1. Verify database
npm run db:verify

# 2. Generate Prisma client
npm run db:generate

# 3. Seed data
npm run db:seed

# 4. Start backend
npm run dev:backend
```

---

## Additional Notes

- **Shadow Database**: Prisma creates a temporary database to validate migrations. This needs the same extensions as your main database.
- **Neon Limitation**: Neon's shadow database doesn't automatically inherit extensions from the main database.
- **Solution**: Always enable `pgvector` extension manually in Neon before running migrations.

