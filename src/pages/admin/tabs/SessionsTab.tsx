import { FC, useEffect, useState } from 'react';
import {
  Alert, Button, Card, Empty, Form, Input, InputNumber, Modal, Popconfirm,
  Select, Space, Switch, Table, Tag,
} from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import {
  SessionGroup, SessionTypePayload,
  createSessionGroup, createSessionType, deleteSessionGroup, deleteSessionType,
  fetchSessionGroups, fetchSessionTypes, updateSessionGroup, updateSessionType,
} from '../../../services/booking/booking.admin.api';
import type { SessionType } from '../../../services/booking/booking.api';
import { useApiError } from '../useApiError';
import { FeaturesEditor } from '../components/FeaturesEditor';

const priceFormat = new Intl.NumberFormat('ca-ES', { style: 'currency', currency: 'EUR' });

export const SessionsTab: FC = () => {
  const onError = useApiError();
  const [groups, setGroups] = useState<SessionGroup[]>([]);
  const [types, setTypes] = useState<SessionType[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeGroup, setActiveGroup] = useState<string>();

  const [editingType, setEditingType] = useState<SessionType | null>(null);
  const [typeModalOpen, setTypeModalOpen] = useState(false);
  const [form] = Form.useForm();

  // Group create / rename share one dialog: both are just a name.
  const [groupDialog, setGroupDialog] = useState<{ mode: 'create' | 'rename'; group?: SessionGroup } | null>(null);
  const [groupName, setGroupName] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [g, t] = await Promise.all([fetchSessionGroups(), fetchSessionTypes()]);
      setGroups(g);
      setTypes(t);
      // Keep the selected tab if it survived the reload, otherwise fall back to the first group.
      setActiveGroup((current) =>
        current && g.some((x) => String(x.id) === current) ? current : g[0] ? String(g[0].id) : undefined);
    } catch (err) {
      onError(err, 'No s\'han pogut carregar les sessions');
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, []);

  const submitGroup = async () => {
    const name = groupName.trim();
    if (!name || !groupDialog) return;
    try {
      if (groupDialog.mode === 'create') {
        const created = await createSessionGroup(name);
        setActiveGroup(String(created.id));
      } else if (groupDialog.group) {
        await updateSessionGroup(groupDialog.group.id, name);
      }
      setGroupDialog(null);
      load();
    } catch (err) { onError(err); }
  };

  const removeGroup = (g: SessionGroup) => {
    Modal.confirm({
      title: `Esborrar el grup "${g.name}"?`,
      content: 'Només es pot esborrar si no té cap tipus de sessió.',
      okText: 'Esborrar',
      okButtonProps: { danger: true },
      cancelText: 'Cancel·lar',
      onOk: async () => {
        try { await deleteSessionGroup(g.id); load(); }
        catch (err) { onError(err, 'No es pot esborrar un grup amb tipus associats'); }
      },
    });
  };

  const openTypeModal = (t: SessionType | null) => {
    setEditingType(t);
    form.setFieldsValue(t
      ? { ...t, features: [...t.features] }
      : {
          isActive: true,
          durationMinutes: 60,
          price: 0,
          features: [],
          sessionGroupId: activeGroup ? Number(activeGroup) : undefined,
        });
    setTypeModalOpen(true);
  };

  const submitType = async () => {
    const v = await form.validateFields();
    const payload: SessionTypePayload = {
      sessionGroupId: v.sessionGroupId,
      name: v.name,
      durationMinutes: v.durationMinutes,
      isActive: v.isActive,
      price: v.price,
      adviceText: v.adviceText?.trim() ? v.adviceText.trim() : null,
      // Blank rows are an editing artefact, not content.
      features: (v.features ?? []).map((x: string) => x.trim()).filter(Boolean),
    };
    try {
      if (editingType) await updateSessionType(editingType.id, payload);
      else await createSessionType(payload);
      setTypeModalOpen(false);
      // A type can be moved to another group from the modal; follow it there.
      setActiveGroup(String(payload.sessionGroupId));
      load();
    } catch (err) { onError(err); }
  };

  const removeType = async (t: SessionType) => {
    try { await deleteSessionType(t.id); load(); }
    catch (err) { onError(err); }
  };

  const typesTable = (groupId: number) => (
    <Table
      rowKey="id"
      loading={loading}
      pagination={false}
      dataSource={types.filter((t) => t.sessionGroupId === groupId)}
      locale={{ emptyText: <Empty description="Cap tipus de sessió en aquest grup" /> }}
      columns={[
        { title: 'Nom', dataIndex: 'name' },
        { title: 'Durada', dataIndex: 'durationMinutes', render: (v: number) => `${v} min` },
        { title: 'Preu', dataIndex: 'price', render: (v: number) => priceFormat.format(v) },
        { title: 'Features', dataIndex: 'features', render: (v: string[]) => v.length },
        { title: 'Publicat', dataIndex: 'isActive', render: (v: boolean) => v ? <Tag color="green">Sí</Tag> : <Tag>No</Tag> },
        {
          title: '',
          render: (_, t) => (
            <Space>
              <Button size="small" onClick={() => openTypeModal(t)}>Editar</Button>
              <Popconfirm title="Retirar del catàleg? Deixarà de sortir al web." onConfirm={() => removeType(t)}>
                <Button size="small" danger>Retirar</Button>
              </Popconfirm>
            </Space>
          ),
        },
      ]}
    />
  );

  const current = groups.find((g) => String(g.id) === activeGroup);

  const addGroupButton = (
    <Button icon={<PlusOutlined />} onClick={() => { setGroupName(''); setGroupDialog({ mode: 'create' }); }}>
      Nou grup
    </Button>
  );

  return (
    <>
      {/* Card's own tabs: the group bar sits in the card head and the list in its body, so the
          whole thing reads as one surface instead of a tab strip floating above a separate box. */}
      <Card
        loading={loading && groups.length === 0}
        tabList={groups.map((g) => ({ key: String(g.id), tab: g.name }))}
        activeTabKey={activeGroup}
        onTabChange={setActiveGroup}
        tabBarExtraContent={groups.length > 0 ? addGroupButton : undefined}
        title={groups.length === 0 ? 'Grups de sessions' : undefined}
        extra={groups.length === 0 ? addGroupButton : undefined}
      >
        {current ? (
          <>
            <Space style={{ marginBottom: 12, width: '100%', justifyContent: 'flex-end' }}>
              <Button
                size="small"
                icon={<EditOutlined />}
                onClick={() => { setGroupName(current.name); setGroupDialog({ mode: 'rename', group: current }); }}
              >
                Reanomenar
              </Button>
              <Button size="small" danger icon={<DeleteOutlined />} onClick={() => removeGroup(current)}>
                Esborrar grup
              </Button>
              <Button type="primary" size="small" onClick={() => openTypeModal(null)}>Nou tipus</Button>
            </Space>
            {typesTable(current.id)}
          </>
        ) : (
          <Alert
            type="info"
            showIcon
            message="Encara no hi ha cap grup"
            description="Els grups són les pàgines de servei del web (Recent Nascut, Embaràs…). Crea'n un amb «Nou grup»."
          />
        )}
      </Card>

      <Modal
        open={groupDialog !== null}
        title={groupDialog?.mode === 'rename' ? 'Reanomenar grup' : 'Nou grup'}
        onCancel={() => setGroupDialog(null)}
        onOk={submitGroup}
        okText="Desar"
        okButtonProps={{ disabled: !groupName.trim() }}
      >
        <Input
          autoFocus
          placeholder="Nom del grup"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          onPressEnter={submitGroup}
        />
      </Modal>

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
          <Form.Item name="price" label="Preu (€)" rules={[{ required: true }]}>
            <InputNumber min={0} precision={2} decimalSeparator="," style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="features" label="Què inclou">
            <FeaturesEditor />
          </Form.Item>
          <Form.Item name="adviceText" label="Nota al peu (opcional)" extra="L'asterisc el posa el web, no cal escriure'l.">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="isActive" label="Publicat al web" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
