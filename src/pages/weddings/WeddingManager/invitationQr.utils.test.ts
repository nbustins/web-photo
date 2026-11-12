import QRCode from 'qrcode';
import { strFromU8, unzipSync } from 'fflate';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { buildInvitationUrl, createWeddingQrArchive, uniqueInvitationQrItems } from './invitationQr.utils';

describe('buildInvitationUrl', () => {
  it('uses the deployed origin and app base path with the invitation code in the hash route query', () => {
    const url = buildInvitationUrl('carla-joel', 'GARCIA01', 'https://photos.example', '/web-photo/');

    expect(url).toBe('https://photos.example/web-photo/#/weddings/carla-joel?code=GARCIA01');
  });

  it('encodes route and query values without losing the invitation code', () => {
    const url = buildInvitationUrl('carla joel', 'GARCIA&01', 'https://photos.example', '/');
    const hash = new URL(url).hash;
    const [path, query] = hash.slice(1).split('?');

    expect(path).toBe('/weddings/carla%20joel');
    expect(new URLSearchParams(query).get('code')).toBe('GARCIA&01');
  });
});

describe('createWeddingQrArchive', () => {
  beforeEach(() => vi.spyOn(QRCode, 'toString').mockImplementation(async (value) => `<svg>${value}</svg>`));

  it('packages exactly one named QR SVG per invitation using its guest URL', async () => {
    const archive = await createWeddingQrArchive(
      'carla-joel',
      [
        { invitationId: 12, label: 'Garcia Family', inviteCode: 'GARCIA01' },
        { invitationId: 13, label: 'Pérez & Co.', inviteCode: 'PEREZ02' },
      ],
      { origin: 'https://photos.example', baseUrl: '/web-photo/' },
    );
    const files = unzipSync(archive);

    expect(Object.keys(files).sort()).toEqual(['garcia-family-12.svg', 'perez-co-13.svg']);
    expect(strFromU8(files['garcia-family-12.svg'])).toContain(
      'https://photos.example/web-photo/#/weddings/carla-joel?code=GARCIA01',
    );
    expect(QRCode.toString).toHaveBeenCalledTimes(2);
  });

  it('returns a valid empty archive when a wedding has no invitations', async () => {
    expect(Object.keys(unzipSync(await createWeddingQrArchive('carla-joel', [])))).toEqual([]);
  });
});

describe('uniqueInvitationQrItems', () => {
  it('keeps one QR item per invitation while preserving the first-seen order', () => {
    expect(uniqueInvitationQrItems([
      { invitationId: 12, label: 'Garcia Family', inviteCode: 'GARCIA01' },
      { invitationId: 12, label: 'Garcia Family', inviteCode: 'GARCIA01' },
      { invitationId: 13, label: 'Pérez & Co.', inviteCode: 'PEREZ02' },
    ])).toEqual([
      { invitationId: 12, label: 'Garcia Family', inviteCode: 'GARCIA01' },
      { invitationId: 13, label: 'Pérez & Co.', inviteCode: 'PEREZ02' },
    ]);
  });
});
