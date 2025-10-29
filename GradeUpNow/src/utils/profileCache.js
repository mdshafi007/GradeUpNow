// Profile caching utility for offline support and performance
class ProfileCache {
  constructor() {
    this.CACHE_KEY = 'gradeupnow_profile_cache';
    this.CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  }

  set(uid, profile) {
    try {
      const cacheData = {
        uid,
        profile,
        timestamp: Date.now()
      };
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Failed to cache profile:', error);
    }
  }

  get(uid) {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      if (!cached) return null;

      const { uid: cachedUid, profile, timestamp } = JSON.parse(cached);
      
      // Check if cache is valid and for the correct user
      if (cachedUid !== uid || Date.now() - timestamp > this.CACHE_DURATION) {
        this.clear();
        return null;
      }

      return profile;
    } catch (error) {
      console.warn('Failed to get cached profile:', error);
      this.clear();
      return null;
    }
  }

  clear() {
    try {
      localStorage.removeItem(this.CACHE_KEY);
    } catch (error) {
      console.warn('Failed to clear profile cache:', error);
    }
  }

  isValid(uid) {
    const cached = this.get(uid);
    return cached !== null;
  }
}

export default new ProfileCache();