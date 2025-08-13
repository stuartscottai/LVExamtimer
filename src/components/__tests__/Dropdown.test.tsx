import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Dropdown from '../Dropdown';

describe('Dropdown', () => {
  const mockOptions = ['Option 1', 'Option 2', 'Option 3'];
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with placeholder when no value is selected', () => {
    render(
      <Dropdown
        options={mockOptions}
        value=""
        onChange={mockOnChange}
        placeholder="Select an option"
      />
    );

    expect(screen.getByDisplayValue('Select an option')).toBeInTheDocument();
  });

  it('renders all provided options', () => {
    render(
      <Dropdown
        options={mockOptions}
        value=""
        onChange={mockOnChange}
        placeholder="Select an option"
      />
    );

    mockOptions.forEach(option => {
      expect(screen.getByRole('option', { name: option })).toBeInTheDocument();
    });
  });

  it('displays selected value correctly', () => {
    render(
      <Dropdown
        options={mockOptions}
        value="Option 2"
        onChange={mockOnChange}
        placeholder="Select an option"
      />
    );

    expect(screen.getByDisplayValue('Option 2')).toBeInTheDocument();
  });

  it('calls onChange when option is selected', async () => {
    const user = userEvent.setup();
    render(
      <Dropdown
        options={mockOptions}
        value=""
        onChange={mockOnChange}
        placeholder="Select an option"
      />
    );

    const select = screen.getByRole('combobox');
    await user.selectOptions(select, 'Option 2');

    expect(mockOnChange).toHaveBeenCalledWith('Option 2');
    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(
      <Dropdown
        options={mockOptions}
        value=""
        onChange={mockOnChange}
        placeholder="Select an option"
        disabled={true}
      />
    );

    const select = screen.getByRole('combobox');
    expect(select).toBeDisabled();
  });

  it('applies disabled styling when disabled', () => {
    render(
      <Dropdown
        options={mockOptions}
        value=""
        onChange={mockOnChange}
        placeholder="Select an option"
        disabled={true}
      />
    );

    const select = screen.getByRole('combobox');
    expect(select).toHaveClass('disabled:bg-slate-100');
    expect(select).toHaveClass('disabled:text-slate-400');
    expect(select).toHaveClass('disabled:cursor-not-allowed');
  });

  it('does not call onChange when disabled', async () => {
    const user = userEvent.setup();
    render(
      <Dropdown
        options={mockOptions}
        value=""
        onChange={mockOnChange}
        placeholder="Select an option"
        disabled={true}
      />
    );

    const select = screen.getByRole('combobox');
    
    // Try to interact with disabled select
    await user.click(select);
    
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('applies custom className when provided', () => {
    render(
      <Dropdown
        options={mockOptions}
        value=""
        onChange={mockOnChange}
        placeholder="Select an option"
        className="custom-dropdown"
      />
    );

    const select = screen.getByRole('combobox');
    expect(select).toHaveClass('custom-dropdown');
  });

  it('sets id attribute when provided', () => {
    render(
      <Dropdown
        options={mockOptions}
        value=""
        onChange={mockOnChange}
        placeholder="Select an option"
        id="test-dropdown"
      />
    );

    const select = screen.getByRole('combobox');
    expect(select).toHaveAttribute('id', 'test-dropdown');
  });

  it('sets aria-label when provided', () => {
    render(
      <Dropdown
        options={mockOptions}
        value=""
        onChange={mockOnChange}
        placeholder="Select an option"
        aria-label="Test dropdown"
      />
    );

    const select = screen.getByRole('combobox');
    expect(select).toHaveAttribute('aria-label', 'Test dropdown');
  });

  it('has proper focus styling', () => {
    render(
      <Dropdown
        options={mockOptions}
        value=""
        onChange={mockOnChange}
        placeholder="Select an option"
      />
    );

    const select = screen.getByRole('combobox');
    expect(select).toHaveClass('focus:ring-2');
    expect(select).toHaveClass('focus:ring-cambridge-blue');
    expect(select).toHaveClass('focus:border-cambridge-blue');
  });

  it('has proper hover styling', () => {
    render(
      <Dropdown
        options={mockOptions}
        value=""
        onChange={mockOnChange}
        placeholder="Select an option"
      />
    );

    const select = screen.getByRole('combobox');
    expect(select).toHaveClass('hover:border-slate-400');
  });

  it('handles empty options array', () => {
    render(
      <Dropdown
        options={[]}
        value=""
        onChange={mockOnChange}
        placeholder="No options available"
      />
    );

    expect(screen.getByDisplayValue('No options available')).toBeInTheDocument();
    
    // Should only have the placeholder option
    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(1);
    expect(options[0]).toHaveTextContent('No options available');
  });

  it('handles special characters in options', () => {
    const specialOptions = ['Option & Test', 'Option < > Test', 'Option "Quote" Test'];
    render(
      <Dropdown
        options={specialOptions}
        value=""
        onChange={mockOnChange}
        placeholder="Select an option"
      />
    );

    specialOptions.forEach(option => {
      expect(screen.getByRole('option', { name: option })).toBeInTheDocument();
    });
  });

  it('maintains selection state correctly', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <Dropdown
        options={mockOptions}
        value=""
        onChange={mockOnChange}
        placeholder="Select an option"
      />
    );

    // Select an option
    const select = screen.getByRole('combobox');
    await user.selectOptions(select, 'Option 2');

    // Rerender with the selected value
    rerender(
      <Dropdown
        options={mockOptions}
        value="Option 2"
        onChange={mockOnChange}
        placeholder="Select an option"
      />
    );

    expect(screen.getByDisplayValue('Option 2')).toBeInTheDocument();
  });
});