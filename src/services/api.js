// API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.PROD ? 'https://gradeupnow.onrender.com/api' : 'http://localhost:5000/api');

// Helper function to get Firebase ID token
const getAuthToken = async () => {
  try {
    const { auth } = await import('../firebase/config');
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }
    return await user.getIdToken();
  } catch (error) {
    console.error('Error getting auth token:', error);
    throw error;
  }
};

// Generic API request function
const apiRequest = async (endpoint, options = {}) => {
  try {
    const token = await getAuthToken();
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
};

// User Profile API
export const userAPI = {
  // Get user profile
  getProfile: async () => {
    return apiRequest('/users/profile');
  },

  // Create or update user profile
  createOrUpdateProfile: async (profileData) => {
    return apiRequest('/users/profile', {
      method: 'POST',
      body: JSON.stringify(profileData),
    });
  },

  // Update specific profile fields
  updateProfile: async (profileData) => {
    return apiRequest('/users/profile', {
      method: 'PATCH',
      body: JSON.stringify(profileData),
    });
  },

  // Update profile setup step
  updateSetupStep: async (step, completed = false) => {
    return apiRequest('/users/profile/setup-step', {
      method: 'PATCH',
      body: JSON.stringify({ step, completed }),
    });
  },

  // Get profile statistics
  getProfileStats: async () => {
    return apiRequest('/users/profile/stats');
  },

  // Delete profile
  deleteProfile: async () => {
    return apiRequest('/users/profile', {
      method: 'DELETE',
    });
  },
};

// Notes API
export const notesAPI = {
  // Get all notes with optional filters
  getNotes: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(v => queryParams.append(key, v));
        } else {
          queryParams.append(key, value);
        }
      }
    });
    
    const queryString = queryParams.toString();
    return apiRequest(`/notes${queryString ? `?${queryString}` : ''}`);
  },

  // Search notes
  searchNotes: async (searchTerm, page = 1, limit = 20) => {
    const queryParams = new URLSearchParams({
      q: searchTerm,
      page: page.toString(),
      limit: limit.toString(),
    });
    return apiRequest(`/notes/search?${queryParams.toString()}`);
  },

  // Get specific note
  getNote: async (noteId) => {
    return apiRequest(`/notes/${noteId}`);
  },

  // Create new note
  createNote: async (noteData) => {
    return apiRequest('/notes', {
      method: 'POST',
      body: JSON.stringify(noteData),
    });
  },

  // Update note
  updateNote: async (noteId, noteData) => {
    return apiRequest(`/notes/${noteId}`, {
      method: 'PUT',
      body: JSON.stringify(noteData),
    });
  },

  // Partially update note
  patchNote: async (noteId, updates) => {
    return apiRequest(`/notes/${noteId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  // Toggle archive status
  toggleArchive: async (noteId) => {
    return apiRequest(`/notes/${noteId}/archive`, {
      method: 'PATCH',
    });
  },

  // Toggle favorite status
  toggleFavorite: async (noteId) => {
    return apiRequest(`/notes/${noteId}/favorite`, {
      method: 'PATCH',
    });
  },

  // Add study time
  addStudyTime: async (noteId, minutes) => {
    return apiRequest(`/notes/${noteId}/study-time`, {
      method: 'PATCH',
      body: JSON.stringify({ minutes }),
    });
  },

  // Delete note
  deleteNote: async (noteId) => {
    return apiRequest(`/notes/${noteId}`, {
      method: 'DELETE',
    });
  },

  // Bulk delete notes
  bulkDeleteNotes: async (noteIds) => {
    return apiRequest('/notes/bulk/delete', {
      method: 'DELETE',
      body: JSON.stringify({ noteIds }),
    });
  },

  // Get note statistics
  getNotesStats: async () => {
    return apiRequest('/notes/stats/overview');
  },
};

// Progress API
export const progressAPI = {
  // Get user progress
  getProgress: async () => {
    return apiRequest('/progress');
  },

  // Update course progress
  updateCourseProgress: async (courseId, progressData) => {
    return apiRequest(`/progress/course/${courseId}`, {
      method: 'POST',
      body: JSON.stringify(progressData),
    });
  },

  // Add completed chapter
  addCompletedChapter: async (courseId, chapterData) => {
    return apiRequest(`/progress/course/${courseId}/chapter`, {
      method: 'POST',
      body: JSON.stringify(chapterData),
    });
  },

  // Add quiz score
  addQuizScore: async (courseId, quizData) => {
    return apiRequest(`/progress/course/${courseId}/quiz`, {
      method: 'POST',
      body: JSON.stringify(quizData),
    });
  },

  // Update daily activity
  updateDailyActivity: async (activityData) => {
    return apiRequest('/progress/daily-activity', {
      method: 'POST',
      body: JSON.stringify(activityData),
    });
  },

  // Add achievement
  addAchievement: async (achievementData) => {
    return apiRequest('/progress/achievements', {
      method: 'POST',
      body: JSON.stringify(achievementData),
    });
  },

  // Get progress analytics
  getAnalytics: async () => {
    return apiRequest('/progress/analytics');
  },

  // Get course-specific progress
  getCourseProgress: async (courseId) => {
    return apiRequest(`/progress/course/${courseId}`);
  },
};

// Health check
export const healthAPI = {
  checkHealth: async () => {
    try {
      const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  },
};

// Error handler for components
export const handleAPIError = (error, defaultMessage = 'An error occurred') => {
  console.error('API Error:', error);
  
  if (error.message) {
    return error.message;
  }
  
  return defaultMessage;
};

// Utility function to check if API is available
export const checkAPIConnection = async () => {
  try {
    await healthAPI.checkHealth();
    return true;
  } catch (error) {
    console.warn('API connection check failed:', error);
    return false;
  }
};

export default {
  userAPI,
  notesAPI,
  progressAPI,
  healthAPI,
  handleAPIError,
  checkAPIConnection,
};
