# 🔄 CLEAN SLATE - Recreate Signup From Scratch

## What We're Doing:

Starting completely fresh by:
1. ✅ Dropping the problematic profiles table
2. ✅ Creating a new, simple profiles table (NO college field!)
3. ✅ Creating a simple trigger that works
4. ✅ NO RLS complexity
5. ✅ Simplified AuthContext

## Step-by-Step Instructions:

### STEP 1: Run CLEAN_SLATE_SIGNUP.sql

1. Open `CLEAN_SLATE_SIGNUP.sql` in VS Code
2. **Copy ALL content** (Ctrl+A, Ctrl+C)
3. Go to **Supabase Dashboard** → **SQL Editor**
4. **Clear the editor**
5. **Paste** the script
6. Click **RUN**
7. **Verify** you see: "Setup complete! Signup should work now."

### STEP 2: Check What Changed

The script will show you the new profiles table structure:
- ✅ `id` (UUID, primary key)
- ✅ `email` (text, nullable)
- ✅ `full_name` (text, nullable)
- ✅ `avatar_url` (text, nullable)
- ✅ `created_at` (timestamp)
- ✅ `updated_at` (timestamp)

**NO college field!** - Simple and clean.

### STEP 3: Restart Development Server

```cmd
# Stop the current server (Ctrl+C)
npm run dev
```

### STEP 4: Clear Browser & Test

1. **Close ALL browser tabs**
2. **Press Ctrl+Shift+Delete**
3. Clear "All time" + "Cookies and cached files"
4. **Close browser completely**
5. **Wait 10 seconds**
6. **Reopen browser**
7. Go to `localhost:5173/signup`

### STEP 5: Try Signup

Fill in:
- **Full name**: "Clean Test User"
- **Email**: "cleantest@example.com" (NEW email)
- **Password**: "Test123456"
- **Confirm**: "Test123456"

Click **"Create account"**

## Expected Result:

✅ **SUCCESS** - No errors!
✅ User created in Supabase Auth
✅ Profile created automatically by trigger
✅ Success toast appears
✅ Redirected to dashboard (or email confirmation message)

## What Changed:

### In Database:
- ✅ Removed ALL complex fields (college, year, semester, etc.)
- ✅ Removed RLS completely (for now)
- ✅ Simple trigger with exception handling
- ✅ Full permissions granted

### In Code:
- ✅ Simplified AuthContext signUp function
- ✅ Removed profile checking logic
- ✅ Removed manual profile creation fallback
- ✅ Let trigger do its job

## If It Still Fails:

**Check Supabase Auth Settings:**
1. Go to Supabase Dashboard → Authentication → Providers
2. Check "Email" provider settings
3. **Disable "Confirm email"** if it's enabled (for testing)
4. Save changes
5. Try signup again

## After Signup Works:

You can add back features later:
- Add college field (nullable)
- Add RLS policies
- Add profile completion flow
- etc.

But first, let's get basic signup working!

---

**Run CLEAN_SLATE_SIGNUP.sql NOW and test!** 🚀
