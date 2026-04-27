import { FC, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Layout, Card, Table, Tag, Typography, Space, Descriptions, Empty, Button, Form, Input, Drawer, List, Modal } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { guestService } from '../../services/wedding';
import { login, logout } from '../../services/auth/auth.service';
import { getUser } from '../../services/auth/auth.store';
import type { Wedding, ConfirmationRow } from '../../model/wedding.types';
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

const attendingTag = (attending: boolean | null) => {
  if (attending === null) return <Tag color="default">Pendent</Tag>;
  return attending ? <Tag color="success">Confirmat</Tag> : <Tag color="error">Rebutjat</Tag>;
};

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
        <button
          className="invitation-label-btn"
          onClick={() => setSelectedSummary(buildSummary(rows, r.invitationId))}
        >
          {r.label}
        </button>
      ),
    },
    {
      title: 'Convidat',
      key: 'guest',
      render: (_, r) => (
        <Space size={6}>
          <Text>{r.guestName}</Text>
          {!r.isPredefined && <Tag color="blue" style={{ fontSize: 11 }}>Afegit</Tag>}
        </Space>
      ),
    },
    {
      title: 'Assistència',
      key: 'attending',
      width: 120,
      render: (_, r) => attendingTag(r.guestAttending),
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
        if (!r.notes) return <Text type="secondary">-</Text>;
        const truncated = r.notes.length > 60;
        return (
          <Text
            type="secondary"
            style={truncated ? { cursor: 'pointer' } : undefined}
            onClick={truncated ? () => setNoteModal(r.notes) : undefined}
          >
            {truncated ? `${r.notes.slice(0, 60)}…` : r.notes}
          </Text>
        );
      },
    },
  ];

  if (state === 'login' || state === 'error') {
    return (
      <Layout className="manager-layout">
        <Content className="manager-content">
          <Card className="manager-card">
            <Title level={3} className="manager-title">{managerTitle}</Title>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleLogin}
              style={{ maxWidth: 320 }}
              requiredMark={false}
            >
              <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Email vàlid requerit' }]}>
                <Input size="large" autoComplete="email" />
              </Form.Item>
              <Form.Item name="password" label="Contrasenya" rules={[{ required: true, message: 'Contrasenya requerida' }]}>
                <Input.Password size="large" autoComplete="current-password" />
              </Form.Item>
              <Form.Item>
                <Button size="large" type="primary" htmlType="submit" loading={submitting} block>
                  Accedir
                </Button>
              </Form.Item>
              {errorMessage && <Text type="danger">{errorMessage}</Text>}
            </Form>
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
            <Descriptions bordered column={3}>
              <Descriptions.Item label="Total convidats">{stats.totalGuests}</Descriptions.Item>
              <Descriptions.Item label="Confirmats"><Text type="success">{stats.confirmed}</Text></Descriptions.Item>
              <Descriptions.Item label="Rebutjats"><Text type="danger">{stats.declined}</Text></Descriptions.Item>
              <Descriptions.Item label="Pendents">{stats.pending}</Descriptions.Item>
              <Descriptions.Item label="Invitacions totals">{stats.totalInvitations}</Descriptions.Item>
              <Descriptions.Item label="Invitacions respostes">{stats.respondedInvitations}</Descriptions.Item>
            </Descriptions>
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
                <List.Item extra={attendingTag(g.attending)}>
                  <Space size={6}>
                    <Text>{g.name}</Text>
                    {!g.isPredefined && <Tag color="blue" style={{ fontSize: 11 }}>Afegit</Tag>}
                  </Space>
                </List.Item>
              )}
            />
          </Space>
        )}
      </Drawer>
    </Layout>
  );
};
