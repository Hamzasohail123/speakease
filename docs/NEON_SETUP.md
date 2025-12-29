# Neon PostgreSQL Setup Guide

## 🚀 Setting Up Neon PostgreSQL with pgvector

Neon is a serverless PostgreSQL service that makes it easy to set up and use. Here's how to enable pgvector:

### Step 1: Create Neon Account & Database

1. Go to https://neon.tech
2. Sign up / Log in
3. Create a new project
4. Note your connection string (you'll need it later)

### Step 2: Enable pgvector Extension

Neon has a built-in SQL Editor. Here's how to enable pgvector:

#### Option A: Using Neon Dashboard (Easiest)

1. **Open Neon Dashboard**
   - Go to https://console.neon.tech
   - Select your project

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Or go directly to: `https://console.neon.tech/project/YOUR_PROJECT_ID/sql`

3. **Run this SQL command**:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```

4. **Verify it's installed**:
   ```sql
   SELECT * FROM pg_extension WHERE extname = 'vector';
   ```
   
   You should see a row with `extname = 'vector'`

#### Option B: Using psql (Command Line)

If you prefer using command line:

1. **Get your connection string from Neon Dashboard**
   - Go to your project settings
   - Copy the connection string (looks like: `postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname`)

2. **Connect using psql**:
   ```bash
   psql "YOUR_NEON_CONNECTION_STRING"
   ```

3. **Enable extension**:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```

4. **Verify**:
   ```sql
   SELECT * FROM pg_extension WHERE extname = 'vector';
   \q
   ```

### Step 3: Configure Your .env File

In your `backend/.env` file, use your Neon connection string:

```env
# Neon Connection String
DATABASE_URL="postgresql://user:password@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://user:password@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require"

# Note: For Neon, DATABASE_URL and DIRECT_URL are usually the same
# The ?sslmode=require is important for Neon
```

**Important Notes for Neon:**
- Neon requires SSL connections (`sslmode=require`)
- Use the same connection string for both `DATABASE_URL` and `DIRECT_URL`
- Neon automatically handles connection pooling

### Step 4: Run Migrations

Once pgvector is enabled, run your migrations:

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed initial data (optional)
npm run db:seed

# Verify setup
npm run db:verify
```

### Step 5: Verify pgvector is Working

You can verify pgvector is working by running this in Neon SQL Editor:

```sql
-- Check extension is installed
SELECT * FROM pg_extension WHERE extname = 'vector';

-- Test vector type (should work without error)
SELECT '[1,2,3]'::vector;
```

If both queries work, pgvector is properly installed! ✅

## 🔍 Troubleshooting

### Issue: "extension 'vector' does not exist"

**Solution:**
- Make sure you ran `CREATE EXTENSION vector;` in the correct database
- Check you're connected to the right project/database in Neon

### Issue: Connection errors

**Solution:**
- Make sure your connection string includes `?sslmode=require`
- Verify your connection string is correct in Neon dashboard
- Check if your IP is allowed (Neon allows all IPs by default)

### Issue: "relation does not exist" after migration

**Solution:**
- Make sure you're running migrations on the correct database
- Check your `DATABASE_URL` points to the right Neon project
- Try running `npm run db:migrate` again

## 📚 Neon Resources

- **Neon Dashboard**: https://console.neon.tech
- **Neon Docs**: https://neon.tech/docs
- **pgvector on Neon**: https://neon.tech/docs/extensions/pgvector
- **Connection Strings**: https://neon.tech/docs/connect/connect-from-any-app

## 💡 Neon Tips

1. **Free Tier**: Neon offers a generous free tier (perfect for development)
2. **Auto-scaling**: Neon automatically scales your database
3. **Branching**: Neon supports database branching (like git branches!)
4. **Connection Pooling**: Built-in connection pooling (no need for PgBouncer)
5. **Backups**: Automatic backups included

## ✅ Quick Checklist

- [ ] Created Neon account
- [ ] Created Neon project
- [ ] Enabled pgvector extension in SQL Editor
- [ ] Verified extension with `SELECT * FROM pg_extension WHERE extname = 'vector';`
- [ ] Copied connection string to `backend/.env`
- [ ] Added `?sslmode=require` to connection string
- [ ] Ran `npm run db:generate`
- [ ] Ran `npm run db:migrate`
- [ ] Verified with `npm run db:verify`

Once all checkboxes are done, you're ready to go! 🚀

