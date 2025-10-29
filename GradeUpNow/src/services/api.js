/**
 * API Service Layer
 * Connects React frontend to Node.js backend
 */

import axios from 'axios';
import { supabase } from '../lib/supabase';

// Base API URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000 // 10 second timeout (reduced from 30s)
});

// Request interceptor - Add JWT token
api.interceptors.request.use(
  async (config) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
      }
    } catch (error) {
      console.error('Error getting session:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle errors (simplified)
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    
    // If 401, redirect to login
    if (error.response?.status === 401) {
      console.warn('❌ Unauthorized - Session expired');
      window.location.href = '/login';
    }
    
    return Promise.reject(new Error(message));
  }
);

// Profile API
export const profileAPI = {
  getProfile: () => api.get('/profile'),
  upsertProfile: (data) => api.put('/profile', data),
  updateSkills: (skills) => api.patch('/profile/skills', { skills }),
  updateInterests: (interests) => api.patch('/profile/interests', { interests })
};

// Notes API
export const notesAPI = {
  // Categories
  getCategories: () => api.get('/notes/categories'),
  createCategory: (data) => api.post('/notes/categories', data),
  updateCategory: (id, data) => api.put(`/notes/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/notes/categories/${id}`),
  
  // Notes
  getNotes: (params = {}) => api.get('/notes', { params }),
  createNote: (data) => api.post('/notes', data),
  updateNote: (id, data) => api.put(`/notes/${id}`, data),
  deleteNote: (id) => api.delete(`/notes/${id}`),
  getNotesStats: () => api.get('/notes/stats')
};

// Progress API
export const progressAPI = {
  getAllCourses: () => api.get('/progress/courses'),
  initCourse: (data) => api.post('/progress/course/init', data),
  getCourseProgress: (courseId) => api.get(`/progress/course/${courseId}`),
  updatePosition: (courseId, data) => api.put(`/progress/course/${courseId}/position`, data),
  getCompletedLessons: (courseId) => api.get(`/progress/course/${courseId}/lessons`),
  markLessonComplete: (data) => api.post('/progress/lesson/complete', data)
};

// Practice API
export const practiceAPI = {
  getCategories: () => api.get('/practice/categories'),
  getTopics: (categoryId) => api.get(`/practice/categories/${categoryId}/topics`),
  getTopicDetails: (topicId) => api.get(`/practice/topics/${topicId}`),
  getQuestions: (topicId, params = {}) => api.get(`/practice/topics/${topicId}/questions`, { params }),
  submitQuiz: (topicId, answers) => api.post(`/practice/topics/${topicId}/submit`, { answers }),
  searchQuestions: (params) => api.get('/practice/search', { params })
};

// Health check
export const healthCheck = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL.replace('/api', '')}/health`);
    return response.data;
  } catch (error) {
    console.error('Health check failed:', error);
    return null;
  }
};

export default api;
