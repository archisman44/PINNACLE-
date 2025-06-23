
import React from 'react';

interface TextInputAreaProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const TextInputArea: React.FC<TextInputAreaProps> = ({
  value,
  onChange,
  placeholder = "Type here...",
  disabled = false,
}) => {
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      rows={6}
      className={`
        w-full p-4 
        bg-gray-700 bg-opacity-50 
        border-2 border-gray-600 
        rounded-lg 
        text-gray-200 
        focus:ring-2 focus:ring-purple-500 focus:border-purple-500 
        transition-colors duration-200 ease-in-out 
        resize-none
        placeholder-gray-500
        text-base
        ${disabled ? 'cursor-not-allowed opacity-70' : ''}
      `}
    />
  );
};
