import { FC, useMemo, useState } from 'react';
import { Button, Card, Empty, Layout, Space, Table, Tag } from 'antd';
import type { TableColumnsType } from 'antd';
import { AppBar } from '@ui/AppBar';
import type { ConfirmationRow, WeddingFeatures } from '../../../../model/wedding.types';
import type { ManagerStats } from '../WeddingManager.types';
import { hasAllergens, hasTransport } from '../manager.utils';
import { AllergensValue, FilterPill, LabelTag, StatCell, StatusPill, TransportValue } from './ManagerShared';
import shared from './ManagerShared.module.css';
import styles from '../WeddingManager.module.css';
import local from './ManagerDesktopDashboard.module.css';

const { Content } = Layout;

type StatusFilter = 'all' | 'confirmed' | 'pending' | 'declined';

const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'Tots' },
  { key: 'confirmed', label: 'Confirmats' },
  { key: 'pending', label: 'Pendents' },
  { key: 'declined', label: 'Rebutjats' },
];

const matchesStatus = (row: ConfirmationRow, filter: StatusFilter) =>
  filter === 'all' ||
  (filter === 'confirmed' && row.guestAttending === true) ||
  (filter === 'declined' && row.guestAttending === false) ||
  (filter === 'pending' && row.guestAttending === null);

interface ManagerDesktopDashboardProps {
  weddingTitle: string;
  rows: ConfirmationRow[];
  stats: ManagerStats;
  onLogout: () => void;
  /** Renders only the stats + table body, without its own AppBar/Layout (for embedding in the admin panel). */
  embedded?: boolean;
  onSelectInvitation: (invitationId: number) => void;
  features: WeddingFeatures;
}

export const ManagerDesktopDashboard: FC<ManagerDesktopDashboardProps> = ({
  weddingTitle,
  rows,
  stats,
  onLogout,
  embedded = false,
  onSelectInvitation,
  features,
}) => {
  const [status, setStatus] = useState<StatusFilter>('all');
  const [onlyTransport, setOnlyTransport] = useState(false);
  const [onlyAllergens, setOnlyAllergens] = useState(false);

  const visibleRows = useMemo(
    () =>
      rows.filter(
        row =>
          matchesStatus(row, status) &&
          (!onlyTransport || hasTransport(row)) &&
          (!onlyAllergens || hasAllergens(row)),
      ),
    [rows, status, onlyTransport, onlyAllergens],
  );

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
        <LabelTag>{row.label}</LabelTag>
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
    },
    ...(features.transportToHotel
      ? [{
          title: "Bus a l'hotel",
          key: 'transport',
          width: 160,
          render: (_: unknown, row: ConfirmationRow) => (
            <TransportValue attending={row.guestAttending} usesTransport={row.usesTransportToHotel} />
          ),
        }]
      : []),
    ...(features.allergens
      ? [{
          title: 'Al·lèrgies',
          key: 'allergens',
          render: (_: unknown, row: ConfirmationRow) => (
            <AllergensValue attending={row.guestAttending} allergens={row.allergens} />
          ),
        }]
      : []),
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
          {features.transportToHotel && <StatCell value={stats.withTransport} label="Bus a l'hotel" />}
          {features.allergens && <StatCell value={stats.withAllergens} label="Amb al·lèrgies" />}
        </div>
      </Card>

      <div className={local.filters}>
        {STATUS_FILTERS.map(f => (
          <FilterPill key={f.key} active={status === f.key} onClick={() => setStatus(f.key)}>{f.label}</FilterPill>
        ))}
        {(features.transportToHotel || features.allergens) && <span className={shared.filterSeparator} />}
        {features.transportToHotel && (
          <FilterPill active={onlyTransport} onClick={() => setOnlyTransport(v => !v)}>Amb bus</FilterPill>
        )}
        {features.allergens && (
          <FilterPill active={onlyAllergens} onClick={() => setOnlyAllergens(v => !v)}>Amb al·lèrgies</FilterPill>
        )}
      </div>

      <Card className={styles.tableCard}>
        {rows.length === 0 ? (
          <Empty description="No hi ha convidats" />
        ) : (
          <Table
            columns={columns}
            dataSource={visibleRows}
            rowKey="guestId"
            pagination={{ pageSize: 20 }}
            locale={{ emptyText: 'No hi ha convidats' }}
            rowClassName={local.clickableRow}
            onRow={row => ({ onClick: () => onSelectInvitation(row.invitationId) })}
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
