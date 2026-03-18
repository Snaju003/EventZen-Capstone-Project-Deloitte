import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EventFilters } from '@/features/events/components/EventFilters';

describe('EventFilters', () => {
    it('renders all filter chips', () => {
        render(<EventFilters activeFilter="all-types" onFilterChange={() => { }} />);

        expect(screen.getByRole('button', { name: 'All Types' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Capacity' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Price Range' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Amenities' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Availability' })).toBeInTheDocument();
    });

    it('marks the active filter and calls handler when selecting another filter', async () => {
        const user = userEvent.setup();
        const onFilterChange = vi.fn();

        render(<EventFilters activeFilter="all-types" onFilterChange={onFilterChange} />);

        expect(screen.getByRole('button', { name: 'All Types' })).toHaveAttribute('aria-pressed', 'true');
        await user.click(screen.getByRole('button', { name: 'Price Range' }));

        expect(onFilterChange).toHaveBeenCalledWith('price-range');
    });
});
