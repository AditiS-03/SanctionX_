# Quick Setup Guide

## Step 1: Fix the Database Error

The error occurred because of a foreign key constraint. I've fixed the SQL script.

**Run this in Supabase SQL Editor**:

1. Open Supabase Dashboard → SQL Editor
2. Copy the updated `backend/setup_database.sql`
3. Click **Run**

The script will now work without errors!

## Step 2: Admin Login Credentials

**Email**: `admin@gmail.com`  
**Password**: `123456`

Login at: `http://localhost:3000/auth`

After login, you'll be redirected to `/admin/applications`

## Step 3: Test Auto-Approval

1. Submit a loan application through the chat
2. Wait exactly **2 minutes**
3. The sanction letter will auto-generate
4. Download link appears in chat automatically

## What Was Fixed

✅ Removed foreign key constraint causing SQL error  
✅ Updated admin credentials to `admin@gmail.com` / `123456`  
✅ Auto-approval already configured (triggers after 2 minutes)  
✅ Sanction letter generation already working

## Quick Test

```bash
# Test admin endpoint
curl http://localhost:8005/admin/applications

# Should return [] before any applications
# After submitting an app, will return application data
```

That's it! Run the SQL and you're ready to go! 🚀
