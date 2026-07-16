import { FC, useEffect, useState } from 'react';
import {
  Button, Card, DatePicker, Form, Input, InputNumber, Modal, Popconfirm,
  Select, Space, Switch, Table, Tag,
} from 'antd';
import dayjs from 'dayjs';
import {
  SessionGroup, SessionTypePayload,
  createSessionGroup, createSessionType, deleteSessionGroup, deleteSessionType,
  fetchSessionGroups, fetchSessionTypes, updateSessionGroup, updateSessionType,
} from '../../../services/booking/booking.admin.api';
import type { SessionType } from '../../../services/booking/booking.api';
import { useApiError } from '../useApiError';

export const SessionsTab: FC = () => {
  const onError = useApiError();
  const [groups, setGroups] = useState<SessionGroup[]>([]);
  const [types, setTypes] = useState<SessionType[]>([]);
  const [loading, setLoading] = useState(false);

  const [newGroup, setNewGroup] = useState('');
  const [editingType, setEditingType] = useState<SessionType | null>(null);
  const [typeModalOpen, setTypeModalOpen] = useState(false);
  const [form] = Form.useForm();

  const load = async () => {
    setLoading(true);
    try {
      const [g, t] = await Promise.all([fetchSessionGroups(), fetchSessionTypes()]);
      setGroups(g);
      setTypes(t);
    } catch (err) {
      onError(err, 'No s\'han pogut carregar les sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const addGroup = async () => {
    if (!newGroup.trim()) return;
    try {
      await createSessionGroup(newGroup.trim());
      setNewGroup('');
      load();
    } catch (err) { onError(err); }
  };

  const renameGroup = async (g: SessionGroup, name: string) => {
    if (!name.trim() || name === g.name) return;
    try { await updateSessionGroup(g.id, name.trim()); load(); } catch (err) { onError(err); }
  };

  const removeGroup = async (g: SessionGroup) => {
    try { await deleteSessionGroup(g.id); load(); }
    catch (err) { onError(err, 'No es pot esborrar un grup amb tipus associats'); }
  };

  const openTypeModal = (t: SessionType | null) => {
    setEditingType(t);
    form.setFieldsValue(t
      ? {
          ...t,
          availableFrom: t.availableFrom ? dayjs(t.availableFrom) : null,
          availableTo: t.availableTo ? dayjs(t.availableTo) : null,
        }
      : { isActive: true, bufferMinutes: 0, durationMinutes: 60 });
    setTypeModalOpen(true);
  };

  const submitType = async () => {
    const v = await form.validateFields();
    const payload: SessionTypePayload = {
      sessionGroupId: v.sessionGroupId,
      name: v.name,
      durationMinutes: v.durationMinutes,
      bufferMinutes: v.bufferMinutes,
      isActive: v.isActive,
      availableFrom: v.availableFrom ? v.availableFrom.format('YYYY-MM-DD') : null,
      availableTo: v.availableTo ? v.availableTo.format('YYYY-MM-DD') : null,
    };
    try {
      if (editingType) await updateSessionType(editingType.id, payload);
      else await createSessionType(payload);
      setTypeModalOpen(false);
      load();
    } catch (err) { onError(err); }
  };

  const removeType = async (t: SessionType) => {
    try { await deleteSessionType(t.id); load(); }
    catch (err) { onError(err, 'No es pot esborrar un tipus amb reserves'); }
  };

  const groupName = (id: number) => groups.find((g) => g.id === id)?.name ?? `#${id}`;

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card size="small" title="Grups">
        <Space direction="vertical" style={{ width: '100%' }}>
          {groups.map((g) => (
            <Space key={g.id}>
              <Input
                defaultValue={g.name}
                style={{ width: 240 }}
                onBlur={(e) => renameGroup(g, e.target.value)}
              />
              <Popconfirm title="Esborrar grup?" onConfirm={() => removeGroup(g)}>
                <Button danger size="small">Esborrar</Button>
              </Popconfirm>
            </Space>
          ))}
          <Space>
            <Input placeholder="Nou grup" value={newGroup} style={{ width: 240 }} onChange={(e) => setNewGroup(e.target.value)} onPressEnter={addGroup} />
            <Button type="primary" onClick={addGroup}>Afegir</Button>
          </Space>
        </Space>
      </Card>

      <Card
        size="small"
        title="Tipus de sessió"
        extra={<Button type="primary" onClick={() => openTypeModal(null)} disabled={groups.length === 0}>Nou tipus</Button>}
      >
        <Table
          rowKey="id"
          loading={loading}
          pagination={false}
          dataSource={types}
          columns={[
            { title: 'Nom', dataIndex: 'name' },
            { title: 'Grup', dataIndex: 'sessionGroupId', render: groupName },
            { title: 'Durada', dataIndex: 'durationMinutes', render: (v: number) => `${v} min` },
            { title: 'Buffer', dataIndex: 'bufferMinutes', render: (v: number) => `${v} min` },
            { title: 'Actiu', dataIndex: 'isActive', render: (v: boolean) => v ? <Tag color="green">Sí</Tag> : <Tag>No</Tag> },
            {
              title: 'Temporada',
              render: (_, t) => t.availableFrom || t.availableTo ? `${t.availableFrom ?? '…'} → ${t.availableTo ?? '…'}` : 'Sempre',
            },
            {
              title: '',
              render: (_, t) => (
                <Space>
                  <Button size="small" onClick={() => openTypeModal(t)}>Editar</Button>
                  <Popconfirm title="Esborrar tipus?" onConfirm={() => removeType(t)}>
                    <Button size="small" danger>Esborrar</Button>
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
        />
      </Card>

      <Modal
        open={typeModalOpen}
        title={editingType ? 'Editar tipus' : 'Nou tipus'}
        onCancel={() => setTypeModalOpen(false)}
        onOk={submitType}
        okText="Desar"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Nom" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="sessionGroupId" label="Grup" rules={[{ required: true }]}>
            <Select options={groups.map((g) => ({ value: g.id, label: g.name }))} />
          </Form.Item>
          <Form.Item name="durationMinutes" label="Durada (min)" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="bufferMinutes" label="Buffer (min)" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="isActive" label="Actiu" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="availableFrom" label="Disponible des de (opcional)">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="availableTo" label="Disponible fins a (opcional)">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
};
