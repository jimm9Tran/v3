import React from 'react';

const EmptyState = ({ 
  icon: Icon, 
  title, 
  description, 
  actionText, 
  onAction,
  showAction = false 
}) => {
  return (
    <div className="card text-center py-12">
      {Icon && (
        <Icon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
      )}
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {title}
      </h3>
      <p className="text-gray-500 mb-6">
        {description}
      </p>
      {showAction && actionText && onAction && (
        <button
          onClick={onAction}
          className="btn btn-primary inline-flex items-center space-x-2"
        >
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
};

export default EmptyState; 