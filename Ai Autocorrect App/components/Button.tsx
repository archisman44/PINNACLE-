
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  isLoading = false,
  disabled,
  className,
  ...props
}) => {
  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      className={`
        px-8 py-3 
        bg-gradient-to-r from-purple-600 to-pink-600 
        hover:from-purple-700 hover:to-pink-700 
        text-white font-semibold 
        rounded-lg 
        shadow-md hover:shadow-lg
        focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75
        transition-all duration-300 ease-in-out
        transform hover:scale-105
        flex items-center justify-center
        min-w-[180px] 
        ${disabled || isLoading ? 'opacity-60 cursor-not-allowed' : ''}
        ${className || ''}
      `}
    >
      {children}
    </button>
  );
};
