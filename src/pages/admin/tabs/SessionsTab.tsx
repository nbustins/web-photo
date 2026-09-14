import { FC, useEffect, useState } from 'react';
import {
  Alert, App, Button, DatePicker, Divider, Drawer, Empty, Form, Input, InputNumber, Modal,
  Popconfirm, Select, Space, Spin, Switch, Tag,
} from 'antd';
import { useIsMobile } from '@ui/hooks/useIsMobile';
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
import { PageHeader } from '../components/PageHeader';
import { AdminIcons, IconButton } from '../icons';
import styles from '../admin.module.css';

const { RangePicker } = DatePicker;

const priceFormat = new Intl.NumberFormat('ca-ES', { style: 'currency', currency: 'EUR' });

export const SessionsTab: FC = () => {
  const { modal } = App.useApp();
  const onError = useApiError();
  const isMobile = useIsMobile();
  const [groups, setGroups] = useState<SessionGroup[]>([]);
  const [types, setTypes] = useState<SessionType[]>([]);
  // The API splits a session in two (catalog + agenda, specs 007/008). That boundary is ours,
  // not the user's: here they are one card and one dialog.
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
      // Keep the selected group if it survived the reload, otherwise fall back to the first one.
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
    modal.confirm({
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
      // type published but not bookable — the card says so rather than hiding it.
      await upsertBookingSession(saved.id, {
        bufferMinutes: v.bufferMinutes ?? 0,
        bookableFrom: v.window?.[0] ? v.window[0].format('YYYY-MM-DD') : null,
        bookableTo: v.window?.[1] ? v.window[1].format('YYYY-MM-DD') : null,
      });

      setTypeModalOpen(false);
      // A type can be moved to another group from the drawer; follow it there.
      setActiveGroup(String(payload.sessionGroupId));
      load();
    } catch (err) { onError(err); }
  };

  const removeType = async (t: SessionType) => {
    try { await deleteSessionType(t.id); load(); }
    catch (err) { onError(err); }
  };

  const current = groups.find((g) => String(g.id) === activeGroup);
  const currentTypes = current ? types.filter((t) => t.sessionGroupId === current.id) : [];
  const typeCount = (g: SessionGroup) => types.filter((t) => t.sessionGroupId === g.id).length;
  const newGroup = () => { setGroupName(''); setGroupDialog({ mode: 'create' }); };

  const season = (t: SessionType) => {
    const a = agenda[t.id];
    if (!a) return '—';
    return a.bookableFrom || a.bookableTo ? `${a.bookableFrom ?? '…'} → ${a.bookableTo ?? '…'}` : 'Tot l\'any';
  };

  const groupNav = isMobile ? (
    <div className={styles.chips}>
      {groups.map((g) => {
        const active = String(g.id) === activeGroup;
        return (
          <button
            key={g.id}
            type="button"
            aria-pressed={active}
            className={active ? `${styles.chip} ${styles.chipActive}` : styles.chip}
            onClick={() => setActiveGroup(String(g.id))}
          >
            {g.name}
          </button>
        );
      })}
      <button type="button" className={styles.chip} onClick={newGroup}>+ Nou grup</button>
    </div>
  ) : (
    <aside className={styles.groupPanel}>
      <span className={styles.caption}>Grups</span>
      {groups.length > 0 && (
        <div className={`${styles.surface} ${styles.groupList}`}>
          {groups.map((g) => {
            const active = String(g.id) === activeGroup;
            return (
              <button
                key={g.id}
                type="button"
                aria-current={active || undefined}
                className={active ? `${styles.groupItem} ${styles.groupItemActive}` : styles.groupItem}
                onClick={() => setActiveGroup(String(g.id))}
              >
                <span>{g.name}</span>
                <span className={styles.muted}>{typeCount(g)}</span>
              </button>
            );
          })}
        </div>
      )}
      <button type="button" className={styles.addDashed} onClick={newGroup}>
        <AdminIcons.create /> Nou grup
      </button>
      <p className={styles.hint}>Cada grup és una pàgina de servei del web (Recent Nascut, Embaràs…).</p>
    </aside>
  );

  const typeCard = (t: SessionType) => {
    const a = agenda[t.id];
    return (
      <article key={t.id} className={`${styles.surface} ${styles.typeCard}`}>
        <div className={styles.cardHead}>
          <h3 className={styles.cardTitle}>{t.name}</h3>
          {t.isActive ? <Tag color="green">Publicat</Tag> : <Tag>No publicat</Tag>}
        </div>
        <span className={styles.price}>{priceFormat.format(t.price)}</span>
        <dl className={styles.facts}>
          <div><dt>Durada</dt><dd>{t.durationMinutes} min</dd></div>
          <div><dt>Marge</dt><dd>{a ? `${a.bufferMinutes} min` : <Tag color="red">No reservable</Tag>}</dd></div>
          <div><dt>Temporada</dt><dd>{season(t)}</dd></div>
          <div><dt>Inclou</dt><dd>{t.features.length} {t.features.length === 1 ? 'element' : 'elements'}</dd></div>
        </dl>
        <div className={styles.cardFooter}>
          <IconButton icon="edit" label="Editar" onClick={() => openTypeModal(t)} />
          <Popconfirm title="Retirar del catàleg? Deixarà de sortir al web." onConfirm={() => removeType(t)}>
            <IconButton icon="retire" label="Retirar del catàleg" danger />
          </Popconfirm>
        </div>
      </article>
    );
  };

  return (
    <>
      <PageHeader
        title="Sessions"
        actions={[{ label: 'Nou tipus', icon: 'create', primary: true, onClick: () => openTypeModal(null) }]}
      />
      <div className={styles.body}>
        <div className={styles.split}>
          {groupNav}
          <div className={styles.splitMain}>
            {current && (
              <div className={styles.sectionHead}>
                <h2 className={styles.sectionTitle}>{current.name}</h2>
                <IconButton
                  icon="edit"
                  label="Reanomenar grup"
                  onClick={() => { setGroupName(current.name); setGroupDialog({ mode: 'rename', group: current }); }}
                />
                <IconButton icon="remove" label="Esborrar grup" danger onClick={() => removeGroup(current)} />
              </div>
            )}
            <Spin spinning={loading}>
              {!current ? (
                !loading && (
                  <Alert
                    type="info"
                    showIcon
                    message="Encara no hi ha cap grup"
                    description="Els grups són les pàgines de servei del web (Recent Nascut, Embaràs…). Crea'n un amb «Nou grup»."
                  />
                )
              ) : currentTypes.length === 0 ? (
                <Empty className={styles.empty} description="Cap tipus de sessió en aquest grup" />
              ) : (
                <div className={styles.cardGrid}>{currentTypes.map(typeCard)}</div>
              )}
            </Spin>
          </div>
        </div>
      </div>

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

      <Drawer
        width={isMobile ? '100%' : 480}
        open={typeModalOpen}
        title={editingType ? 'Editar tipus' : 'Nou tipus'}
        onClose={() => setTypeModalOpen(false)}
        footer={
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={() => setTypeModalOpen(false)}>Cancel·lar</Button>
            <Button type="primary" onClick={submitType}>Desar</Button>
          </Space>
        }
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
      </Drawer>
    </>
  );
};
