import { FC, useEffect, useState } from 'react';
import {
  Alert, Card, DatePicker, Divider, Empty, Form, Input, InputNumber, Modal, Popconfirm,
  Select, Space, Switch, Table, Tag,
} from 'antd';
import dayjs from 'dayjs';
import {
  BookingSession, SessionGroup, SessionTypePayload,
  createSessionGroup, createSessionType, deleteSessionGroup, deleteSessionType,
  fetchBookingSessions, fetchSessionGroups, fetchSessionTypes, updateSessionGroup,
  updateSessionType, upsertBookingSession,
} from '../../../services/booking/booking.admin.api';
import type { SessionType } from '../../../services/booking/booking.api';
import { useApiError } from '../useApiError';
import { FeaturesEditor } from '../components/FeaturesEditor';
import { IconButton } from '../icons';

const { RangePicker } = DatePicker;

const priceFormat = new Intl.NumberFormat('ca-ES', { style: 'currency', currency: 'EUR' });

export const SessionsTab: FC = () => {
  const onError = useApiError();
  const [groups, setGroups] = useState<SessionGroup[]>([]);
  const [types, setTypes] = useState<SessionType[]>([]);
  // The API splits a session in two (catalog + agenda, specs 007/008). That boundary is ours,
  // not the user's: here they are one row and one dialog.
  const [agenda, setAgenda] = useState<Record<number, BookingSession>>({});
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
      const [g, t, a] = await Promise.all([fetchSessionGroups(), fetchSessionTypes(), fetchBookingSessions()]);
      setGroups(g);
      setTypes(t);
      setAgenda(Object.fromEntries(a.map((s) => [s.sessionTypeId, s])));
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
    const booking = t ? agenda[t.id] : undefined;
    form.setFieldsValue(t
      ? {
          ...t,
          features: [...t.features],
          bufferMinutes: booking?.bufferMinutes ?? 0,
          window: booking?.bookableFrom || booking?.bookableTo
            ? [booking.bookableFrom ? dayjs(booking.bookableFrom) : null,
               booking.bookableTo ? dayjs(booking.bookableTo) : null]
            : null,
        }
      : {
          bufferMinutes: 0,
          window: null,
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
      const saved = editingType
        ? await updateSessionType(editingType.id, payload)
        : await createSessionType(payload);

      // Second call, because the agenda side lives in another module. A failure here leaves the
      // type published but not bookable — the table says so rather than hiding it.
      await upsertBookingSession(saved.id, {
        bufferMinutes: v.bufferMinutes ?? 0,
        bookableFrom: v.window?.[0] ? v.window[0].format('YYYY-MM-DD') : null,
        bookableTo: v.window?.[1] ? v.window[1].format('YYYY-MM-DD') : null,
      });

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
          title: 'Marge',
          render: (_, t) => agenda[t.id] ? `${agenda[t.id].bufferMinutes} min` : <Tag color="red">No reservable</Tag>,
        },
        {
          title: 'Temporada',
          render: (_, t) => {
            const a = agenda[t.id];
            if (!a) return '—';
            return a.bookableFrom || a.bookableTo ? `${a.bookableFrom ?? '…'} → ${a.bookableTo ?? '…'}` : 'Tot l\'any';
          },
        },
        {
          title: '',
          render: (_, t) => (
            <Space>
              <IconButton icon="edit" label="Editar" size="small" onClick={() => openTypeModal(t)} />
              <Popconfirm title="Retirar del catàleg? Deixarà de sortir al web." onConfirm={() => removeType(t)}>
                <IconButton icon="retire" label="Retirar del catàleg" size="small" danger />
              </Popconfirm>
            </Space>
          ),
        },
      ]}
    />
  );

  const current = groups.find((g) => String(g.id) === activeGroup);

  const addGroupButton = (
    <IconButton
      icon="create"
      label="Nou grup"
      onClick={() => { setGroupName(''); setGroupDialog({ mode: 'create' }); }}
    />
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
              <IconButton
                icon="edit"
                label="Reanomenar grup"
                size="small"
                onClick={() => { setGroupName(current.name); setGroupDialog({ mode: 'rename', group: current }); }}
              />
              <IconButton icon="remove" label="Esborrar grup" size="small" danger onClick={() => removeGroup(current)} />
              <IconButton icon="create" label="Nou tipus de sessió" type="primary" size="small" onClick={() => openTypeModal(null)} />
            </Space>
            {typesTable(current.id)}
          </>
        ) : (
          <Alert
            type="info"
            showIcon
            message="Encara no hi ha cap grup"
            description="Els grups són les pàgines de servei del web (Recent Nascut, Embaràs…). Crea'n un amb el botó +."
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

          <Divider orientation="left" plain>Agenda</Divider>
          <Form.Item
            name="bufferMinutes"
            label="Marge entre sessions (min)"
            rules={[{ required: true }]}
            extra="Temps que queda ocupat després de la sessió. El client no el veu."
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="window" label="Temporada (opcional)" extra="Buit = reservable tot l'any.">
            <RangePicker style={{ width: '100%' }} allowEmpty={[true, true]} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
