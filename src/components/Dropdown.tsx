import React, { useEffect, useRef, useState } from 'react';

interface DropdownProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder: string;
  className?: string;
  id?: string;
  submenuLabel?: string;
  submenuOptions?: string[];
  'aria-label'?: string;
}

const Chevron: React.FC<{ direction?: 'down' | 'right'; className?: string }> = ({
  direction = 'down',
  className = ''
}) => (
  <span
    aria-hidden="true"
    className={`
      inline-block h-2.5 w-2.5 shrink-0 border-b-2 border-r-2 border-slate-500
      ${direction === 'down' ? 'rotate-45' : '-rotate-45'}
      ${className}
    `}
  />
);

const Dropdown: React.FC<DropdownProps> = ({
  options,
  value,
  onChange,
  disabled = false,
  placeholder,
  className = '',
  id,
  submenuLabel,
  submenuOptions = [],
  'aria-label': ariaLabel
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasSubmenu = !!submenuLabel && submenuOptions.length > 0;

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
        setIsSubmenuOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [isOpen]);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(event.target.value);
  };

  const handleCustomSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
    setIsSubmenuOpen(false);
  };

  if (hasSubmenu) {
    return (
      <div ref={containerRef} className="relative">
        <button
          id={id}
          type="button"
          disabled={disabled}
          aria-label={ariaLabel}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          onClick={() => !disabled && setIsOpen(open => !open)}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              setIsOpen(false);
              setIsSubmenuOpen(false);
            }
          }}
          className={`
            w-full px-4 py-3 border border-slate-300 rounded-lg
            bg-white text-left text-slate-gray font-medium
            focus:outline-none focus:ring-2 focus:ring-cambridge-blue focus:border-cambridge-blue
            hover:border-slate-400 transition-colors duration-150
            disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed
            disabled:border-slate-200 disabled:hover:border-slate-200
            flex items-center justify-between gap-3
            ${className}
          `}
        >
          <span className={value ? 'text-slate-gray' : 'text-slate-500'}>
            {value || placeholder}
          </span>
          <Chevron direction="down" />
        </button>

        {isOpen && (
          <div
            role="listbox"
            aria-label={ariaLabel}
            onMouseLeave={() => setIsSubmenuOpen(false)}
            className="absolute left-0 top-full z-30 mt-1 w-full rounded-lg border border-slate-200 bg-white py-1 shadow-lg sm:w-80"
          >
            {options.map((option) => (
              <button
                key={option}
                type="button"
                role="option"
                aria-selected={value === option}
                onClick={() => handleCustomSelect(option)}
                className={`
                  block w-full px-4 py-2.5 text-left text-sm font-medium transition-colors
                  hover:bg-blue-50 focus:bg-blue-50 focus:outline-none
                  ${value === option ? 'bg-blue-50 text-blue-700' : 'text-slate-700'}
                `}
              >
                {option}
              </button>
            ))}

            <div
              className="relative"
              onMouseEnter={() => setIsSubmenuOpen(true)}
            >
              <button
                type="button"
                className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm font-semibold text-slate-700 transition-colors hover:bg-blue-50 focus:bg-blue-50 focus:outline-none"
                onClick={() => setIsSubmenuOpen(open => !open)}
                aria-haspopup="listbox"
                aria-expanded={isSubmenuOpen}
              >
                <span>{submenuLabel}</span>
                <Chevron direction="right" />
              </button>
            </div>

            <div
              role="listbox"
              aria-label={submenuLabel}
              className={`
                absolute left-0 bottom-full z-40 mb-1 w-full rounded-lg border border-slate-200 bg-white py-1 shadow-lg
                transition-all duration-150 ease-out
                sm:left-full sm:bottom-0 sm:mb-0 sm:ml-0 sm:min-w-[20rem] sm:origin-bottom-left
                ${isSubmenuOpen
                  ? 'pointer-events-auto translate-y-0 opacity-100'
                  : 'pointer-events-none translate-y-1 opacity-0'
                }
              `}
            >
              {submenuOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  role="option"
                  aria-selected={value === option}
                  onClick={() => handleCustomSelect(option)}
                  className={`
                    block w-full px-4 py-2.5 text-left text-sm font-medium transition-colors
                    hover:bg-blue-50 focus:bg-blue-50 focus:outline-none
                    ${value === option ? 'bg-blue-50 text-blue-700' : 'text-slate-700'}
                  `}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        aria-label={ariaLabel}
        className={`
          w-full appearance-none px-4 py-3 pr-10 border border-slate-300 rounded-lg
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
      <Chevron
        direction="down"
        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 border-slate-400"
      />
    </div>
  );
};

export default Dropdown;
