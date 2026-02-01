# Supabase Setup Guide for Hostel Management System

## 📋 Prerequisites
- A Supabase account (free tier is perfect!)
- Your project is already set up locally

## 🚀 Step-by-Step Setup

### 1. Create a Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click **"New Project"**
3. Fill in the details:
   - **Name**: Hostel Management (or your choice)
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose closest to you
4. Click **"Create New Project"** and wait ~2 minutes

### 2. Get Your API Credentials

1. In your Supabase project, go to **Settings** (⚙️ icon) → **API**
2. You'll see two important values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)
3. **Keep these safe!** You'll need them next

### 3. Update Your .env File

1. Open the `.env` file in your project root
2. Replace the placeholder values:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi... (your actual anon key)
```

3. Save the file

### 4. Create Database Tables

1. In Supabase Dashboard, go to **SQL Editor** (📝 icon)
2. Click **"New Query"**
3. Copy the ENTIRE content from `supabase-schema.sql` file
4. Paste it into the SQL editor
5. Click **"Run"** (or press Ctrl+Enter)
6. You should see "Success. No rows returned"

### 5. Verify Tables Were Created

1. Go to **Table Editor** (🗂️ icon) in Supabase
2. You should see these tables:
   - `hostels`
   - `floors`
   - `rooms`
   - `students`
   - `payments`

### 6. Restart Your Dev Server

After setting up the `.env` file, restart the development server:

```bash
# Stop the current server (Ctrl+C if running)
npm run dev
```

## ✅ Verification

Once everything is set up:

1. Open the app at `http://localhost:8080`
2. Login with demo credentials
3. Try adding a hostel - it should now save to Supabase!
4. Go to Supabase **Table Editor** → **hostels** - you should see your data there

## 🔐 Security Notes

- **Never commit your .env file to Git** (it's already in .gitignore)
- The anon key is safe to use in frontend (it has Row Level Security)
- For production, you may want to tighten the RLS policies in the SQL schema

## 📊 Viewing Your Data

At any time, you can:
- View data in **Supabase Table Editor**
- Query data in **SQL Editor**
- See real-time changes in **Database** → **Tables**

## 🆘 Troubleshooting

**If you see "Supabase URL not set" error:**
- Make sure `.env` file exists and has correct values
- Restart the dev server after editing `.env`

**If tables don't appear:**
- Re-run the `supabase-schema.sql` in SQL Editor
- Check for error messages in the SQL output

**If data isn't saving:**
- Check browser console for errors (F12)
- Verify your API credentials are correct
- Make sure RLS policies are set (they should be from the SQL script)

## 🎉 Next Steps

Once Supabase is connected:
- Your data persists in the cloud ☁️
- Access from any device 📱💻
- Automatic backups 🔄
- Ready for production deployment 🚀
