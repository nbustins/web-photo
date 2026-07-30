import { FC, useCallback, useEffect, useState } from 'react';
import { Button, Collapse, DatePicker, Descriptions, Drawer, Popconfirm, Select, Space, Table, Tag, Typography, message } from 'antd';
import { AdminIcons, IconButton } from '../icons';
import { ResendEmailButtons } from '../components/ResendEmailButtons';
import {
  AdminBooking,
  BookingStatus,
  fetchAdminContractPdf,
  fetchBookings,
  fetchSessionGroups,
  fetchSessionTypes,
  resendBookingEmail,
  updateBookingStatus,
} from '../../../services/booking/booking.admin.api';
import { sessionDisplayName } from '../../../services/booking/booking.api';
import { bookingContractPath } from '../../../model/routes.model';
import { STATUS_ACTION_LABEL, STATUS_COLOR, STATUS_CONFIRM, STATUS_LABEL, STATUS_TRANSITIONS, IMAGE_RIGHTS_LABEL, formatInstant } from '../labels';
import { useApiError } from '../useApiError';

const { RangePicker } = DatePicker;

// The app is a HashRouter SPA, so the shareable link carries the route after the '#'.
const contractLink = (token: string) =>
  `${window.location.origin}${window.location.pathname}#${bookingContractPath(token)}`;

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

  // A type is named by its group plus its own name: "Bàsica editada" alone is ambiguous.
  useEffect(() => {
    Promise.all([fetchSessionTypes(), fetchSessionGroups()])
      .then(([types, groups]) => {
        const groupNames = Object.fromEntries(groups.map((g) => [g.id, g.name]));
        setTypeNames(Object.fromEntries(
          types.map((t) => [t.id, sessionDisplayName(groupNames[t.sessionGroupId] ?? '', t.name)]),
        ));
      })
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

  const downloadContract = async (booking: AdminBooking) => {
    try {
      const blob = await fetchAdminContractPdf(booking.id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `contracte-${booking.id}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      onError(err, 'No s\'ha pogut descarregar el contracte');
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
        <IconButton icon="refresh" label="Actualitzar" onClick={load} />
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
          {
            title: 'Contracte',
            dataIndex: 'contractSignedAt',
            render: (signedAt: string | null) =>
              signedAt ? <Tag color="green">Signat</Tag> : <Tag>Pendent</Tag>,
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
              {STATUS_TRANSITIONS[selected.status].map((next) => {
                const confirm = STATUS_CONFIRM[next];
                return (
                  <Popconfirm
                    key={next}
                    title={confirm.title}
                    description={confirm.description}
                    okText={confirm.okText}
                    cancelText="Deixa-ho estar"
                    okButtonProps={{ danger: confirm.danger }}
                    onConfirm={() => changeStatus(selected, next)}
                  >
                    <Button type="primary" danger={confirm.danger} loading={acting}>
                      {STATUS_ACTION_LABEL[next]}
                    </Button>
                  </Popconfirm>
                );
              })}
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
              <Descriptions.Item label="Contracte">
                {selected.contractSignedAt ? (
                  <Tag color="green">Signat el {formatInstant(selected.contractSignedAt)}</Tag>
                ) : (
                  <Tag>Pendent de signar</Tag>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Token">{selected.confirmationToken}</Descriptions.Item>
            </Descriptions>

            <Space direction="vertical" size={16} style={{ display: 'flex', marginTop: 24 }}>
              {selected.contractSignedAt && (
                <Button icon={<AdminIcons.download />} onClick={() => downloadContract(selected)}>
                  Descarregar contracte
                </Button>
              )}

              {/* Resending is a rescue action, not part of the daily flow: folded away by default. */}
              <Collapse
                ghost
                size="small"
                items={[
                  {
                    key: 'emails',
                    label: 'Correus',
                    children: (
                      <Space wrap>
                        <ResendEmailButtons booking={selected} loading={acting} onResend={(kind) => resend(selected, kind)} />
                      </Space>
                    ),
                  },
                  {
                    key: 'contract-link',
                    label: 'Link al contracte',
                    children: (
                      <>
                        <Typography.Paragraph type="secondary" style={{ marginBottom: 8 }}>
                          La pàgina on la clienta llegeix i signa el contracte. Es pot passar per WhatsApp
                          o com convingui: el token ja hi dona accés, no cal cap contrasenya.
                        </Typography.Paragraph>
                        <Typography.Text copyable={{ text: contractLink(selected.confirmationToken) }} code>
                          {contractLink(selected.confirmationToken)}
                        </Typography.Text>
                      </>
                    ),
                  },
                ]}
              />
            </Space>
          </>
        )}
      </Drawer>
    </div>
  );
};
