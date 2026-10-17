import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { Application } from '../api/applicationsApi';
import { ApplicationTable } from './ApplicationTable';

const apps: Application[] = [
  { id: 1, name: 'Payments Gateway', owner: 'Finance Platform', riskLevel: 'High', lastAssessedUtc: '2026-09-01T00:00:00Z' },
  { id: 2, name: 'HR Portal', owner: 'People Systems', riskLevel: 'Medium', lastAssessedUtc: '2026-08-15T00:00:00Z' },
];

describe('ApplicationTable', () => {
  it('renders one row per application', () => {
    render(<ApplicationTable applications={apps} />);
    expect(screen.getAllByRole('row')).toHaveLength(3); // header + 2
    expect(screen.getByRole('cell', { name: 'Payments Gateway' })).toBeInTheDocument();
  });

  it('shows an empty state when there are no applications', () => {
    render(<ApplicationTable applications={[]} />);
    expect(screen.getByText('No applications match.')).toBeInTheDocument();
  });
});
