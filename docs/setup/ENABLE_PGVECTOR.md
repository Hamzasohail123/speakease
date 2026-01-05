# 🔧 Enable pgvector on Render PostgreSQL

Since Render's free tier doesn't have a Shell option, here are 3 ways to enable pgvector:

---

## ✅ Option 1: Using Online SQL Tool (Easiest)

1. **Get your External Database URL** from Render:
   - Go to your database → "Connections" tab
   - Copy the **External Database URL**

2. **Use an online PostgreSQL client**:
   - Go to: https://www.elephantsql.com/console.html
   - Or: https://dbeaver.io/download/ (desktop app)
   - Or: https://pgweb.pgadmin.org/ (web-based)

3. **Connect using your External Database URL**:
   ```
   postgresql://speakease_user:password@dpg-xxxxx-a.singapore-postgres.render.com/speakease
   ```

4. **Run this SQL**:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```

5. **Verify**:
   ```sql
   SELECT * FROM pg_extension WHERE extname = 'vector';
   ```

---

## ✅ Option 2: Using psql (Command Line)

If you have PostgreSQL installed locally:

```bash
# Use the External Database URL from Render
psql "postgresql://speakease_user:password@dpg-xxxxx-a.singapore-postgres.render.com/speakease"

# Then run:
CREATE EXTENSION IF NOT EXISTS vector;
```

---

## ✅ Option 3: Enable via Backend (Automatic)

**Good news!** Your Prisma migration already includes pgvector!

When you deploy your backend, it will automatically run:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

**So you can skip this step** and just deploy your backend - it will enable pgvector automatically during migration!

---

## 🎯 Recommended: Option 3 (Automatic)

Since your migration already has `CREATE EXTENSION IF NOT EXISTS vector;`, you can:

1. **Skip enabling pgvector manually**
2. **Deploy your backend service**
3. **The migration will enable it automatically**

---

## ✅ Verify pgvector is Enabled

After deployment, check your backend logs or run:

```sql
SELECT * FROM pg_extension WHERE extname = 'vector';
```

You should see a row with the vector extension.

---

**TL;DR: Your migration already enables pgvector, so just deploy your backend and it will be enabled automatically!** 🚀

