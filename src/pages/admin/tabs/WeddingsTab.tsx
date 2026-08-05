import { FC, useEffect, useState } from 'react';
import { Button, Empty, Table } from 'antd';
import type { TableColumnsType } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useIsMobile } from '@ui/hooks/useIsMobile';
import type { ConfirmationRow } from '../../../model/wedding.types';
import type { InvitationSummary } from '../../weddings/WeddingManager/WeddingManager.types';
import { buildSummary, computeStats } from '../../weddings/WeddingManager/manager.utils';
import {
  ManagerDesktopDashboard,
  ManagerInvitationDrawer,
  ManagerMobileDashboard,
  ManagerNotesModal,
} from '../../weddings/WeddingManager/components';
import { AdminWedding, fetchAdminWeddings } from '../../../services/wedding/api/admin-wedding.api';
import { fetchConfirmations } from '../../../services/wedding/api/confirmations.api';
import { useApiError } from '../useApiError';
import styles from './WeddingsTab.module.css';

const formatDate = (date: string | null) =>
  date ? new Date(date).toLocaleDateString('ca-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';

export const WeddingsTab: FC = () => {
  const onError = useApiError();
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(false);
  const [weddings, setWeddings] = useState<AdminWedding[]>([]);
  const [selected, setSelected] = useState<AdminWedding | null>(null);
  const [rows, setRows] = useState<ConfirmationRow[]>([]);
  const [rowsLoading, setRowsLoading] = useState(false);
  const [selectedSummary, setSelectedSummary] = useState<InvitationSummary | null>(null);
  const [noteModal, setNoteModal] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchAdminWeddings()
      .then(list => setWeddings(list))
      .catch(onError)
      .finally(() => setLoading(false));
  }, []);

  const openWedding = async (wedding: AdminWedding) => {
    setSelected(wedding);
    setRows([]);
    setRowsLoading(true);
    try {
      setRows(await fetchConfirmations(wedding.id));
    } catch (err) {
      onError(err);
      setSelected(null);
    } finally {
      setRowsLoading(false);
    }
  };

  const closeWedding = () => {
    setSelected(null);
    setRows([]);
    setSelectedSummary(null);
    setNoteModal(null);
  };

  const columns: TableColumnsType<AdminWedding> = [
    { title: 'Casament', dataIndex: 'title', key: 'title' },
    {
      title: 'Data',
      key: 'eventDate',
      width: 130,
      render: (_, w) => formatDate(w.eventDate),
    },
    {
      title: 'Tancament confirmacions',
      key: 'closingDate',
      width: 200,
      render: (_, w) => formatDate(w.closingDate),
    },
    { title: 'Convidats', dataIndex: 'guestCount', key: 'guestCount', width: 110 },
    { title: 'Enllaç web', dataIndex: 'slug', key: 'slug', width: 180 },
  ];

  if (selected && !rowsLoading) {
    const stats = computeStats(rows);
    const dashboardProps = {
      weddingTitle: selected.title,
      rows,
      stats,
      onLogout: closeWedding,
      embedded: true,
      onSelectInvitation: (id: number) => setSelectedSummary(buildSummary(rows, id)),
      onShowNote: (note: string) => setNoteModal(note),
    };
    return (
      <>
        <div className={styles.detailHeader}>
          <Button icon={<ArrowLeftOutlined />} onClick={closeWedding}>Tornar</Button>
          <h2 className={styles.detailTitle}>{selected.title}</h2>
        </div>
        {isMobile ? <ManagerMobileDashboard {...dashboardProps} /> : <ManagerDesktopDashboard {...dashboardProps} />}
        <ManagerNotesModal note={noteModal} onClose={() => setNoteModal(null)} />
        <ManagerInvitationDrawer summary={selectedSummary} onClose={() => setSelectedSummary(null)} />
      </>
    );
  }

  return (
    <Table
      columns={columns}
      dataSource={[...weddings].sort((a, b) => (b.eventDate ?? '').localeCompare(a.eventDate ?? ''))}
      rowKey="id"
      loading={loading || rowsLoading}
      pagination={false}
      locale={{ emptyText: <Empty description="No hi ha casaments" /> }}
      onRow={(wedding) => ({ onClick: () => openWedding(wedding), style: { cursor: 'pointer' } })}
    />
  );
};
