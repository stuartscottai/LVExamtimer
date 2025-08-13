import React from 'react';

interface DropdownProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder: string;
  className?: string;
  id?: string;
  'aria-label'?: string;
}

const Dropdown: React.FC<DropdownProps> = ({
  options,
  value,
  onChange,
  disabled = false,
  placeholder,
  className = '',
  id,
  'aria-label': ariaLabel
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(event.target.value);
  };

  return (
    <select
      id={id}
      value={value}
      onChange={handleChange}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`
        w-full px-4 py-3 border border-slate-300 rounded-lg
        bg-white text-slate-gray font-medium
        focus:outline-none focus:ring-2 focus:ring-cambridge-blue focus:border-cambridge-blue
        hover:border-slate-400 transition-colors duration-150
        disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed
        disabled:border-slate-200 disabled:hover:border-slate-200
        ${className}
      `}
    >
      <option value="" disabled>
        {placeholder}
      </option>
      {options.map((option, index) => (
        <option key={index} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
};

export default Dropdown;