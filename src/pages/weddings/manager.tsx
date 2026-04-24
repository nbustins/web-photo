import { FC, useEffect, useState } from 'react';
import { Layout, Card, Table, Tag, Typography, Space, Descriptions, Empty, Button, Form, Input } from 'antd';
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

const attendingTag = (attending: boolean | null) => {
  if (attending === null) return <Tag color="default">Pendent</Tag>;
  return attending ? <Tag color="success">Confirmat</Tag> : <Tag color="error">Rebutjat</Tag>;
};

export const Manager: FC<{ slug: string }> = ({ slug }) => {
  const [state, setState] = useState<ManagerState>(() => (getUser() ? 'loading' : 'login'));
  const [wedding, setWedding] = useState<Wedding | null>(null);
  const [rows, setRows] = useState<ConfirmationRow[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm<LoginFormValues>();

  useEffect(() => {
    guestService.getWeddingBySlug(slug).then(setWedding);
  }, [slug]);

  useEffect(() => {
    if (getUser()) loadData();
  }, []);

  const loadData = async () => {
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

  const getStats = () => {
    const totalGuests = rows.length;
    const confirmed = rows.filter(r => r.guestAttending === true).length;
    const declined = rows.filter(r => r.guestAttending === false).length;
    const pending = rows.filter(r => r.guestAttending === null).length;
    const invitationIds = new Set(rows.map(r => r.invitationId));
    const respondedIds = new Set(rows.filter(r => r.guestAttending !== null).map(r => r.invitationId));
    return { totalGuests, confirmed, declined, pending, totalInvitations: invitationIds.size, respondedInvitations: respondedIds.size };
  };

  const columns: ColumnsType<ConfirmationRow> = [
    {
      title: 'Invitació',
      key: 'invitation',
      render: (_, r) => (
        <Space direction="vertical" size={0}>
          <Text strong>{r.label}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>{r.inviteCode}</Text>
        </Space>
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
      render: (_, r) => r.notes
        ? <Text type="secondary">{r.notes}</Text>
        : <Text type="secondary">-</Text>,
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
          <Title level={3} style={{ margin: 0, color: '#fff' }}>{managerTitle}</Title>
          <Button type="primary" onClick={handleLogout}>Tancar sessió</Button>
        </div>
      </Header>
      <Content className="manager-content">
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
      </Content>
    </Layout>
  );
};
