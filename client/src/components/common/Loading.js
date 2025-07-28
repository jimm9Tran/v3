import React from 'react';

const Loading = ({ size = 'md', text = 'Đang tải...' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className={`animate-spin rounded-full border-b-2 border-primary-600 ${sizeClasses[size]}`}></div>
      {text && (
        <p className="text-gray-500 mt-4 text-sm">{text}</p>
      )}
    </div>
  );
};

export default Loading; 