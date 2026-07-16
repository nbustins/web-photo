import { FC, useCallback, useEffect, useState } from 'react';
import { Button, DatePicker, Descriptions, Drawer, Select, Space, Table, Tag, message } from 'antd';
import {
  AdminBooking,
  BookingStatus,
  fetchBookings,
  fetchSessionTypes,
  resendBookingEmail,
  updateBookingStatus,
} from '../../../services/booking/booking.admin.api';
import { STATUS_COLOR, STATUS_LABEL, STATUS_TRANSITIONS, IMAGE_RIGHTS_LABEL, formatInstant } from '../labels';
import { useApiError } from '../useApiError';

const { RangePicker } = DatePicker;

const STATUS_OPTIONS = (Object.keys(STATUS_LABEL) as BookingStatus[]).map((s) => ({
  value: s,
  label: STATUS_LABEL[s],
}));

export const BookingsTab: FC = () => {
  const onError = useApiError();
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [typeNames, setTypeNames] = useState<Record<number, string>>({});
  const [status, setStatus] = useState<BookingStatus | undefined>('Requested');
  const [range, setRange] = useState<{ from?: string; to?: string }>({});
  const [selected, setSelected] = useState<AdminBooking | null>(null);
  const [acting, setActing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchBookings({ status, from: range.from, to: range.to });
      setBookings(data);
    } catch (err) {
      onError(err, 'No s\'han pogut carregar les reserves');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, range.from, range.to]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    fetchSessionTypes()
      .then((types) => setTypeNames(Object.fromEntries(types.map((t) => [t.id, t.name]))))
      .catch((err) => onError(err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const changeStatus = async (booking: AdminBooking, next: BookingStatus) => {
    setActing(true);
    try {
      const updated = await updateBookingStatus(booking.id, next);
      message.success(`Estat actualitzat a ${STATUS_LABEL[next]}`);
      setSelected(updated);
      load();
    } catch (err) {
      onError(err, 'No s\'ha pogut canviar l\'estat');
      load();
    } finally {
      setActing(false);
    }
  };

  const resend = async (booking: AdminBooking, kind: 'requested' | 'confirmed') => {
    setActing(true);
    try {
      const res = await resendBookingEmail(booking.id, kind);
      if (res.delivered) message.success('Email reenviat');
      else message.warning('No s\'ha pogut enviar l\'email');
    } catch (err) {
      onError(err, 'No s\'ha pogut enviar l\'email');
    } finally {
      setActing(false);
    }
  };

  return (
    <div>
      <Space wrap style={{ marginBottom: 16 }}>
        <Select
          allowClear
          placeholder="Estat"
          style={{ width: 180 }}
          value={status}
          options={STATUS_OPTIONS}
          onChange={(v) => setStatus(v)}
        />
        <RangePicker
          onChange={(_, ds) => setRange({ from: ds?.[0] || undefined, to: ds?.[1] || undefined })}
        />
        <Button onClick={load}>Actualitzar</Button>
      </Space>

      <Table
        rowKey="id"
        loading={loading}
        dataSource={bookings}
        onRow={(record) => ({ onClick: () => setSelected(record), style: { cursor: 'pointer' } })}
        columns={[
          { title: 'Data', dataIndex: 'startAt', render: (v: string) => formatInstant(v) },
          { title: 'Sessió', dataIndex: 'sessionTypeId', render: (id: number) => typeNames[id] ?? `#${id}` },
          { title: 'Reserva', dataIndex: 'clientName' },
          {
            title: 'Estat',
            dataIndex: 'status',
            render: (s: BookingStatus) => <Tag color={STATUS_COLOR[s]}>{STATUS_LABEL[s]}</Tag>,
          },
        ]}
      />

      <Drawer
        width={480}
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected ? `Reserva #${selected.id}` : ''}
      >
        {selected && (
          <>
            <Space wrap style={{ marginBottom: 16 }}>
              {STATUS_TRANSITIONS[selected.status].map((next) => (
                <Button key={next} type="primary" loading={acting} onClick={() => changeStatus(selected, next)}>
                  → {STATUS_LABEL[next]}
                </Button>
              ))}
              <Button loading={acting} onClick={() => resend(selected, 'requested')}>Reenviar sol·licitud</Button>
              <Button loading={acting} onClick={() => resend(selected, 'confirmed')}>Reenviar confirmació</Button>
            </Space>

            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="Estat">
                <Tag color={STATUS_COLOR[selected.status]}>{STATUS_LABEL[selected.status]}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Sessió">{typeNames[selected.sessionTypeId] ?? `#${selected.sessionTypeId}`}</Descriptions.Item>
              <Descriptions.Item label="Inici">{formatInstant(selected.startAt)}</Descriptions.Item>
              <Descriptions.Item label="Fi">{formatInstant(selected.endAt)}</Descriptions.Item>
              <Descriptions.Item label="Nom">{selected.clientName}</Descriptions.Item>
              <Descriptions.Item label="Email">{selected.clientEmail || '—'}</Descriptions.Item>
              <Descriptions.Item label="Telèfon">{selected.clientPhone}</Descriptions.Item>
              <Descriptions.Item label="DNI">{selected.dni}</Descriptions.Item>
              <Descriptions.Item label="Adreça">{selected.address}</Descriptions.Item>
              <Descriptions.Item label="Drets d'imatge">{IMAGE_RIGHTS_LABEL[selected.imageRights]}</Descriptions.Item>
              <Descriptions.Item label="Participants">
                {selected.participants.map((p) => `${p.name}${p.age != null ? ` (${p.age})` : ''}`).join(', ') || '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Notes">{selected.notes || '—'}</Descriptions.Item>
              <Descriptions.Item label="Token">{selected.confirmationToken}</Descriptions.Item>
            </Descriptions>
          </>
        )}
      </Drawer>
    </div>
  );
};
