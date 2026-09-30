import { FC, useState } from 'react';
import { PageHeader } from '@ui/PageHeader';
import { useIsMobile } from '@ui/hooks/useIsMobile';
import type { InvitationSummary } from './WeddingManager.types';
import { buildSummary, computeStats } from './manager.utils';
import { useManagerShell } from './managerShell';
import {
  ManagerDesktopDashboard,
  ManagerInvitationDrawer,
  ManagerMobileDashboard,
  ManagerNotesModal,
} from './components';
import styles from './WeddingManager.module.css';

export const ConfirmacionsSection: FC = () => {
  const { weddingTitle, rows } = useManagerShell();
  const isMobile = useIsMobile();
  const [selectedSummary, setSelectedSummary] = useState<InvitationSummary | null>(null);
  const [noteModal, setNoteModal] = useState<string | null>(null);

  const dashboardProps = {
    weddingTitle,
    rows,
    stats: computeStats(rows),
    // The shell's Sortir owns logout; the embedded dashboards render no logout control.
    onLogout: () => {},
    embedded: true,
    onSelectInvitation: (id: number) => setSelectedSummary(buildSummary(rows, id)),
    onShowNote: (note: string) => setNoteModal(note),
  };

  return (
    <>
      <PageHeader title="Confirmacions" />
      <div className={styles.sectionBody}>
        {isMobile ? <ManagerMobileDashboard {...dashboardProps} /> : <ManagerDesktopDashboard {...dashboardProps} />}
      </div>
      <ManagerNotesModal note={noteModal} onClose={() => setNoteModal(null)} />
      <ManagerInvitationDrawer summary={selectedSummary} onClose={() => setSelectedSummary(null)} />
    </>
  );
};
