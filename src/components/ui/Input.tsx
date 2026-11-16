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
    block w-full px-4 py-2.5 bg-[#F5F9F5] text-[#253341] border rounded-xl shadow-xs transition-all duration-200
    placeholder:text-[#3E5164]/75 text-sm
    focus:outline-none focus:ring-2 focus:ring-[#EC7D55] focus:border-[#EC7D55]
    ${error
      ? 'border-[#AB421C] text-[#253341] focus:ring-[#AB421C] focus:border-[#AB421C]'
      : 'border-[#BCC7D2]'
    }
    disabled:opacity-60 disabled:cursor-not-allowed
    ${className}
  `;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold uppercase tracking-wider text-[#3E5164] mb-1.5"
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
        <p className="mt-1.5 text-xs font-medium text-[#AB421C] bg-[#F2A488]/25 p-2 rounded-lg border border-[#AB421C]/60" role="alert">
          {error}
        </p>
      )}

      {helperText && !error && (
        <p className="mt-1.5 text-xs text-[#3E5164]">
          {helperText}
        </p>
      )}
    </div>
  );
};

export default Input;