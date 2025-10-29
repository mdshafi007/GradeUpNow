# LMS Backend - MongoDB Migration

Complete backend implementation for the Learning Management System (College Portal) using MongoDB, Express, and JWT authentication.

## 📁 Structure

```
backend/src/lms/
├── models/           # MongoDB schemas
│   ├── Admin.js
│   ├── Student.js
│   ├── Assessment.js
│   ├── QuizQuestion.js
│   ├── CodingProblem.js
│   ├── StudentAttempt.js
│   ├── CodeSubmission.js
│   ├── StudentAnswer.js
│   └── index.js
├── controllers/      # Business logic
│   ├── authController.js
│   ├── studentController.js
│   ├── assessmentController.js
│   ├── quizController.js
│   ├── codingController.js
│   └── index.js
├── routes/          # API endpoints
│   ├── auth.js
│   ├── admin.js
│   ├── student.js
│   └── index.js
├── middleware/      # Authentication & authorization
│   ├── auth.js
│   ├── isAdmin.js
│   ├── isStudent.js
│   └── index.js
└── index.js
```

## 🔐 Authentication

### MongoDB-based Auth (No Google OAuth)
- **Password Hashing**: bcrypt with 10 salt rounds
- **JWT Tokens**: 7-day expiry
- **Role-based Access**: Admin, Super Admin, Student

### Login Flow
```javascript
POST /api/lms/auth/login
Body: {
  "email": "admin@example.com",
  "password": "password123",
  "role": "admin" // or "student"
}

Response: {
  "token": "jwt_token_here",
  "user": { /* user data */ },
  "role": "admin"
}
```

## 📊 Database Models

### 1. Admin (LMSAdmin)
- Email, password (hashed), name, college, branch
- Role: 'admin' or 'super_admin'
- Methods: `comparePassword()`, `toPublicJSON()`, `findByCredentials()`

### 2. Student (LMSStudent)
- Email, password (hashed), registrationNumber, name
- College, branch, section, year, semester
- CreatedBy: Reference to Admin
- Methods: Same as Admin

### 3. Assessment (LMSAssessment)
- Admin reference, college, branch, name, type (Quiz/Coding)
- Start/end dates, duration, isActive
- Settings: allowTabSwitch, maxTabSwitches, shuffleQuestions, showResultsImmediately
- Virtuals: `isCurrentlyActive`, `isUpcoming`, `isExpired`
- Methods: `getStatus()`

### 4. QuizQuestion (LMSQuizQuestion)
- Assessment reference, questionNumber, question, options (A-D)
- CorrectAnswer, marks

### 5. CodingProblem (LMSCodingProblem)
- Assessment reference, problemNumber, title, description
- Input/output formats, constraints, sample I/O
- Test cases (hidden), marks, difficulty
- Time/memory limits for Judge0

### 6. StudentAttempt (LMSStudentAttempt)
- Student & assessment references, start/end/submit times
- Status: 'in_progress', 'submitted', 'auto_submitted', 'expired'
- Score, totalMarks, percentage, tabSwitches
- References to answers/code submissions
- Virtuals: `durationMinutes`, `isActive`, `isCompleted`

### 7. CodeSubmission (LMSCodeSubmission)
- Student, assessment, attempt, problem references
- Code, language, languageId (Judge0)
- Status: 'pending', 'accepted', 'wrong_answer', etc.
- Test results, execution time, memory usage
- Score calculation based on passed test cases

### 8. StudentAnswer (LMSStudentAnswer)
- Attempt & question references, selectedAnswer
- isCorrect, marksAwarded, timeTaken
- Methods: `checkAnswer()`, static `calculateScore()`

## 🛣️ API Routes

### Authentication Routes (`/api/lms/auth`)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/login` | Public | Login admin/student |
| GET | `/me` | Private | Get current user |
| POST | `/logout` | Private | Logout |

### Admin Routes (`/api/lms/admin`)
All routes require `authMiddleware` + `isAdmin`

#### Student Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/students` | Get all students (with filters) |
| POST | `/students` | Create student |
| POST | `/students/bulk` | Bulk create students |
| GET | `/students/:id` | Get student by ID |
| PUT | `/students/:id` | Update student |
| DELETE | `/students/:id` | Deactivate student |
| PUT | `/students/:id/activate` | Activate student |
| PUT | `/students/:id/reset-password` | Reset password |

#### Assessment Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/assessments` | Get all assessments (with filters) |
| POST | `/assessments` | Create assessment |
| GET | `/assessments/:id` | Get assessment by ID |
| PUT | `/assessments/:id` | Update assessment |
| DELETE | `/assessments/:id` | Delete assessment |
| POST | `/assessments/:id/quiz-questions` | Add quiz questions |
| POST | `/assessments/:id/coding-problems` | Add coding problems |
| GET | `/assessments/:id/analytics` | Get analytics |

### Student Routes (`/api/lms/student`)
All routes require `authMiddleware` + `isStudent`

#### Assessment Access
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/assessments` | Get available assessments |
| GET | `/assessments/:id` | Get assessment details |
| GET | `/attempts` | Get attempt history |

#### Quiz Taking
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/assessments/:id/start-quiz` | Start quiz attempt |
| POST | `/attempts/:attemptId/answer` | Submit answer |
| POST | `/attempts/:attemptId/submit` | Submit complete quiz |
| POST | `/attempts/:attemptId/tab-switch` | Track tab switch |

#### Coding Tests
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/assessments/:id/coding-problems` | Get problems |
| POST | `/coding/submit` | Submit code |
| GET | `/coding/submissions/:id` | Get submission status |
| GET | `/coding/problems/:problemId/submissions` | Get all submissions |
| POST | `/coding/attempts/:attemptId/submit` | Submit assessment |

## 🔧 Environment Variables

Add to `.env`:

```bash
# LMS JWT Configuration
JWT_SECRET=your_very_secure_random_secret_key_here

# Judge0 Configuration (for coding assessments)
JUDGE0_API_URL=https://judge0-ce.p.rapidapi.com
JUDGE0_API_KEY=your_judge0_rapidapi_key
```

## 🚀 Features

### ✅ Security
- Bcrypt password hashing (10 rounds)
- JWT token authentication
- Role-based access control
- Password field excluded from queries (`select: false`)

### ✅ Performance
- Compound indexes for complex queries
- Single-field indexes for frequent lookups
- Efficient population of references
- Optimized aggregation pipelines

### ✅ Business Logic
- Automatic score calculation
- Tab switch tracking with auto-submission
- Assessment status computation (active/upcoming/expired)
- Best submission tracking for coding problems
- Real-time test case execution with Judge0

### ✅ Error Handling
- Comprehensive validation
- Detailed error messages
- Proper HTTP status codes
- Try-catch blocks in all async functions

## 📝 Usage Examples

### 1. Admin Creates Students (Bulk)
```javascript
POST /api/lms/admin/students/bulk
Headers: { Authorization: "Bearer <admin_token>" }
Body: {
  "students": [
    {
      "email": "student1@college.edu",
      "password": "initial123",
      "registrationNumber": "2024001",
      "name": "John Doe",
      "college": "XYZ College",
      "branch": "Computer Science",
      "section": "A",
      "year": "2",
      "semester": "4"
    },
    // ... more students
  ]
}
```

### 2. Admin Creates Quiz Assessment
```javascript
POST /api/lms/admin/assessments
Headers: { Authorization: "Bearer <admin_token>" }
Body: {
  "college": "XYZ College",
  "branch": "Computer Science",
  "name": "DBMS Mid-Term Quiz",
  "type": "Quiz",
  "description": "Mid-term assessment for DBMS",
  "startDate": "2025-11-01T10:00:00Z",
  "endDate": "2025-11-01T12:00:00Z",
  "duration": 60,
  "settings": {
    "allowTabSwitch": false,
    "maxTabSwitches": 3,
    "shuffleQuestions": true,
    "showResultsImmediately": true
  }
}
```

### 3. Admin Adds Questions to Quiz
```javascript
POST /api/lms/admin/assessments/:id/quiz-questions
Headers: { Authorization: "Bearer <admin_token>" }
Body: {
  "questions": [
    {
      "questionNumber": 1,
      "question": "What is ACID in databases?",
      "options": {
        "A": "A data structure",
        "B": "A set of database properties",
        "C": "A query language",
        "D": "A storage engine"
      },
      "correctAnswer": "B",
      "marks": 2
    },
    // ... more questions
  ]
}
```

### 4. Student Starts Quiz
```javascript
POST /api/lms/student/assessments/:id/start-quiz
Headers: { Authorization: "Bearer <student_token>" }

Response: {
  "attempt": { /* attempt object */ },
  "questions": [ /* questions without correct answers */ ]
}
```

### 5. Student Submits Answer
```javascript
POST /api/lms/student/attempts/:attemptId/answer
Headers: { Authorization: "Bearer <student_token>" }
Body: {
  "questionId": "67890...",
  "selectedAnswer": "B"
}
```

### 6. Student Submits Complete Quiz
```javascript
POST /api/lms/student/attempts/:attemptId/submit
Headers: { Authorization: "Bearer <student_token>" }

Response: {
  "results": {
    "score": 18,
    "totalMarks": 20,
    "percentage": 90,
    "correctAnswers": 9,
    "totalQuestions": 10,
    "answers": [ /* detailed results */ ]
  }
}
```

### 7. Student Submits Code
```javascript
POST /api/lms/student/coding/submit
Headers: { Authorization: "Bearer <student_token>" }
Body: {
  "attemptId": "12345...",
  "problemId": "67890...",
  "code": "print('Hello World')",
  "language": "python"
}

Response: {
  "submissionId": "abc123..."
}
```

### 8. Check Code Submission Status
```javascript
GET /api/lms/student/coding/submissions/:id
Headers: { Authorization: "Bearer <student_token>" }

Response: {
  "submission": {
    "status": "accepted",
    "testResults": [
      {
        "testCaseNumber": 1,
        "passed": true,
        "executionTime": 0.023,
        "memory": 5120
      }
    ],
    "passedTestCases": 3,
    "totalTestCases": 3,
    "score": 10
  }
}
```

## 🔄 Migration from Supabase

### What Changed
- ✅ Auth: Supabase OAuth → MongoDB + bcrypt + JWT
- ✅ Database: Supabase tables → MongoDB collections
- ✅ Queries: Supabase client → Mongoose ODM
- ✅ RLS policies → Middleware authorization
- ✅ Supabase functions → Express controllers

### What Stayed Same
- ✅ UI/UX (no visual changes)
- ✅ Features (all functionality preserved)
- ✅ Business logic (same flows)
- ✅ Judge0 integration (coding tests)

## 📦 Dependencies

Make sure these are in `package.json`:

```json
{
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^7.5.0",
    "axios": "^1.6.0"
  }
}
```

## 🧪 Testing

### Test Admin Login
```bash
curl -X POST http://localhost:5000/api/lms/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@college.edu",
    "password": "admin123",
    "role": "admin"
  }'
```

### Test Get Current User
```bash
curl http://localhost:5000/api/lms/auth/me \
  -H "Authorization: Bearer <token>"
```

## 📊 Next Steps

1. ✅ Backend setup complete (models, controllers, routes, middleware)
2. 🔄 Frontend migration (update 14 components to use new API)
3. ⏳ Testing & validation
4. ⏳ Deploy & monitor

## 🎯 Production Considerations

- [ ] Generate strong JWT_SECRET (use crypto.randomBytes(64).toString('hex'))
- [ ] Set up proper logging (Winston/Morgan)
- [ ] Add rate limiting (express-rate-limit)
- [ ] Implement API versioning
- [ ] Add request validation (express-validator)
- [ ] Set up monitoring (PM2/New Relic)
- [ ] Configure HTTPS/SSL
- [ ] Set up database backups
- [ ] Add health check endpoints
- [ ] Implement graceful shutdown

---

**Created**: October 2025  
**Status**: Backend Complete ✅  
**Next**: Frontend Migration
