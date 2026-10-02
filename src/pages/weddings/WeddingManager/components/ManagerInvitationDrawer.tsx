import { FC } from 'react';
import { Button, Drawer, message } from 'antd';
import { Icons } from '@ui/icons';
import type { WeddingFeatures } from '../../../../model/wedding.types';
import type { InvitationSummary } from '../WeddingManager.types';
import { AllergensValue, StatusPill, TransportValue } from './ManagerShared';
import shared from './ManagerShared.module.css';
import styles from './ManagerInvitationDrawer.module.css';

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
  const copyLink = async () => {
    if (!summary || !inviteLink) return;
    try {
      await navigator.clipboard.writeText(inviteLink(summary.inviteCode));
      message.success("Enllaç copiat");
    } catch {
      message.error("No s'ha pogut copiar l'enllaç");
    }
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
