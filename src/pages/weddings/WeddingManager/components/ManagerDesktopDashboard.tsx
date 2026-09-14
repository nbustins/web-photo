import { FC } from 'react';
import { Button, Card, Empty, Layout, Space, Table, Tag } from 'antd';
import type { TableColumnsType } from 'antd';
import { AppBar } from '@ui/AppBar';
import type { ConfirmationRow } from '../../../../model/wedding.types';
import type { ManagerStats } from '../WeddingManager.types';
import { LabelTag, StatCell, StatusPill } from './ManagerShared';
import shared from './ManagerShared.module.css';
import styles from '../WeddingManager.module.css';
import local from './ManagerDesktopDashboard.module.css';

const { Content } = Layout;

interface ManagerDesktopDashboardProps {
  weddingTitle: string;
  rows: ConfirmationRow[];
  stats: ManagerStats;
  onLogout: () => void;
  /** Renders only the stats + table body, without its own AppBar/Layout (for embedding in the admin panel). */
  embedded?: boolean;
  onSelectInvitation: (invitationId: number) => void;
  onShowNote: (note: string) => void;
}

export const ManagerDesktopDashboard: FC<ManagerDesktopDashboardProps> = ({
  weddingTitle,
  rows,
  stats,
  onLogout,
  embedded = false,
  onSelectInvitation,
  onShowNote,
}) => {
  const invitationFilters = Array.from(
    new Map(rows.map(row => [row.invitationId, row.label])).entries()
  ).map(([id, label]) => ({ text: label, value: id }));

  const columns: TableColumnsType<ConfirmationRow> = [
    {
      title: 'Invitació',
      key: 'invitation',
      filters: invitationFilters,
      onFilter: (value, row) => row.invitationId === value,
      render: (_, row) => (
        <LabelTag onClick={() => onSelectInvitation(row.invitationId)}>
          {row.label}
        </LabelTag>
      ),
    },
    {
      title: 'Convidat',
      key: 'guest',
      render: (_, row) => (
        <Space size={6}>
          <span className={shared.guestName}>{row.guestName}</span>
          {!row.isPredefined && <Tag className={shared.addedTag}>Afegit</Tag>}
        </Space>
      ),
    },
    {
      title: 'Assistència',
      key: 'attending',
      width: 140,
      render: (_, row) => <StatusPill attending={row.guestAttending} />,
      filters: [
        { text: 'Confirmat', value: 'confirmed' },
        { text: 'Rebutjat', value: 'declined' },
        { text: 'Pendent', value: 'pending' },
      ],
      onFilter: (value, row) => {
        if (value === 'confirmed') return row.guestAttending === true;
        if (value === 'declined') return row.guestAttending === false;
        return row.guestAttending === null;
      },
    },
    {
      title: 'Notes',
      key: 'notes',
      render: (_, row) => {
        if (!row.notes) return <span className={shared.notesEmpty}>-</span>;
        const truncated = row.notes.length > 60;
        return (
          <span
            className={truncated ? `${shared.notes} ${shared.notesClickable}` : shared.notes}
            onClick={truncated ? () => onShowNote(row.notes!) : undefined}
          >
            {truncated ? `${row.notes.slice(0, 60)}...` : row.notes}
          </span>
        );
      },
    },
  ];

  const body = (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      <Card className={styles.statsCard}>
        <div className={local.statsGrid}>
          <StatCell value={stats.totalGuests} label="Total" />
          <StatCell value={stats.confirmed} label="Confirmats" tone="success" />
          <StatCell value={stats.pending} label="Pendents" />
          <StatCell value={stats.declined} label="Rebutjats" tone="danger" />
          <StatCell value={stats.totalInvitations} label="Invitacions" />
          <StatCell value={stats.respondedInvitations} label="Respostes" />
        </div>
      </Card>

      <Card className={styles.tableCard}>
        {rows.length === 0 ? (
          <Empty description="No hi ha convidats" />
        ) : (
          <Table
            columns={columns}
            dataSource={rows}
            rowKey="guestId"
            pagination={{ pageSize: 20 }}
            locale={{ emptyText: 'No hi ha convidats' }}
          />
        )}
      </Card>
    </Space>
  );

  if (embedded) return body;

  return (
    <Layout className={styles.layout}>
      <AppBar
        title={weddingTitle}
        contentClassName={styles.headerContent}
        actions={
          <Button className={styles.logoutButton} onClick={onLogout}>Tancar sessió</Button>
        }
      />
      <Content className={styles.scrollArea}>
        <div className={styles.content}>{body}</div>
      </Content>
    </Layout>
  );
};
