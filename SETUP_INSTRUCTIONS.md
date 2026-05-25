# Career Guidance System - Setup Instructions

## ✅ Transformation Complete!

The application has been successfully transformed from Task Management to **Career Guidance System** with database connection fixes.

## 🚀 Quick Start

### 1. Create `.env` file

Create a `.env` file in the root directory with:

```env
# Database (SQLite - no installation needed!)
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
```

**Generate NEXTAUTH_SECRET:**
- Windows PowerShell: `[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))`
- Linux/Mac: `openssl rand -base64 32`

### 2. Initialize Database

```bash
# Generate Prisma Client
npx prisma generate

# Create database and tables
npx prisma db push

# (Optional) Seed sample data
npm run db:seed
```

### 3. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📧 Test Accounts

After running seed:
- **Student**: `student@example.com` / `password123`
- **Counselor**: `counselor@example.com` / `password123`
- **Admin**: `admin@example.com` / `password123`

## 🔧 Database Connection Fixes

### What Was Fixed:

1. **Default to SQLite** - Changed from PostgreSQL to SQLite for easier setup
2. **Removed Enums** - SQLite doesn't support enums, converted to strings with defaults
3. **Enhanced Error Handling** - Added connection error messages in `lib/prisma.ts`
4. **Better Logging** - Clear error messages if DATABASE_URL is missing

### For PostgreSQL (Production):

1. Change `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. Update `.env`:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/careerguidance"
   ```

3. Run migrations:
   ```bash
   npx prisma db push
   ```

## 📋 Features

### For Students:
- Browse career profiles
- Save/bookmark careers
- View personalized recommendations
- Search and filter careers

### For Counselors:
- All student features
- Create and edit career profiles
- Manage career information

### For Admins:
- All counselor features
- Delete careers
- Full system management

## 🎯 API Endpoints

- `GET /api/careers` - List careers (with search, filter, pagination)
- `POST /api/careers` - Create career (Admin/Counselor)
- `GET /api/careers/[id]` - Get single career
- `PATCH /api/careers/[id]` - Update career (Admin/Counselor)
- `DELETE /api/careers/[id]` - Delete career (Admin only)
- `GET /api/recommendations` - Get user recommendations
- `GET /api/saved-careers` - Get saved careers
- `POST /api/saved-careers` - Save a career
- `DELETE /api/saved-careers` - Remove saved career

## 🐛 Troubleshooting

### Database Connection Issues:

1. **"Cannot find module '@prisma/client'"**
   ```bash
   npx prisma generate
   ```

2. **"Database connection error"**
   - Check `.env` file exists
   - Verify `DATABASE_URL` is set
   - For SQLite: Ensure write permissions in project directory

3. **"EPERM: operation not permitted"**
   - Close any running dev servers
   - Try again

4. **Schema validation errors**
   - Run: `npx prisma format`
   - Then: `npx prisma generate`

## ✅ Status

- ✅ Schema transformed to Career Guidance System
- ✅ Database connection fixed (SQLite default)
- ✅ All API routes updated
- ✅ Dashboard redesigned for careers
- ✅ Authentication with roles (STUDENT, COUNSELOR, ADMIN)
- ✅ Seed file with sample data
- ✅ TypeScript types fixed

**Ready to use!** 🎉

