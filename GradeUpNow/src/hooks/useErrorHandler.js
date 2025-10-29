import { useState, useCallback } from 'react';

export const useErrorHandler = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleError = useCallback((error) => {
    console.error('Error occurred:', error);
    
    // Parse different types of errors
    let errorMessage = 'Something went wrong. Please try again.';
    
    if (typeof error === 'string') {
      errorMessage = error;
    } else if (error?.message) {
      errorMessage = error.message;
    } else if (error?.response?.data?.message) {
      errorMessage = error.response.data.message;
    }
    
    setError(errorMessage);
    setIsLoading(false);
  }, []);

  const executeAsync = useCallback(async (asyncFunction, options = {}) => {
    const { onSuccess, onError, loadingMessage } = options;
    
    try {
      setError(null);
      setIsLoading(true);
      
      const result = await asyncFunction();
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (err) {
      handleError(err);
      
      if (onError) {
        onError(err);
      }
      
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  const retry = useCallback((asyncFunction, maxRetries = 3) => {
    let attempts = 0;
    
    const attemptFunction = async () => {
      try {
        attempts++;
        return await asyncFunction();
      } catch (error) {
        if (attempts < maxRetries) {
          console.log(`Attempt ${attempts} failed, retrying...`);
          return attemptFunction();
        }
        throw error;
      }
    };
    
    return executeAsync(attemptFunction);
  }, [executeAsync]);

  return {
    error,
    isLoading,
    clearError,
    handleError,
    executeAsync,
    retry
  };
};

export default useErrorHandler;