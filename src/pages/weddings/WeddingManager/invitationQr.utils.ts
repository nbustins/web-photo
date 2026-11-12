import QRCode from 'qrcode';
import { strToU8, zipSync } from 'fflate';
import { weddingPath } from '../../../model/routes.model';
import type { ConfirmationRow } from '../../../model/wedding.types';

export interface InvitationQrItem {
  invitationId: number;
  label: string;
  inviteCode: string;
}

export const uniqueInvitationQrItems = (
  rows: Pick<ConfirmationRow, 'invitationId' | 'label' | 'inviteCode'>[],
): InvitationQrItem[] => {
  const invitations = new Map<number, InvitationQrItem>();
  rows.forEach(({ invitationId, label, inviteCode }) => {
    if (!invitations.has(invitationId)) invitations.set(invitationId, { invitationId, label, inviteCode });
  });
  return [...invitations.values()];
};

interface InvitationQrOptions {
  origin?: string;
  baseUrl?: string;
}

export const buildInvitationUrl = (
  slug: string,
  inviteCode: string,
  origin = window.location.origin,
  baseUrl = import.meta.env.BASE_URL,
): string => {
  const appUrl = new URL(baseUrl, origin);
  const query = new URLSearchParams({ code: inviteCode });
  appUrl.hash = `${weddingPath(encodeURIComponent(slug))}?${query.toString()}`;
  return appUrl.toString();
};

export const generateInvitationQrSvg = (url: string): Promise<string> =>
  QRCode.toString(url, {
    type: 'svg',
    errorCorrectionLevel: 'Q',
    margin: 4,
    width: 512,
  });

const fileSafeLabel = (label: string): string =>
  label
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'invitation';

export const invitationQrFileName = (invitation: InvitationQrItem): string =>
  `${fileSafeLabel(invitation.label)}-${invitation.invitationId}.svg`;

export const createWeddingQrArchive = async (
  slug: string,
  invitations: InvitationQrItem[],
  { origin, baseUrl }: InvitationQrOptions = {},
): Promise<Uint8Array> => {
  const files = await Promise.all(invitations.map(async invitation => {
    const url = buildInvitationUrl(slug, invitation.inviteCode, origin, baseUrl);
    const svg = await generateInvitationQrSvg(url);
    return [invitationQrFileName(invitation), strToU8(svg)] as const;
  }));

  return zipSync(Object.fromEntries(files), { level: 0 });
};

export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
};
