import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from 'antd';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WeddingQrArchiveButton } from './WeddingQrArchiveButton';

const mocks = vi.hoisted(() => ({
  createWeddingQrArchive: vi.fn(),
  downloadBlob: vi.fn(),
}));

vi.mock('../../weddings/WeddingManager/invitationQr.utils', () => mocks);

describe('WeddingQrArchiveButton', () => {
  beforeEach(() => {
    mocks.createWeddingQrArchive.mockReset();
    mocks.downloadBlob.mockReset();
    mocks.createWeddingQrArchive.mockResolvedValue(new Uint8Array([1, 2, 3]));
  });

  it('downloads a ZIP containing only the selected wedding invitations', async () => {
    const invitations = [
      { invitationId: 12, label: 'Garcia Family', inviteCode: 'GARCIA01' },
      { invitationId: 13, label: 'Pérez & Co.', inviteCode: 'PEREZ02' },
    ];
    const user = userEvent.setup();
    render(
      <App>
        <WeddingQrArchiveButton weddingSlug="carla-joel" invitations={invitations} />
      </App>,
    );

    await user.click(screen.getByRole('button', { name: /Descarregar tots els codis QR/ }));

    await waitFor(() => expect(mocks.createWeddingQrArchive).toHaveBeenCalledWith('carla-joel', invitations));
    expect(mocks.downloadBlob).toHaveBeenCalledWith(expect.any(Blob), 'carla-joel-codis-qr.zip');
  });

  it('disables bulk download when the wedding has no invitations', () => {
    render(
      <App>
        <WeddingQrArchiveButton weddingSlug="carla-joel" invitations={[]} />
      </App>,
    );

    expect(screen.getByRole('button', { name: /Descarregar tots els codis QR/ })).toBeDisabled();
  });
});
