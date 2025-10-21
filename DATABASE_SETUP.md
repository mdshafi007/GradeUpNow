# GradeUpNow Database Setup Guide

## 🚀 Quick Setup Instructions

### Step 1: Run the Schema in Supabase

1. **Open your Supabase Dashboard**
   - Go to [https://supabase.com](https://supabase.com)
   - Navigate to your GradeUpNow project

2. **Execute the Schema**
   - Go to **SQL Editor** in the left sidebar
   - Copy the entire content from `database_schema.sql`
   - Paste it into the SQL Editor
   - Click **Run** to execute the schema

3. **Verify Tables Created**
   - Go to **Table Editor** in the left sidebar
   - You should see all these tables:
     - `profiles`
     - `skills`
     - `interests`
     - `user_skills`
     - `user_interests`
     - `courses`
     - `user_progress`
     - `quizzes`
     - `quiz_attempts`
     - `notifications`

### Step 2: ✅ Profile Component Updated

I've already updated your Profile component (`src/components/profile/Profile.jsx`) with proper Supabase integration:

#### **Key Changes Made:**

1. **Added Database Imports:**
```javascript
import { 
  getUserProfile, 
  upsertUserProfile, 
  updateUserSkills, 
  updateUserInterests,
  getAvailableSkills,
  getAvailableInterests 
} from '../../lib/database'
import { toast } from 'react-toastify'
```

2. **Replaced localStorage with Database Calls:**
- ✅ **Profile Loading**: Fetches from `profiles` table on component mount
- ✅ **Skills Loading**: Gets available skills from `skills` table  
- ✅ **Interests Loading**: Gets available interests from `interests` table
- ✅ **Profile Saving**: Uses `upsertUserProfile()` for profile data
- ✅ **Skills Saving**: Uses `updateUserSkills()` for user skills
- ✅ **Interests Saving**: Uses `updateUserInterests()` for user interests

3. **Added Proper Loading States:**
- ✅ **Initial Loading**: Shows spinner while fetching data
- ✅ **Auth Loading**: Handles authentication loading state
- ✅ **Save Loading**: Shows loading during save operations

4. **Enhanced Error Handling:**
- ✅ **Database Errors**: Proper error catching and user notifications
- ✅ **Authentication**: Redirects to login if not authenticated
- ✅ **Validation**: Form validation with toast messages

## 📋 Database Schema Overview

### Core Tables

1. **profiles** - Extended user information
   - Links to `auth.users` 
   - Stores academic info (year, semester, college)
   - Personal details (bio, phone, social links)

2. **skills & user_skills** - Programming skills management
   - Master list of available skills
   - User-skill relationships with proficiency levels

3. **interests & user_interests** - Career interests
   - Master list of career paths
   - User interest priorities

4. **courses** - Course catalog
   - Course information and metadata
   - Support for free/paid courses

5. **user_progress** - Learning progress tracking
   - Course completion percentages
   - Access timestamps

6. **quizzes & quiz_attempts** - Assessment system
   - Quiz definitions
   - User attempt tracking with scores

7. **notifications** - User notification system
   - In-app notifications
   - Read/unread status tracking

### Security Features

- **Row Level Security (RLS)** enabled on all user tables
- Users can only access their own data
- Public read access for reference data (skills, interests, courses)
- Automatic profile creation on user signup

### Performance Features

- **Indexes** on frequently queried columns
- **Views** for complex queries (user_profile_complete, user_course_dashboard)
- **Triggers** for automatic timestamp updates
- **Generated columns** for computed values

## 🔧 Integration Steps

### 1. Install Required Dependencies

```bash
npm install @supabase/supabase-js react-toastify
```

### 2. Update Your Components

#### Profile Component Integration
```javascript
// Add these imports to your Profile component
import { 
  getUserProfile, 
  upsertUserProfile, 
  updateUserSkills, 
  updateUserInterests,
  getAvailableSkills,
  getAvailableInterests 
} from '../../lib/database'
```

#### Complete Integration Done ✅

The Profile component now includes:

```javascript
// Complete data loading with proper error handling
useEffect(() => {
  const loadInitialData = async () => {
    if (!user?.id) return
    setInitialLoading(true)
    
    try {
      // Load all data in parallel for better performance
      const [skillsResult, interestsResult, profileResult] = await Promise.all([
        getAvailableSkills(),
        getAvailableInterests(),
        getUserProfile(user.id)
      ])

      // Set available options from database
      if (skillsResult.data) {
        setAvailableSkills(skillsResult.data.map(skill => skill.name))
      }
      
      if (interestsResult.data) {
        setAvailableInterests(interestsResult.data.map(interest => interest.name))
      }

      // Handle existing vs new profile
      if (profileResult.data && profileResult.data.year) {
        // Existing profile - populate data
        setProfileData({
          fullName: profileResult.data.full_name || '',
          email: profileResult.data.email || '',
          year: profileResult.data.year?.toString() || '',
          semester: profileResult.data.semester?.toString() || '',
          college: profileResult.data.college || '',
          customCollege: profileResult.data.custom_college || '',
          skills: profileResult.data.skills?.map(s => s.name) || [],
          interests: profileResult.data.interests?.map(i => i.name) || []
        })
        setIsFirstTime(false)
      } else {
        // New profile - start in edit mode
        setIsEditing(true)
        setIsFirstTime(true)
      }
      
    } catch (error) {
      console.error('Error loading profile data:', error)
      toast.error('Error loading profile data')
    } finally {
      setInitialLoading(false)
    }
  }

  loadInitialData()
}, [user])
```

### 3. Environment Variables

Make sure your `.env` file has the correct Supabase configuration:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🎯 Next Steps

1. **Run the schema** in your Supabase dashboard
2. **Update the Profile component** to use database functions
3. **Test the profile creation/editing flow**
4. **Implement course progress tracking** (optional)
5. **Add notification system** (optional)

## 🔍 Verification Checklist

- [ ] Schema executed successfully in Supabase
- [ ] All tables visible in Table Editor
- [ ] RLS policies are active
- [ ] Profile creation works on user signup
- [ ] Profile editing saves to database
- [ ] Skills and interests are properly linked
- [ ] No console errors in browser

## 🚨 Common Issues & Solutions

### Issue: RLS prevents data access
**Solution:** Make sure you're authenticated and the policies are correctly set up.

### Issue: Skills/Interests not saving
**Solution:** Check that the skill/interest names match exactly with the database records.

### Issue: Profile not created on signup
**Solution:** Verify the trigger `on_auth_user_created` is active.

## 📞 Support

If you encounter any issues:
1. Check the browser console for errors
2. Verify the Supabase logs in the dashboard
3. Ensure all environment variables are correct
4. Test with a fresh user account

---

This schema follows best practices for:
- ✅ **Security** (RLS policies)
- ✅ **Performance** (Proper indexing)
- ✅ **Scalability** (Normalized design)
- ✅ **Maintainability** (Clear documentation)
- ✅ **Flexibility** (Extensible structure)