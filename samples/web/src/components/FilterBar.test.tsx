import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { FilterBar } from './FilterBar';

describe('FilterBar', () => {
  it('reports typed search text', async () => {
    const onSearchChange = vi.fn();
    render(<FilterBar search="" onSearchChange={onSearchChange} />);
    await userEvent.type(screen.getByLabelText('Search applications'), 'H');
    expect(onSearchChange).toHaveBeenCalledWith('H');
  });
});
