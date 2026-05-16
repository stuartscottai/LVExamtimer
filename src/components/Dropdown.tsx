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
  optionGroups?: Array<{
    label: string;
    options: string[];
  }>;
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
  optionGroups,
  'aria-label': ariaLabel
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openSubmenuLabel, setOpenSubmenuLabel] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const groups = optionGroups || (
    submenuLabel && submenuOptions.length > 0
      ? [{ label: submenuLabel, options: submenuOptions }]
      : undefined
  );
  const hasSubmenu = !!groups?.length;

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
        setOpenSubmenuLabel(null);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [isOpen]);

  const handleCustomSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
    setOpenSubmenuLabel(null);
  };

  const directOptions = hasSubmenu
    ? options.filter(option => !groups?.some(group => group.options.includes(option)))
    : options;
  const trailingGroup = groups?.find(group => group.label === 'Multiple Exams');
  const leadingGroups = trailingGroup
    ? groups?.filter(group => group.label !== trailingGroup.label)
    : groups;

  const renderGroupButton = (group: { label: string; options: string[] }) => {
    const isSubmenuOpen = openSubmenuLabel === group.label;
    const opensUp = group.label === 'Multiple Exams';

    return (
      <div
        key={group.label}
        className="relative"
        onMouseEnter={() => setOpenSubmenuLabel(group.label)}
      >
        <button
          type="button"
          className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm font-semibold text-slate-700 transition-colors hover:bg-blue-50 focus:bg-blue-50 focus:outline-none"
          onClick={() => setOpenSubmenuLabel(label => label === group.label ? null : group.label)}
          aria-haspopup="listbox"
          aria-expanded={isSubmenuOpen}
        >
          <span>{group.label}</span>
          <Chevron direction="right" />
        </button>

        <div
          role="listbox"
          aria-label={group.label}
          className={`
            absolute left-0 z-40 w-full rounded-lg border border-slate-200 bg-white shadow-lg
            transition-all duration-150 ease-out
            sm:left-[calc(100%-1px)] sm:ml-0 sm:min-w-[20rem]
            ${opensUp
              ? 'bottom-[-1px] sm:bottom-[-1px] sm:origin-bottom-left'
              : 'top-[-1px] sm:top-[-1px] sm:origin-top-left'
            }
            ${isSubmenuOpen
              ? 'pointer-events-auto translate-y-0 opacity-100'
              : 'pointer-events-none opacity-0 translate-y-0'
            }
          `}
        >
          {group.options.map((option) => (
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
    );
  };

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
            setOpenSubmenuLabel(null);
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
          onMouseLeave={() => setOpenSubmenuLabel(null)}
          className={`
            absolute left-0 top-full z-30 mt-1 w-full rounded-lg border border-slate-200 bg-white py-1 shadow-lg
            ${hasSubmenu ? 'sm:w-80' : ''}
          `}
        >
          {leadingGroups?.map(renderGroupButton)}

          {directOptions.map((option) => (
            <button
              key={option}
              type="button"
              role="option"
              aria-selected={value === option}
              onMouseEnter={() => setOpenSubmenuLabel(null)}
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

          {trailingGroup && renderGroupButton(trailingGroup)}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
