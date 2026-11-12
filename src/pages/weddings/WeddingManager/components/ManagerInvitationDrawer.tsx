import { FC, useEffect, useState } from 'react';
import { DownloadOutlined } from '@ant-design/icons';
import { Alert, Button, Drawer, message, Spin } from 'antd';
import { Icons } from '@ui/icons';
import type { WeddingFeatures } from '../../../../model/wedding.types';
import type { InvitationSummary } from '../WeddingManager.types';
import { AllergensValue, StatusPill, TransportValue } from './ManagerShared';
import shared from './ManagerShared.module.css';
import styles from './ManagerInvitationDrawer.module.css';
import { downloadBlob, generateInvitationQrSvg, invitationQrFileName } from '../invitationQr.utils';

interface ManagerInvitationDrawerProps {
  summary: InvitationSummary | null;
  features: WeddingFeatures;
  /** Builds the guest-facing link for an invitation code; omit to hide the copy action. */
  inviteLink?: (inviteCode: string) => string;
  onClose: () => void;
}

const meta = (summary: InvitationSummary) =>
  [
    `Codi ${summary.inviteCode}`,
    summary.email,
    summary.maxAddedGuests > 0
      ? `${summary.maxAddedGuests} acompanyant${summary.maxAddedGuests === 1 ? '' : 's'} permès${summary.maxAddedGuests === 1 ? '' : 'os'}`
      : null,
  ]
    .filter(Boolean)
    .join(' · ');

export const ManagerInvitationDrawer: FC<ManagerInvitationDrawerProps> = ({ summary, features, inviteLink, onClose }) => {
  const [qrSvg, setQrSvg] = useState('');
  const [qrError, setQrError] = useState(false);

  useEffect(() => {
    if (!summary || !inviteLink) {
      setQrSvg('');
      setQrError(false);
      return;
    }

    let active = true;
    setQrSvg('');
    setQrError(false);
    generateInvitationQrSvg(inviteLink(summary.inviteCode))
      .then(svg => { if (active) setQrSvg(svg); })
      .catch(() => { if (active) setQrError(true); });

    return () => { active = false; };
  }, [summary, inviteLink]);

  const copyLink = async () => {
    if (!summary || !inviteLink) return;
    try {
      await navigator.clipboard.writeText(inviteLink(summary.inviteCode));
      message.success("Enllaç copiat");
    } catch {
      message.error("No s'ha pogut copiar l'enllaç");
    }
  };

  const downloadQr = () => {
    if (!summary || !qrSvg) return;
    downloadBlob(
      new Blob([qrSvg], { type: 'image/svg+xml;charset=utf-8' }),
      invitationQrFileName(summary),
    );
  };

  return (
    <Drawer
      title={summary && (
        <div className={styles.header}>
          <span className={styles.title}>{summary.label}</span>
          <span className={styles.meta}>{meta(summary)}</span>
        </div>
      )}
      open={!!summary}
      onClose={onClose}
      width={460}
      footer={summary && inviteLink ? (
        <Button icon={<Icons.link />} onClick={copyLink}>Copiar enllaç d'invitació</Button>
      ) : undefined}
    >
      {summary && (
        <div className={styles.body}>
          {inviteLink && (
            <section className={styles.section}>
              <h3 className={styles.sectionLabel}>Codi QR de la invitació</h3>
              {qrError ? (
                <Alert type="error" showIcon message="No s'ha pogut generar el codi QR" />
              ) : qrSvg ? (
                <img
                  className={styles.qrCode}
                  src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(qrSvg)}`}
                  alt={`Codi QR de ${summary.label}`}
                />
              ) : <Spin size="small" />}
              <Button
                icon={<DownloadOutlined />}
                disabled={!qrSvg}
                onClick={downloadQr}
              >
                Descarregar QR
              </Button>
            </section>
          )}
          <section className={styles.section}>
            <h3 className={styles.sectionLabel}>Convidats</h3>
            {summary.guests.map(guest => (
              <div key={guest.id} className={styles.guest}>
                <div className={styles.row}>
                  <span className={styles.guestName}>
                    {guest.name}
                    {!guest.isPredefined && <span className={shared.addedTag}> Afegit</span>}
                  </span>
                  <StatusPill attending={guest.attending} />
                </div>
                {guest.attending === true && features.transportToHotel && (
                  <div className={styles.row}>
                    <span className={styles.rowLabel}>Bus a l'hotel</span>
                    <TransportValue attending={guest.attending} usesTransport={guest.usesTransportToHotel} />
                  </div>
                )}
                {guest.attending === true && features.allergens && (
                  <div className={styles.row}>
                    <span className={styles.rowLabel}>Al·lèrgies</span>
                    <AllergensValue attending={guest.attending} allergens={guest.allergens} />
                  </div>
                )}
              </div>
            ))}
          </section>

          {features.songRequests && (
            <section className={styles.section}>
              <h3 className={styles.sectionLabel}>Cançons proposades ({summary.songRequests.length})</h3>
              {summary.songRequests.length === 0 ? (
                <p className={shared.notesEmpty}>Cap cançó proposada.</p>
              ) : (
                summary.songRequests.map(song => (
                  <div key={`${song.title}|${song.artist ?? ''}`} className={styles.song}>
                    <span className={styles.songTitle}>{song.title}</span>
                    <span className={shared.muted}>{song.artist || '—'}</span>
                  </div>
                ))
              )}
            </section>
          )}

          <section className={styles.section}>
            <h3 className={styles.sectionLabel}>Observacions</h3>
            {summary.notes ? (
              <p className={styles.notes}>{summary.notes}</p>
            ) : (
              <p className={shared.notesEmpty}>Sense observacions.</p>
            )}
          </section>
        </div>
      )}
    </Drawer>
  );
};
