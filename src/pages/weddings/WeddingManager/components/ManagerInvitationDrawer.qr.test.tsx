import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from 'antd';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ManagerInvitationDrawer } from './ManagerInvitationDrawer';

const summary = {
  invitationId: 42,
  label: 'Garcia Family',
  email: null,
  inviteCode: 'GARCIA01',
  maxAddedGuests: 0,
  notes: null,
  guests: [],
  songRequests: [],
};

const features = { transportToHotel: false, songRequests: false, allergens: false };
const inviteLink = (code: string) => `https://photos.example/#/weddings/carla-joel?code=${code}`;

const renderDrawer = () => render(
  <App>
    <ManagerInvitationDrawer summary={summary} features={features} inviteLink={inviteLink} onClose={() => {}} />
  </App>,
);

describe('ManagerInvitationDrawer QR code', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('shows the selected invitation QR and preserves the existing link-copy action', async () => {
    renderDrawer();

    expect(await screen.findByRole('img', { name: 'Codi QR de Garcia Family' })).toHaveAttribute(
      'src',
      expect.stringContaining('data:image/svg+xml'),
    );
    expect(screen.getByRole('button', { name: /Copiar enllaç d'invitació/ })).toBeInTheDocument();
  });

  it('downloads the selected invitation QR as an SVG file', async () => {
    const createObjectURL = vi.fn((blob: Blob) => {
      expect(blob).toBeInstanceOf(Blob);
      return 'blob:invitation-qr';
    });
    class MockURL extends URL {}
    Object.defineProperty(MockURL, 'createObjectURL', { value: createObjectURL });
    Object.defineProperty(MockURL, 'revokeObjectURL', { value: vi.fn() });
    vi.stubGlobal('URL', MockURL);
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    const user = userEvent.setup();
    renderDrawer();
    await screen.findByRole('img', { name: 'Codi QR de Garcia Family' });
    await user.click(screen.getByRole('button', { name: /Descarregar QR/ }));

    await waitFor(() => expect(createObjectURL).toHaveBeenCalledTimes(1));
    expect(createObjectURL.mock.calls[0][0].type).toBe('image/svg+xml;charset=utf-8');
  });
});
