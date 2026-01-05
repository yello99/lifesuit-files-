import React from 'react';

interface CardProps {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

const Card = ({ title, children, icon, className = '' }: CardProps): React.ReactNode => {
  return (
    <div className={`bg-brand-bg-light rounded-xl shadow-lg p-4 sm:p-6 ${className}`}>
      <div className="flex items-center mb-4">
        {icon && <div className="mr-3 text-brand-secondary">{icon}</div>}
        <h3 className="text-xl font-bold text-brand-text-light">{title}</h3>
      </div>
      <div className="text-brand-text-dark">
        {children}
      </div>
    </div>
  );
};

export default React.memo(Card);