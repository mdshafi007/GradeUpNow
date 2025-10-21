import React from 'react';

const LoadingSpinner = ({ size = 'default', text = 'Loading...', className = '' }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    default: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="flex flex-col items-center space-y-3">
        <div className={`${sizeClasses[size]} animate-spin`}>
          <svg className="w-full h-full text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4" 
              className="opacity-25"
            />
            <path 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              className="opacity-75"
            />
          </svg>
        </div>
        {text && (
          <p className="text-sm text-gray-600 font-medium">{text}</p>
        )}
      </div>
    </div>
  );
};

const LoadingScreen = ({ text = 'Loading your data...' }) => {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm mx-4">
        <LoadingSpinner size="large" text={text} />
      </div>
    </div>
  );
};

const LoadingCard = ({ text = 'Loading...', className = '' }) => {
  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      <LoadingSpinner text={text} />
    </div>
  );
};

const LoadingButton = ({ isLoading = false, children, className = '', ...props }) => {
  return (
    <button 
      className={`relative ${className} ${isLoading ? 'cursor-not-allowed opacity-70' : ''}`}
      disabled={isLoading}
      {...props}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <LoadingSpinner size="small" text="" />
        </div>
      )}
      <span className={isLoading ? 'opacity-0' : ''}>
        {children}
      </span>
    </button>
  );
};

export { LoadingSpinner, LoadingScreen, LoadingCard, LoadingButton };
export default LoadingSpinner;