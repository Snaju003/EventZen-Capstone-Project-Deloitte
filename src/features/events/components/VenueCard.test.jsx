import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { VenueCard } from '@/features/events/components/VenueCard';

describe('VenueCard', () => {
    const venue = {
        id: 1,
        name: 'Test Hall',
        image: 'https://example.com/hall.jpg',
        premium: true,
        rating: 4.9,
        location: 'Downtown',
        capacity: 320,
        price: 2400,
    };

    it('renders venue details and premium badge', () => {
        render(
            <MemoryRouter>
                <VenueCard venue={venue} />
            </MemoryRouter>,
        );

        expect(screen.getByText('Test Hall')).toBeInTheDocument();
        expect(screen.getByText('Downtown')).toBeInTheDocument();
        expect(screen.getByText('Up to 320')).toBeInTheDocument();
        expect(screen.getByText('Premium')).toBeInTheDocument();
        expect(screen.getByRole('img', { name: 'Test Hall' })).toBeInTheDocument();
        expect(screen.getByText('₹2,400.00')).toBeInTheDocument();
    });

    it('does not show premium badge for non-premium venue', () => {
        render(
            <MemoryRouter>
                <VenueCard venue={{ ...venue, premium: false }} />
            </MemoryRouter>,
        );

        expect(screen.queryByText('Premium')).not.toBeInTheDocument();
    });
});
