import mongoose from 'mongoose';

const userProgressSchema = new mongoose.Schema({
  // User reference
  userId: {
    type: String, // Firebase UID
    required: true,
    index: true,
  },
  userEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  
  // Course progress
  courseProgress: [{
    courseId: {
      type: String,
      required: true,
    },
    courseName: {
      type: String,
      required: true,
    },
    
    // Overall progress
    overallProgress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    status: {
      type: String,
      enum: ['not-started', 'in-progress', 'completed', 'paused'],
      default: 'not-started',
    },
    
    // Chapter/Lesson progress
    chaptersCompleted: [{
      chapterId: String,
      chapterName: String,
      completedAt: { type: Date, default: Date.now },
      score: Number, // 0-100
      timeSpent: Number, // in minutes
    }],
    
    // Quiz/Assessment scores
    quizScores: [{
      quizId: String,
      quizName: String,
      score: Number, // 0-100
      totalQuestions: Number,
      correctAnswers: Number,
      attemptedAt: { type: Date, default: Date.now },
      timeSpent: Number, // in minutes
    }],
    
    // Time tracking
    totalTimeSpent: {
      type: Number, // in minutes
      default: 0,
    },
    averageSessionTime: {
      type: Number, // in minutes
      default: 0,
    },
    
    // Learning streaks
    currentStreak: {
      type: Number,
      default: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
    },
    lastStudyDate: {
      type: Date,
      default: Date.now,
    },
    
    // Difficulty and performance
    difficultyRating: {
      type: Number,
      min: 1,
      max: 5,
    },
    averageScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    
    // Course metadata
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
    lastAccessedAt: {
      type: Date,
      default: Date.now,
    },
    
    // Bookmarks and notes
    bookmarks: [{
      chapterId: String,
      chapterName: String,
      sectionId: String,
      sectionName: String,
      note: String,
      bookmarkedAt: { type: Date, default: Date.now },
    }],
  }],
  
  // Daily activity tracking
  dailyActivity: [{
    date: {
      type: Date,
      required: true,
    },
    minutesStudied: {
      type: Number,
      default: 0,
    },
    lessonsCompleted: {
      type: Number,
      default: 0,
    },
    notesCreated: {
      type: Number,
      default: 0,
    },
    quizzesTaken: {
      type: Number,
      default: 0,
    },
    averageScore: {
      type: Number,
      min: 0,
      max: 100,
    },
  }],
  
  // Overall statistics
  overallStats: {
    totalCoursesEnrolled: {
      type: Number,
      default: 0,
    },
    totalCoursesCompleted: {
      type: Number,
      default: 0,
    },
    totalLessonsCompleted: {
      type: Number,
      default: 0,
    },
    totalTimeSpent: {
      type: Number, // in minutes
      default: 0,
    },
    totalNotesCreated: {
      type: Number,
      default: 0,
    },
    totalQuizzesTaken: {
      type: Number,
      default: 0,
    },
    averageQuizScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    currentStreak: {
      type: Number,
      default: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
    },
  },
  
  // Learning preferences and analytics
  learningAnalytics: {
    preferredStudyTimes: [{
      hour: Number, // 0-23
      count: Number,
    }],
    strongSubjects: [{
      subject: String,
      averageScore: Number,
    }],
    improvementAreas: [{
      subject: String,
      averageScore: Number,
      recommendation: String,
    }],
    learningVelocity: {
      type: Number, // lessons per week
      default: 0,
    },
  },
  
  // Achievements and milestones
  achievements: [{
    achievementId: String,
    name: String,
    description: String,
    iconUrl: String,
    unlockedAt: { type: Date, default: Date.now },
    category: {
      type: String,
      enum: ['time', 'streak', 'completion', 'score', 'special'],
    },
  }],
  
  // Goals and targets
  goals: [{
    goalId: String,
    type: {
      type: String,
      enum: ['daily-time', 'weekly-lessons', 'course-completion', 'streak', 'score'],
    },
    target: Number,
    current: Number,
    deadline: Date,
    status: {
      type: String,
      enum: ['active', 'completed', 'paused', 'failed'],
      default: 'active',
    },
    createdAt: { type: Date, default: Date.now },
    completedAt: Date,
  }],
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Create indexes for better performance
userProgressSchema.index({ userId: 1 });
userProgressSchema.index({ userId: 1, 'courseProgress.courseId': 1 });
userProgressSchema.index({ userId: 1, 'dailyActivity.date': -1 });
userProgressSchema.index({ 'courseProgress.lastAccessedAt': -1 });

// Virtual for completion rate
userProgressSchema.virtual('overallCompletionRate').get(function() {
  if (this.overallStats.totalCoursesEnrolled === 0) return 0;
  return Math.round((this.overallStats.totalCoursesCompleted / this.overallStats.totalCoursesEnrolled) * 100);
});

// Method to update daily activity
userProgressSchema.methods.updateDailyActivity = function(activityData) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const existingActivity = this.dailyActivity.find(
    activity => activity.date.getTime() === today.getTime()
  );
  
  if (existingActivity) {
    // Update existing activity
    Object.assign(existingActivity, activityData);
  } else {
    // Create new activity entry
    this.dailyActivity.push({
      date: today,
      ...activityData,
    });
  }
  
  return this.save();
};

// Method to update course progress
userProgressSchema.methods.updateCourseProgress = function(courseId, progressData) {
  const courseIndex = this.courseProgress.findIndex(
    course => course.courseId === courseId
  );
  
  if (courseIndex !== -1) {
    // Update existing course progress
    Object.assign(this.courseProgress[courseIndex], progressData);
  } else {
    // Add new course progress
    this.courseProgress.push({
      courseId,
      ...progressData,
    });
  }
  
  return this.save();
};

// Method to add achievement
userProgressSchema.methods.addAchievement = function(achievementData) {
  // Check if achievement already exists
  const existingAchievement = this.achievements.find(
    achievement => achievement.achievementId === achievementData.achievementId
  );
  
  if (!existingAchievement) {
    this.achievements.push(achievementData);
    return this.save();
  }
  
  return Promise.resolve(this);
};

// Method to update streak
userProgressSchema.methods.updateStreak = function() {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const todayActivity = this.dailyActivity.find(activity => {
    const activityDate = new Date(activity.date);
    return activityDate.toDateString() === today.toDateString();
  });
  
  const yesterdayActivity = this.dailyActivity.find(activity => {
    const activityDate = new Date(activity.date);
    return activityDate.toDateString() === yesterday.toDateString();
  });
  
  if (todayActivity && todayActivity.minutesStudied > 0) {
    if (yesterdayActivity && yesterdayActivity.minutesStudied > 0) {
      // Continue streak
      this.overallStats.currentStreak += 1;
    } else {
      // Start new streak
      this.overallStats.currentStreak = 1;
    }
    
    // Update longest streak if current is higher
    if (this.overallStats.currentStreak > this.overallStats.longestStreak) {
      this.overallStats.longestStreak = this.overallStats.currentStreak;
    }
  }
  
  return this.save();
};

// Static method to find user progress
userProgressSchema.statics.findByUserId = function(userId) {
  return this.findOne({ userId });
};

export default mongoose.model('UserProgress', userProgressSchema);
