# 🚨 Analytics Error Troubleshooting Guide

## Current Issue
The Quiz Analytics page is showing "Error Loading Analytics" with CORS and fetch errors in the browser console.

## 🔍 **Debugging Steps**

### 1. **Check Backend Server Status**
```bash
# Navigate to backend directory
cd "c:\Users\skmds\OneDrive\Desktop\New folder 13\gradeupnow_p\GradeUpNow\backend"

# Start the server
npm start
```

**Expected Output:**
```
🚀 Server running on port 5000
🗄️  Connected to MongoDB
🔥 Firebase Admin initialized successfully
🏥 Health Check: http://localhost:5000/health
```

### 2. **Test Server Connectivity**
Open these URLs in your browser:

**Health Check:**
- `http://localhost:5000/health`
- Should return: `{"success":true,"message":"Server is running"...}`

**Debug Endpoint:**
- `http://localhost:5000/api/debug/analytics/test123`
- Should return debug information

### 3. **Check Environment Variables**
In `backend/.env`, ensure you have:
```env
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/gradeupnow
PORT=5000
FRONTEND_URL=http://localhost:5173
CORS_ORIGIN=http://localhost:5173
```

### 4. **Frontend Environment Variables**
In `GradeUpNow/.env`, ensure you have:
```env
VITE_API_URL=http://localhost:5000
```

## 🛠️ **Implemented Fixes**

### 1. **Enhanced Error Handling**
- Added detailed console logging for API requests
- Better error messages with specific troubleshooting info
- Retry functionality with better UI

### 2. **Debugging Information**
- Request URL logging
- Response status and headers logging
- Token presence verification
- CORS error detection

### 3. **Improved UI**
- Enhanced error display with troubleshooting tips
- Retry and navigation buttons
- Expandable help section

## 🚀 **Testing the Fix**

### Step 1: Start Backend
```bash
cd backend
npm start
```

### Step 2: Start Frontend
```bash
cd GradeUpNow
npm run dev
```

### Step 3: Test Analytics
1. Log in as admin
2. Go to Quiz Management
3. Click "Report" on any quiz
4. Check browser console for debug logs

## 🔧 **Expected Debug Output**

In the browser console, you should see:
```
🔗 Making request to: http://localhost:5000/api/admin/quiz/[quizId]/analytics
🔑 Using token: Present
📡 Response status: 200 OK
📡 Response data: {success: true, ...}
```

## ❌ **Common Issues & Solutions**

### Issue 1: "Failed to fetch"
**Cause:** Backend server not running
**Solution:** Start backend with `npm start`

### Issue 2: CORS Policy Error
**Cause:** Frontend URL not in CORS whitelist
**Solution:** Check CORS configuration in `backend/server.js`

### Issue 3: 401/403 Authentication Error  
**Cause:** Invalid or expired Firebase token
**Solution:** Log out and log back in

### Issue 4: 404 Not Found
**Cause:** Wrong API endpoint URL
**Solution:** Verify route registration in `backend/server.js`

## 🎯 **API Endpoint Structure**

The analytics endpoint is structured as:
- **Route File:** `backend/routes/lmsQuiz.js` 
- **Route Definition:** `router.get('/:quizId/analytics', ...)`
- **Server Registration:** `app.use('/api/admin/quiz', lmsQuizRoutes)`
- **Final URL:** `/api/admin/quiz/:quizId/analytics`

## 📋 **Quick Checklist**

- [ ] Backend server running on port 5000
- [ ] Frontend running on port 5173  
- [ ] MongoDB connection successful
- [ ] Firebase Admin initialized
- [ ] CORS configured for localhost:5173
- [ ] Environment variables set correctly
- [ ] Admin user logged in with valid token
- [ ] Quiz ID exists in database

## 🔍 **Manual API Test**

You can test the API directly:

```bash
# Get a Firebase token from browser dev tools
# Then test with curl:

curl -X GET \
  "http://localhost:5000/api/admin/quiz/YOUR_QUIZ_ID/analytics" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"
```

## 📞 **Next Steps**

1. **Start both servers** following the steps above
2. **Check console logs** for detailed debug information  
3. **Test the health check** endpoint first
4. **Try the analytics** page again
5. **Report specific error messages** if issues persist

The enhanced error handling should now provide much clearer information about what's causing the issue!