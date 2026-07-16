import { FC, useEffect, useState } from 'react';
import {
  Badge, Button, Card, DatePicker, Input, Popconfirm, Space, Table, TimePicker, Typography, message,
} from 'antd';
import dayjs from 'dayjs';
import {
  BlockedPeriod, Weekday, WeeklyAvailability,
  createAvailabilityRange, createBlockedPeriod, deleteAvailabilityRange, deleteBlockedPeriod,
  fetchAvailabilityRanges, fetchBlockedPeriods,
} from '../../../services/booking/booking.admin.api';
import { WEEKDAYS_MON_FIRST, WEEKDAY_LABEL } from '../labels';
import { useApiError } from '../useApiError';

const { RangePicker } = DatePicker;
const { Text } = Typography;
const TIME_FMT = 'HH:mm';

export const ScheduleTab: FC = () => {
  const onError = useApiError();
  const [ranges, setRanges] = useState<WeeklyAvailability[]>([]);
  const [blocks, setBlocks] = useState<BlockedPeriod[]>([]);
  const [loading, setLoading] = useState(false);

  // new-range draft per weekday
  const [draft, setDraft] = useState<Partial<Record<Weekday, [dayjs.Dayjs, dayjs.Dayjs] | null>>>({});
  const [selectedDay, setSelectedDay] = useState<Weekday | null>(null);
  // new block draft
  const [blockRange, setBlockRange] = useState<{ from?: string; to?: string }>({});
  const [blockReason, setBlockReason] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [r, b] = await Promise.all([fetchAvailabilityRanges(), fetchBlockedPeriods()]);
      setRanges(r);
      setBlocks(b);
    } catch (err) {
      onError(err, 'No s\'ha pogut carregar l\'horari');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const addRange = async (weekday: Weekday) => {
    const d = draft[weekday];
    if (!d) return;
    const [start, end] = d;
    if (!end.isAfter(start)) { message.error('L\'hora de fi ha de ser posterior a la d\'inici'); return; }
    try {
      await createAvailabilityRange({
        weekday,
        startTime: start.format('HH:mm:ss'),
        endTime: end.format('HH:mm:ss'),
      });
      setDraft((s) => ({ ...s, [weekday]: null }));
      load();
    } catch (err) { onError(err); }
  };

  const removeRange = async (id: number) => {
    try { await deleteAvailabilityRange(id); load(); } catch (err) { onError(err); }
  };

  const addBlock = async () => {
    if (!blockRange.from || !blockRange.to) return;
    try {
      await createBlockedPeriod({ from: blockRange.from, to: blockRange.to, reason: blockReason || undefined });
      setBlockRange({});
      setBlockReason('');
      load();
    } catch (err) { onError(err); }
  };

  const removeBlock = async (id: number) => {
    try { await deleteBlockedPeriod(id); load(); } catch (err) { onError(err); }
  };

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card size="small" title="Horari setmanal" loading={loading}>
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

        {selectedDay && (
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
    </Space>
  );
};
