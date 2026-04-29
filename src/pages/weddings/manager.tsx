import { FC, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Layout, Card, Table, Tag, Typography, Space, Descriptions, Empty, Button, Form, Input, Drawer, List, Modal } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { guestService } from '../../services/wedding';
import { login, logout } from '../../services/auth/auth.service';
import { getUser } from '../../services/auth/auth.store';
import type { Wedding, ConfirmationRow } from '../../model/wedding.types';
import { useIsMobile } from './useIsMobile';
import { MobileShell, ManagerMobile } from './components';
import {
  COLOR_TEXT_DARK,
  COLOR_GREEN,
  COLOR_RUST,
  COLOR_OLIVE,
  COLOR_MUTED,
  FONT_TITLE,
  FONT_BODY,
  StatusPill,
  LabelTag,
  StatCell,
} from './components/manager-shared';
import './manager.css';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

type ManagerState = 'login' | 'loading' | 'error' | 'data';

interface LoginFormValues {
  email: string;
  password: string;
}

interface InvitationSummary {
  invitationId: number;
  label: string;
  inviteCode: string;
  maxAddedGuests: number;
  notes: string | null;
  guests: { id: number; name: string; isPredefined: boolean; attending: boolean | null }[];
}

const buildSummary = (rows: ConfirmationRow[], invitationId: number): InvitationSummary | null => {
  const matching = rows.filter(r => r.invitationId === invitationId);
  if (!matching.length) return null;
  const first = matching[0];
  return {
    invitationId: first.invitationId,
    label: first.label,
    inviteCode: first.inviteCode,
    maxAddedGuests: first.maxAddedGuests,
    notes: first.notes,
    guests: matching.map(r => ({ id: r.guestId, name: r.guestName, isPredefined: r.isPredefined, attending: r.guestAttending })),
  };
};

export const Manager: FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [state, setState] = useState<ManagerState>(() => (getUser() ? 'loading' : 'login'));
  const [wedding, setWedding] = useState<Wedding | null>(null);
  const [weddingNotFound, setWeddingNotFound] = useState(false);
  const [rows, setRows] = useState<ConfirmationRow[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm<LoginFormValues>();
  const [selectedSummary, setSelectedSummary] = useState<InvitationSummary | null>(null);
  const [noteModal, setNoteModal] = useState<string | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!slug) return;
    guestService.getWeddingBySlug(slug).then(w => {
      setWedding(w);
      setWeddingNotFound(w === null);
    });
  }, [slug]);

  useEffect(() => {
    if (slug && getUser()) loadData();
  }, [slug]);

  const loadData = async () => {
    if (!slug) return;
    setState('loading');
    try {
      const data = await guestService.getConfirmations(slug);
      setRows(data);
      setState('data');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Error desconegut');
      setState('error');
    }
  };

  const handleLogin = async ({ email, password }: LoginFormValues) => {
    setSubmitting(true);
    setErrorMessage('');
    const result = await login(email, password);
    setSubmitting(false);
    if (!result.success) { setErrorMessage(result.error); return; }
    await loadData();
  };

  const handleLogout = () => {
    logout();
    setRows([]);
    form.resetFields();
    setState('login');
  };

  const weddingTitle = wedding?.title ?? '';
  const managerTitle = weddingTitle ? `Gestió ${weddingTitle}` : 'Gestió';

  if (weddingNotFound) {
    return (
      <Layout className="manager-layout">
        <Content className="manager-content">
          <Card className="manager-card">
            <Title level={3} className="manager-title">Boda no trobada</Title>
            <Text type="secondary">No existeix cap boda amb el slug "{slug}".</Text>
          </Card>
        </Content>
      </Layout>
    );
  }

  const getStats = () => {
    const totalGuests = rows.length;
    const confirmed = rows.filter(r => r.guestAttending === true).length;
    const declined = rows.filter(r => r.guestAttending === false).length;
    const pending = rows.filter(r => r.guestAttending === null).length;
    const invitationIds = new Set(rows.map(r => r.invitationId));
    const respondedIds = new Set(rows.filter(r => r.guestAttending !== null).map(r => r.invitationId));
    return { totalGuests, confirmed, declined, pending, totalInvitations: invitationIds.size, respondedInvitations: respondedIds.size };
  };

  const invitationFilters = Array.from(
    new Map(rows.map(r => [r.invitationId, r.label])).entries()
  ).map(([id, label]) => ({ text: label, value: id }));

  const columns: ColumnsType<ConfirmationRow> = [
    {
      title: 'Invitació',
      key: 'invitation',
      filters: invitationFilters,
      onFilter: (value, r) => r.invitationId === value,
      render: (_, r) => (
        <LabelTag onClick={() => setSelectedSummary(buildSummary(rows, r.invitationId))}>
          {r.label}
        </LabelTag>
      ),
    },
    {
      title: 'Convidat',
      key: 'guest',
      render: (_, r) => (
        <Space size={6}>
          <span style={{ fontFamily: FONT_TITLE, fontSize: 17, color: COLOR_TEXT_DARK, letterSpacing: '0.01em' }}>
            {r.guestName}
          </span>
          {!r.isPredefined && (
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
      render: (_, r) => <StatusPill attending={r.guestAttending} />,
      filters: [
        { text: 'Confirmat', value: 'confirmed' },
        { text: 'Rebutjat', value: 'declined' },
        { text: 'Pendent', value: 'pending' },
      ],
      onFilter: (value, r) => {
        if (value === 'confirmed') return r.guestAttending === true;
        if (value === 'declined') return r.guestAttending === false;
        return r.guestAttending === null;
      },
    },
    {
      title: 'Notes',
      key: 'notes',
      render: (_, r) => {
        if (!r.notes) return <span style={{ fontFamily: FONT_BODY, color: COLOR_MUTED }}>-</span>;
        const truncated = r.notes.length > 60;
        return (
          <span
            style={{
              fontFamily: FONT_BODY,
              fontSize: 14,
              color: '#8a8275',
              cursor: truncated ? 'pointer' : 'default',
            }}
            onClick={truncated ? () => setNoteModal(r.notes) : undefined}
          >
            {truncated ? `${r.notes.slice(0, 60)}…` : r.notes}
          </span>
        );
      },
    },
  ];

  if (state === 'login' || state === 'error') {
    const loginForm = (
      <Form
        form={form}
        layout="vertical"
        onFinish={handleLogin}
        requiredMark={false}
      >
        <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Email vàlid requerit' }]}>
          <Input size="large" autoComplete="email" />
        </Form.Item>
        <Form.Item name="password" label="Contrasenya" rules={[{ required: true, message: 'Contrasenya requerida' }]}>
          <Input.Password size="large" autoComplete="current-password" />
        </Form.Item>
        <Form.Item style={{ marginBottom: 0 }}>
          <Button size="large" type="primary" htmlType="submit" loading={submitting} block>
            Accedir
          </Button>
        </Form.Item>
        {errorMessage && <Text type="danger" style={{ display: 'block', marginTop: 12 }}>{errorMessage}</Text>}
      </Form>
    );

    if (isMobile) {
      return (
        <MobileShell fallbackImage={wedding?.hero_image} alt={weddingTitle} expanded>
          <Title
            level={2}
            style={{
              fontFamily: "'Italiana', Georgia, serif",
              fontSize: 'clamp(1.6rem, 6vw, 2rem)',
              fontWeight: 500,
              color: '#7C7458',
              margin: 0,
              letterSpacing: '0.02em',
              textAlign: 'center',
            }}
          >
            {managerTitle}
          </Title>
          <Text
            style={{
              display: 'block',
              fontFamily: "'Raleway', sans-serif",
              fontSize: '0.78rem',
              color: 'rgb(174, 142, 116)',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              textAlign: 'center',
              marginTop: 6,
              marginBottom: 20,
            }}
          >
            Àrea privada
          </Text>
          {loginForm}
        </MobileShell>
      );
    }

    return (
      <Layout className="manager-layout">
        <Content className="manager-content">
          <Card className="manager-card">
            <Title level={3} className="manager-title">{managerTitle}</Title>
            <div style={{ maxWidth: 320 }}>{loginForm}</div>
          </Card>
        </Content>
      </Layout>
    );
  }

  if (state === 'loading') {
    return (
      <Layout className="manager-layout">
        <Content className="manager-content">
          <Card className="manager-card"><Text>Carregant...</Text></Card>
        </Content>
      </Layout>
    );
  }

  const stats = getStats();

  const overlays = (
    <>
      <Modal
        open={!!noteModal}
        onCancel={() => setNoteModal(null)}
        footer={null}
        title="Notes"
        width={480}
      >
        <Text style={{ whiteSpace: 'pre-wrap' }}>{noteModal}</Text>
      </Modal>

      <Drawer
        title={selectedSummary?.label}
        open={!!selectedSummary}
        onClose={() => setSelectedSummary(null)}
        width={360}
      >
        {selectedSummary && (
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="Codi">
                <Text copyable code>{selectedSummary.inviteCode}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Màx. afegits">{selectedSummary.maxAddedGuests}</Descriptions.Item>
              {selectedSummary.notes && (
                <Descriptions.Item label="Notes">{selectedSummary.notes}</Descriptions.Item>
              )}
            </Descriptions>

            <Title level={5} style={{ margin: 0 }}>Convidats</Title>
            <List
              size="small"
              dataSource={selectedSummary.guests}
              renderItem={g => (
                <List.Item extra={<StatusPill attending={g.attending} />}>
                  <Space size={6}>
                    <span style={{ fontFamily: FONT_TITLE, fontSize: 17, color: COLOR_TEXT_DARK, letterSpacing: '0.01em' }}>
                      {g.name}
                    </span>
                    {!g.isPredefined && (
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
                </List.Item>
              )}
            />
          </Space>
        )}
      </Drawer>
    </>
  );

  if (isMobile) {
    return (
      <>
        <ManagerMobile
          weddingTitle={weddingTitle}
          rows={rows}
          stats={stats}
          onLogout={handleLogout}
          onSelectInvitation={(id) => setSelectedSummary(buildSummary(rows, id))}
          onShowNote={(note) => setNoteModal(note)}
        />
        {overlays}
      </>
    );
  }

  return (
    <Layout className="manager-layout">
      <Header className="manager-header">
        <div className="manager-header-content">
          <span className="manager-header-name">{weddingTitle}</span>
          <Button className="manager-logout-btn" onClick={handleLogout}>Tancar sessió</Button>
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

      {overlays}
    </Layout>
  );
};
