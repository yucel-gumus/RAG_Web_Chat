import React, { useId } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  className = '',
  id,
  ...props
}) => {
  const reactId = useId();
  const inputId = id || reactId;

  const inputClasses = `
    block w-full px-4 py-2.5 bg-[#FFF7ED] text-[#2D1D19] border rounded-xl shadow-xs transition-all duration-200
    placeholder:text-[#856761] text-sm
    focus:outline-none focus:ring-2 focus:ring-[#9BCEC1] focus:border-[#9BCEC1]
    ${error
      ? 'border-[#E69B8B] text-[#2D1D19] focus:ring-[#E69B8B]'
      : 'border-[#EFA696]'
    }
    disabled:opacity-60 disabled:cursor-not-allowed
    ${className}
  `;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold uppercase tracking-wider text-[#5D433E] mb-1.5"
        >
          {label}
        </label>
      )}

      <input
        id={inputId}
        className={inputClasses}
        {...props}
      />

      {error && (
        <p className="mt-1.5 text-xs font-medium text-[#2D1D19] bg-[#E69B8B]/30 p-2 rounded-lg border border-[#E69B8B]" role="alert">
          {error}
        </p>
      )}

      {helperText && !error && (
        <p className="mt-1.5 text-xs text-[#5D433E]">
          {helperText}
        </p>
      )}
    </div>
  );
};

export default Input;