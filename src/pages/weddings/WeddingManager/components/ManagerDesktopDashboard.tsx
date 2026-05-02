import { FC } from 'react';
import { Button, Card, Empty, Layout, Space, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { ConfirmationRow } from '../../../../model/wedding.types';
import type { ManagerStats } from '../WeddingManager.types';
import {
  COLOR_GREEN,
  COLOR_MUTED,
  COLOR_OLIVE,
  COLOR_RUST,
  COLOR_TEXT_DARK,
  FONT_BODY,
  FONT_TITLE,
  LabelTag,
  StatCell,
  StatusPill,
} from './ManagerShared';

const { Header, Content } = Layout;

interface ManagerDesktopDashboardProps {
  weddingTitle: string;
  rows: ConfirmationRow[];
  stats: ManagerStats;
  onLogout: () => void;
  onSelectInvitation: (invitationId: number) => void;
  onShowNote: (note: string) => void;
}

export const ManagerDesktopDashboard: FC<ManagerDesktopDashboardProps> = ({
  weddingTitle,
  rows,
  stats,
  onLogout,
  onSelectInvitation,
  onShowNote,
}) => {
  const invitationFilters = Array.from(
    new Map(rows.map(row => [row.invitationId, row.label])).entries()
  ).map(([id, label]) => ({ text: label, value: id }));

  const columns: ColumnsType<ConfirmationRow> = [
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
          <span style={{ fontFamily: FONT_TITLE, fontSize: 17, color: COLOR_TEXT_DARK, letterSpacing: '0.01em' }}>
            {row.guestName}
          </span>
          {!row.isPredefined && (
            <Tag
              style={{
                fontFamily: FONT_BODY,
                fontSize: 11,
                color: COLOR_OLIVE,
                background: 'rgba(124,116,88,0.08)',
                border: '1px solid rgba(124,116,88,0.35)',
                borderRadius: 999,
              }}
            >
              Afegit
            </Tag>
          )}
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
        if (!row.notes) return <span style={{ fontFamily: FONT_BODY, color: COLOR_MUTED }}>-</span>;
        const truncated = row.notes.length > 60;
        return (
          <span
            style={{
              fontFamily: FONT_BODY,
              fontSize: 14,
              color: '#8a8275',
              cursor: truncated ? 'pointer' : 'default',
            }}
            onClick={truncated ? () => onShowNote(row.notes!) : undefined}
          >
            {truncated ? `${row.notes.slice(0, 60)}...` : row.notes}
          </span>
        );
      },
    },
  ];

  return (
    <Layout className="manager-layout">
      <Header className="manager-header">
        <div className="manager-header-content">
          <span className="manager-header-name">{weddingTitle}</span>
          <Button className="manager-logout-btn" onClick={onLogout}>Tancar sessió</Button>
        </div>
      </Header>
      <Content className="manager-scroll-area">
        <div className="manager-content">
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Card className="manager-stats-card">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8, padding: '8px 0' }}>
                <StatCell value={stats.totalGuests} label="Total" color={COLOR_TEXT_DARK} />
                <StatCell value={stats.confirmed} label="Confirmats" color={COLOR_GREEN} />
                <StatCell value={stats.pending} label="Pendents" color={COLOR_TEXT_DARK} />
                <StatCell value={stats.declined} label="Rebutjats" color={COLOR_RUST} />
                <StatCell value={stats.totalInvitations} label="Invitacions" color={COLOR_TEXT_DARK} />
                <StatCell value={stats.respondedInvitations} label="Respostes" color={COLOR_TEXT_DARK} />
              </div>
            </Card>

            <Card className="manager-table-card">
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
        </div>
      </Content>
    </Layout>
  );
};
