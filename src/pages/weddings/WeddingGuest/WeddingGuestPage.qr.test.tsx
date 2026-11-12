import { render, screen, waitFor } from '@testing-library/react';
import { App } from 'antd';
import { MemoryRouter, Route, Routes, useParams } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WeddingGuestPage } from './WeddingGuestPage';

const mocks = vi.hoisted(() => ({
  getWeddingBySlug: vi.fn(),
  getWeddingPhotos: vi.fn(),
  getInvitation: vi.fn(),
  saveConfirmation: vi.fn(),
}));

vi.mock('../../../services/wedding/guest.provider', () => ({ guestService: mocks }));

const GuestRoute = () => {
  const { slug = '' } = useParams();
  return <WeddingGuestPage slug={slug} />;
};

const renderGuest = (entry: string) => render(
  <App>
    <MemoryRouter initialEntries={[entry]}>
      <Routes>
        <Route path="/weddings/:slug" element={<GuestRoute />} />
      </Routes>
    </MemoryRouter>
  </App>,
);

describe('WeddingGuestPage invitation QR link', () => {
  beforeEach(() => {
    Object.values(mocks).forEach(mock => mock.mockReset());
    mocks.getWeddingBySlug.mockResolvedValue({
      id: 'carla-joel',
      slug: 'carla-joel',
      title: 'Carla & Joel',
      event_date: '',
      closing_date: '',
      features: { transportToHotel: false, songRequests: false, allergens: false },
    });
    mocks.getWeddingPhotos.mockResolvedValue([]);
    mocks.getInvitation.mockResolvedValue({
      id: 42,
      label: 'Garcia Family',
      inviteCode: 'GARCIA01',
      maxAddedGuests: 0,
      weddingTitle: 'Carla & Joel',
      eventDate: null,
      notes: null,
      slug: 'carla-joel',
      guests: [{ id: 1, name: 'Alex Garcia', isPredefined: true, attending: null }],
      features: { transportToHotel: false, songRequests: false, allergens: false },
    });
  });

  it('opens the exact invitation directly from its URL query code', async () => {
    renderGuest('/weddings/carla-joel?code=GARCIA01');

    await waitFor(() => expect(mocks.getInvitation).toHaveBeenCalledWith('carla-joel', 'GARCIA01'));
    expect(await screen.findByText('Alex Garcia')).toBeInTheDocument();
  });

  it('keeps manual invitation-code entry when the URL has no code', async () => {
    renderGuest('/weddings/carla-joel');

    expect(await screen.findByText("Introdueix el teu codi d'invitació")).toBeInTheDocument();
    expect(mocks.getInvitation).not.toHaveBeenCalled();
  });
});
