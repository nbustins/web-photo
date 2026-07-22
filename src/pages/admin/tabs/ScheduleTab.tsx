import { FC, useEffect, useMemo, useState } from 'react';
import {
  Alert, Badge, Button, Card, DatePicker, Form, Input, InputNumber, Modal, Popconfirm, Select,
  Space, Table, Tag, TimePicker, Typography, message,
} from 'antd';
import dayjs from 'dayjs';
import {
  BlockedPeriod, BookingSession, SessionGroup, Weekday, WeeklyAvailability,
  createAvailabilityRange, createBlockedPeriod, deleteAvailabilityRange, deleteBlockedPeriod,
  fetchAvailabilityRanges, fetchBlockedPeriods, fetchBookingSessions, fetchSessionGroups,
  fetchSessionTypes, upsertBookingSession,
} from '../../../services/booking/booking.admin.api';
import type { SessionType } from '../../../services/booking/booking.api';
import { WEEKDAYS_MON_FIRST, WEEKDAY_LABEL } from '../labels';
import { useApiError } from '../useApiError';

const { RangePicker } = DatePicker;
const { Text } = Typography;
const TIME_FMT = 'HH:mm';

export const ScheduleTab: FC = () => {
  const onError = useApiError();
  const [ranges, setRanges] = useState<WeeklyAvailability[]>([]);
  const [blocks, setBlocks] = useState<BlockedPeriod[]>([]);
  const [sessionTypes, setSessionTypes] = useState<SessionType[]>([]);
  const [groups, setGroups] = useState<SessionGroup[]>([]);
  const [bookingSessions, setBookingSessions] = useState<BookingSession[]>([]);
  const [loading, setLoading] = useState(false);

  // Buffer + bookable window live here, not in the catalog: they are agenda config (API spec 008).
  const [editingSession, setEditingSession] = useState<BookingSession | null>(null);
  const [sessionForm] = Form.useForm();

  // Ranges belong to one session type (API 001 §16); nothing is editable until one is picked.
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
  // new-range draft per weekday
  const [draft, setDraft] = useState<Partial<Record<Weekday, [dayjs.Dayjs, dayjs.Dayjs] | null>>>({});
  const [selectedDay, setSelectedDay] = useState<Weekday | null>(null);
  // new block draft
  const [blockRange, setBlockRange] = useState<{ from?: string; to?: string }>({});
  const [blockReason, setBlockReason] = useState('');

  // Session types repeat names across groups ("Estudi" in both Familiar and Smash Cake),
  // so the picker groups them by their session group.
  const typeOptions = useMemo(() => groups.map((g) => ({
    label: g.name,
    options: sessionTypes
      .filter((t) => t.sessionGroupId === g.id)
      .map((t) => ({ value: t.id, label: `${t.name}${t.isActive ? '' : ' (inactiu)'}` })),
  })).filter((g) => g.options.length > 0), [groups, sessionTypes]);

  const loadCatalog = async () => {
    try {
      const [t, g, b, s] = await Promise.all([
        fetchSessionTypes(), fetchSessionGroups(), fetchBlockedPeriods(), fetchBookingSessions(),
      ]);
      setSessionTypes(t);
      setGroups(g);
      setBlocks(b);
      setBookingSessions(s);
    } catch (err) {
      onError(err, 'No s\'ha pogut carregar el catàleg de sessions');
    }
  };

  const loadRanges = async (sessionTypeId: number) => {
    setLoading(true);
    try {
      setRanges(await fetchAvailabilityRanges(sessionTypeId));
    } catch (err) {
      onError(err, 'No s\'ha pogut carregar l\'horari');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCatalog();
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, []);

  useEffect(() => {
    if (selectedTypeId === null) { setRanges([]); return; }
    loadRanges(selectedTypeId);
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [selectedTypeId]);

  const reloadRanges = () => { if (selectedTypeId !== null) loadRanges(selectedTypeId); };

  const addRange = async (weekday: Weekday) => {
    const d = draft[weekday];
    if (!d || selectedTypeId === null) return;
    const [start, end] = d;
    if (!end.isAfter(start)) { message.error('L\'hora de fi ha de ser posterior a la d\'inici'); return; }
    try {
      await createAvailabilityRange({
        sessionTypeId: selectedTypeId,
        weekday,
        startTime: start.format('HH:mm:ss'),
        endTime: end.format('HH:mm:ss'),
      });
      setDraft((s) => ({ ...s, [weekday]: null }));
      reloadRanges();
    } catch (err) { onError(err); }
  };

  const removeRange = async (id: number) => {
    try { await deleteAvailabilityRange(id); reloadRanges(); } catch (err) { onError(err); }
  };

  const reloadBlocks = async () => {
    try { setBlocks(await fetchBlockedPeriods()); } catch (err) { onError(err); }
  };

  const addBlock = async () => {
    if (!blockRange.from || !blockRange.to) return;
    try {
      await createBlockedPeriod({ from: blockRange.from, to: blockRange.to, reason: blockReason || undefined });
      setBlockRange({});
      setBlockReason('');
      reloadBlocks();
    } catch (err) { onError(err); }
  };

  const removeBlock = async (id: number) => {
    try { await deleteBlockedPeriod(id); reloadBlocks(); } catch (err) { onError(err); }
  };

  const openSessionModal = (s: BookingSession) => {
    setEditingSession(s);
    sessionForm.setFieldsValue({
      bufferMinutes: s.bufferMinutes,
      window: s.bookableFrom || s.bookableTo
        ? [s.bookableFrom ? dayjs(s.bookableFrom) : null, s.bookableTo ? dayjs(s.bookableTo) : null]
        : null,
    });
  };

  const submitSession = async () => {
    if (!editingSession) return;
    const v = await sessionForm.validateFields();
    try {
      await upsertBookingSession(editingSession.sessionTypeId, {
        bufferMinutes: v.bufferMinutes,
        bookableFrom: v.window?.[0] ? v.window[0].format('YYYY-MM-DD') : null,
        bookableTo: v.window?.[1] ? v.window[1].format('YYYY-MM-DD') : null,
      });
      setEditingSession(null);
      loadCatalog();
    } catch (err) { onError(err); }
  };

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card size="small" title="Sessions a l'agenda">
        <Text type="secondary">
          Publicar un tipus al catàleg no el fa reservable: també ha d&apos;estar a l&apos;agenda,
          amb el seu marge entre sessions i, si escau, la seva temporada.
        </Text>
        <Table
          style={{ marginTop: 12 }}
          rowKey="sessionTypeId"
          size="small"
          pagination={false}
          dataSource={bookingSessions}
          columns={[
            { title: 'Tipus', dataIndex: 'sessionTypeName' },
            {
              title: 'A l\'agenda',
              dataIndex: 'onAgenda',
              render: (v: boolean) => v ? <Tag color="green">Sí</Tag> : <Tag color="red">No reservable</Tag>,
            },
            {
              title: 'Marge',
              render: (_, s) => s.onAgenda ? `${s.bufferMinutes} min` : '—',
            },
            {
              title: 'Temporada',
              render: (_, s) => !s.onAgenda ? '—'
                : s.bookableFrom || s.bookableTo ? `${s.bookableFrom ?? '…'} → ${s.bookableTo ?? '…'}` : 'Tot l\'any',
            },
            {
              title: '',
              render: (_, s) => (
                <Button size="small" type={s.onAgenda ? 'default' : 'primary'} onClick={() => openSessionModal(s)}>
                  {s.onAgenda ? 'Editar' : 'Posar a l\'agenda'}
                </Button>
              ),
            },
          ]}
        />
      </Card>

      <Card size="small" title="Horari setmanal per tipus de sessió" loading={loading}>
        <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }}>
          <Text type="secondary">
            Cada tipus de sessió té el seu propi horari. Una sessió només es pot reservar dins de les
            franges del seu tipus; una reserva confirmada bloqueja l&apos;hora per a tots els tipus.
          </Text>
          <Select
            style={{ width: '100%', maxWidth: 420 }}
            placeholder="Tria un tipus de sessió"
            options={typeOptions}
            value={selectedTypeId}
            onChange={(v) => { setSelectedTypeId(v); setSelectedDay(null); setDraft({}); }}
            showSearch
            optionFilterProp="label"
          />
        </Space>

        {selectedTypeId === null ? (
          <Alert type="info" showIcon message="Tria un tipus de sessió per veure i editar el seu horari." />
        ) : (
          <>
            {ranges.length === 0 && (
              <Alert
                type="warning"
                showIcon
                style={{ marginBottom: 12 }}
                message="Aquest tipus no té cap franja definida"
                description="Sense franges no s'ofereix cap hora reservable per a aquest tipus de sessió."
              />
            )}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {WEEKDAYS_MON_FIRST.map((wd) => {
                const count = ranges.filter((r) => r.weekday === wd).length;
                return (
                  <Badge key={wd} count={count} size="small" style={{ backgroundColor: '#7C7458' }}>
                    <Button
                      type={selectedDay === wd ? 'primary' : 'default'}
                      onClick={() => setSelectedDay((cur) => (cur === wd ? null : wd))}
                    >
                      {WEEKDAY_LABEL[wd]}
                    </Button>
                  </Badge>
                );
              })}
            </div>
          </>
        )}

        {selectedTypeId !== null && selectedDay && (
          <div style={{ marginTop: 20 }}>
            <Text strong>{WEEKDAY_LABEL[selectedDay]}</Text>
            <Space direction="vertical" style={{ width: '100%', marginTop: 8 }}>
              {ranges.filter((r) => r.weekday === selectedDay).length === 0 && (
                <Text type="secondary">Cap franja definida</Text>
              )}
              {ranges.filter((r) => r.weekday === selectedDay).map((r) => (
                <div key={r.id} style={{ display: 'grid', gridTemplateColumns: '120px 100px', gap: 8, alignItems: 'center' }}>
                  <Text>{r.startTime.slice(0, 5)} – {r.endTime.slice(0, 5)}</Text>
                  <Popconfirm title="Esborrar franja?" onConfirm={() => removeRange(r.id)}>
                    <Button size="small" danger block>Esborrar</Button>
                  </Popconfirm>
                </div>
              ))}
              <Space>
                <TimePicker.RangePicker
                  format={TIME_FMT}
                  minuteStep={15}
                  value={draft[selectedDay] ?? null}
                  onChange={(v) => setDraft((s) => ({ ...s, [selectedDay]: v as [dayjs.Dayjs, dayjs.Dayjs] | null }))}
                />
                <Button type="primary" onClick={() => addRange(selectedDay)}>Afegir franja</Button>
              </Space>
            </Space>
          </div>
        )}
      </Card>

      <Card size="small" title="Dies bloquejats">
        <Space wrap style={{ marginBottom: 12 }}>
          <RangePicker onChange={(_, ds) => setBlockRange({ from: ds?.[0] || undefined, to: ds?.[1] || undefined })} />
          <Input placeholder="Motiu (opcional)" value={blockReason} onChange={(e) => setBlockReason(e.target.value)} style={{ width: 220 }} />
          <Button type="primary" onClick={addBlock} disabled={!blockRange.from}>Bloquejar</Button>
        </Space>
        <Table
          rowKey="id"
          pagination={false}
          dataSource={blocks}
          columns={[
            { title: 'Des de', dataIndex: 'from' },
            { title: 'Fins a', dataIndex: 'to' },
            { title: 'Motiu', dataIndex: 'reason', render: (v?: string) => v || '—' },
            {
              title: '',
              render: (_, b) => (
                <Popconfirm title="Desbloquejar?" onConfirm={() => removeBlock(b.id)}>
                  <Button size="small" danger>Esborrar</Button>
                </Popconfirm>
              ),
            },
          ]}
        />
      </Card>

      <Modal
        open={editingSession !== null}
        title={editingSession?.sessionTypeName}
        onCancel={() => setEditingSession(null)}
        onOk={submitSession}
        okText="Desar"
      >
        <Form form={sessionForm} layout="vertical">
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
    </Space>
  );
};
