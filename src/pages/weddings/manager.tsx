import { FC, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Layout, Card, Table, Tag, Typography, Input, Space, Descriptions, Empty, Button } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { guestService } from '../../services/wedding';
import type { Wedding, GuestWithConfirmation } from '../../model/wedding.types';
import './manager.css';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

type ManagerState = 'enter-code' | 'loading' | 'error' | 'data';

export const Manager: FC<{ slug: string }> = ({ slug }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [state, setState] = useState<ManagerState>('enter-code');
  const [wedding, setWedding] = useState<Wedding | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [guests, setGuests] = useState<GuestWithConfirmation[]>([]);
  const [errorMessage, setErrorMessage] = useState('');

  const code = searchParams.get('code');

  useEffect(() => {
    guestService.getWeddingBySlug(slug).then(setWedding);
  }, []);

  useEffect(() => {
    if (code) {
      loadGuests(code);
    } else {
      setState('enter-code');
    }
  }, [code]);

  const loadGuests = async (managerCode: string) => {
    setState('loading');
    try {
      const data = await guestService.getGuestsWithConfirmations(slug, managerCode);
      setGuests(data);
      setState('data');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Error desconegut');
      setState('error');
    }
  };

  const handleCodeSubmit = () => {
    if (manualCode.trim()) {
      setSearchParams({ code: manualCode.trim().toUpperCase() });
    }
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
          <Text type="secondary" style={{ fontSize: 12 }}>{record.email}</Text>
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

  if (state === 'enter-code' || state === 'error') {
    return (
      <Layout className="manager-layout">
        <Content className="manager-content">
          <Card className="manager-card">
            <Title level={3} className="manager-title">{managerTitle}</Title>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <Text>Introdueix el codi de gestor per accedir</Text>
              <Space.Compact style={{ width: '100%', maxWidth: 300 }}>
                <Input.Password
                  size="large"
                  placeholder="Codi de gestor"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                  onPressEnter={handleCodeSubmit}
                />
                <Button size="large" type="primary" onClick={handleCodeSubmit}>
                  Accedir
                </Button>
              </Space.Compact>
              {state === 'error' && (
                <Text type="danger">{errorMessage}</Text>
              )}
            </Space>
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
          <Button type="primary" onClick={() => setSearchParams({})}>
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
