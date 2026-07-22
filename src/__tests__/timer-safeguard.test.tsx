import React from 'react';
import { fireEvent, render, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from '../App';

const openSingleTimer = () => {
  const view = render(<App />);
  const app = within(view.container);

  fireEvent.click(app.getByRole('button', { name: 'Select Cambridge exam' }));
  fireEvent.click(app.getByRole('option', { name: 'B2 First Certificate' }));
  fireEvent.click(app.getByRole('button', { name: 'Select exam paper' }));
  fireEvent.click(app.getByRole('option', { name: 'Reading & Use of English' }));
  fireEvent.click(app.getByRole('button', { name: 'Go to timer screen' }));
  fireEvent.click(app.getByRole('button', { name: 'Start timer' }));

  return app;
};

describe('running timer safeguards', () => {
  it('keeps running until a pause is explicitly confirmed', () => {
    const view = openSingleTimer();

    fireEvent.keyDown(document, { code: 'Space' });

    expect(view.getByRole('alertdialog', { name: 'Pause this timer?' })).toBeInTheDocument();
    expect(view.getByText('The timer is still running.')).toBeInTheDocument();
    expect(view.getByText('Please confirm what you want to do. Pausing will change the finish time.')).toBeInTheDocument();
    expect(view.getAllByRole('button', { name: 'Pause timer' })).toHaveLength(2);

    fireEvent.click(view.getByRole('button', { name: 'Keep timer running' }));

    expect(view.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(view.getByRole('button', { name: 'Pause timer' })).toBeInTheDocument();

    fireEvent.click(view.getByRole('button', { name: 'Pause timer' }));
    fireEvent.click(within(view.getByRole('alertdialog')).getByRole('button', { name: 'Pause timer' }));

    expect(view.getByRole('button', { name: 'Start timer' })).toBeInTheDocument();
  });

  it('warns before resetting a running timer', () => {
    const view = openSingleTimer();

    fireEvent.click(view.getByRole('button', { name: 'Reset timer' }));

    expect(view.getByRole('alertdialog', { name: 'Reset this timer?' })).toBeInTheDocument();
    expect(view.getByRole('button', { name: 'Pause timer' })).toBeInTheDocument();
  });
});
