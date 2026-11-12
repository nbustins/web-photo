import { FC, useState } from 'react';
import { DownloadOutlined } from '@ant-design/icons';
import { App, Button } from 'antd';
import type { InvitationQrItem } from '../../weddings/WeddingManager/invitationQr.utils';
import { createWeddingQrArchive, downloadBlob } from '../../weddings/WeddingManager/invitationQr.utils';

interface WeddingQrArchiveButtonProps {
  weddingSlug: string;
  invitations: InvitationQrItem[];
}

export const WeddingQrArchiveButton: FC<WeddingQrArchiveButtonProps> = ({ weddingSlug, invitations }) => {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);

  const downloadAll = async () => {
    setLoading(true);
    try {
      const archive = await createWeddingQrArchive(weddingSlug, invitations);
      downloadBlob(new Blob([archive], { type: 'application/zip' }), `${weddingSlug}-codis-qr.zip`);
      message.success('Codis QR descarregats');
    } catch {
      message.error("No s'han pogut descarregar els codis QR");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      icon={<DownloadOutlined />}
      loading={loading}
      disabled={invitations.length === 0}
      onClick={downloadAll}
    >
      Descarregar tots els codis QR
    </Button>
  );
};
