import { FC, useEffect, useState } from 'react';
import { Layout, Card, Table, Tag, Typography, Input, Space, Descriptions, Empty, Button, Form } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { guestService } from '../../services/wedding';
import { login, logout } from '../../services/auth/auth.service';
import { getUser } from '../../services/auth/auth.store';
import type { Wedding, GuestWithConfirmation } from '../../model/wedding.types';
import './manager.css';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

type ManagerState = 'login' | 'loading' | 'error' | 'data';

interface LoginFormValues {
  email: string;
  password: string;
}

export const Manager: FC<{ slug: string }> = ({ slug }) => {
  const [state, setState] = useState<ManagerState>(() => (getUser() ? 'loading' : 'login'));
  const [wedding, setWedding] = useState<Wedding | null>(null);
  const [guests, setGuests] = useState<GuestWithConfirmation[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm<LoginFormValues>();

  useEffect(() => {
    guestService.getWeddingBySlug(slug).then(setWedding);
  }, [slug]);

  useEffect(() => {
    if (getUser()) {
      loadGuests();
    }
  }, []);

  const loadGuests = async () => {
    setState('loading');
    try {
      const data = await guestService.getGuestsWithConfirmations(slug);
      setGuests(data);
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

    if (!result.success) {
      setErrorMessage(result.error);
      return;
    }

    await loadGuests();
  };

  const handleLogout = () => {
    logout();
    setGuests([]);
    form.resetFields();
    setState('login');
  };

  const weddingTitle = wedding?.title ?? '';
  const managerTitle = weddingTitle ? `Gestió ${weddingTitle}` : 'Gestió';

  const getStats = () => {
    const total = guests.length;
    const confirmed = guests.filter(g => g.confirmation?.attending).length;
    const declined = guests.filter(g => g.confirmation && !g.confirmation.attending).length;
    const pending = guests.filter(g => !g.confirmation).length;
    const totalCompanions = guests
      .filter(g => g.confirmation?.attending)
      .reduce((sum, g) => sum + (g.confirmation?.companions_count || 0), 0);

    return { total, confirmed, declined, pending, totalCompanions };
  };

  const columns: ColumnsType<GuestWithConfirmation> = [
    {
      title: 'Convidat',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{name}</Text>
          {record.email && <Text type="secondary" style={{ fontSize: 12 }}>{record.email}</Text>}
        </Space>
      ),
    },
    {
      title: 'Estat',
      key: 'status',
      width: 120,
      render: (_, record) => {
        if (!record.confirmation) {
          return <Tag color="default">Pendent</Tag>;
        }
        return record.confirmation.attending
          ? <Tag color="success">Confirmat</Tag>
          : <Tag color="error">Rebutjat</Tag>;
      },
    },
    {
      title: 'Acompanyants',
      key: 'companions',
      width: 200,
      render: (_, record) => {
        if (!record.confirmation?.attending) {
          return <Text type="secondary">-</Text>;
        }
        if (record.companions.length === 0) {
          return <Text type="secondary">Cap</Text>;
        }
        return (
          <Space wrap>
            {record.companions.map((c, idx) => (
              <Tag key={idx}>{c.name}</Tag>
            ))}
          </Space>
        );
      },
    },
    {
      title: 'Notes',
      dataIndex: 'notes',
      key: 'notes',
      render: (_notes: string, record) => {
        if (!record.confirmation?.notes) {
          return <Text type="secondary">-</Text>;
        }
        return <Text type="secondary">{record.confirmation.notes}</Text>;
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
              <Form.Item
                name="email"
                label="Email"
                rules={[{ required: true, type: 'email', message: 'Email vàlid requerit' }]}
              >
                <Input size="large" autoComplete="email" />
              </Form.Item>
              <Form.Item
                name="password"
                label="Contrasenya"
                rules={[{ required: true, message: 'Contrasenya requerida' }]}
              >
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
          <Card className="manager-card">
            <Text>Carregant...</Text>
          </Card>
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
          <Button type="primary" onClick={handleLogout}>
            Tancar sessió
          </Button>
        </div>
      </Header>
      <Content className="manager-content">
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Card className="manager-stats-card">
            <Descriptions bordered column={5}>
              <Descriptions.Item label="Total convidats">{stats.total}</Descriptions.Item>
              <Descriptions.Item label="Confirmats">
                <Text type="success">{stats.confirmed}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Rebutjats">
                <Text type="danger">{stats.declined}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Pendents">{stats.pending}</Descriptions.Item>
              <Descriptions.Item label="Total assistents">
                {stats.confirmed + stats.totalCompanions}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card className="manager-table-card">
            {guests.length === 0 ? (
              <Empty description="No hi ha convidats" />
            ) : (
              <Table
                columns={columns}
                dataSource={guests}
                rowKey="id"
                pagination={{ pageSize: 10 }}
                locale={{ emptyText: 'No hi ha convidats' }}
              />
            )}
          </Card>
        </Space>
      </Content>
    </Layout>
  );
};
