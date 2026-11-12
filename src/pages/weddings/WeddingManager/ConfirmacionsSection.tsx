import { FC, useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PageHeader } from '@ui/PageHeader';
import { useIsMobile } from '@ui/hooks/useIsMobile';
import type { InvitationSummary } from './WeddingManager.types';
import { buildSummary, computeStats } from './manager.utils';
import { useManagerShell } from './managerShell';
import {
  ManagerDesktopDashboard,
  ManagerInvitationDrawer,
  ManagerMobileDashboard,
} from './components';
import styles from './WeddingManager.module.css';
import { buildInvitationUrl } from './invitationQr.utils';

export const ConfirmacionsSection: FC = () => {
  const { slug = '' } = useParams<{ slug: string }>();
  const { weddingTitle, rows, features, invitationSongs } = useManagerShell();
  const isMobile = useIsMobile();
  const [selectedSummary, setSelectedSummary] = useState<InvitationSummary | null>(null);
  const invitationLink = useCallback((code: string) => buildInvitationUrl(slug, code), [slug]);

  const dashboardProps = {
    weddingTitle,
    rows,
    stats: computeStats(rows),
    // The shell's Sortir owns logout; the embedded dashboards render no logout control.
    onLogout: () => {},
    embedded: true,
    onSelectInvitation: (id: number) => setSelectedSummary(buildSummary(rows, id, invitationSongs)),
  };

  return (
    <>
      <PageHeader title="Confirmacions" />
      <div className={styles.sectionBody}>
        {isMobile ? (
          <ManagerMobileDashboard {...dashboardProps} />
        ) : (
          <ManagerDesktopDashboard {...dashboardProps} features={features} />
        )}
      </div>
      <ManagerInvitationDrawer
        summary={selectedSummary}
        features={features}
        inviteLink={invitationLink}
        onClose={() => setSelectedSummary(null)}
      />
    </>
  );
};
