import { FC, useEffect, useState } from 'react';
import { Alert, App, Button, DatePicker, Drawer, Empty, Form, Input, InputNumber, Space, Spin, Upload } from 'antd';
import type { UploadFile } from 'antd';
import type { Dayjs } from 'dayjs';
import { ResponsiveTable, ResponsiveColumn } from '@ui/ResponsiveTable';
import { useIsMobile } from '@ui/hooks/useIsMobile';
import type { ConfirmationRow } from '../../../model/wedding.types';
import type { InvitationSummary } from '../../weddings/WeddingManager/WeddingManager.types';
import { buildSummary, computeStats } from '../../weddings/WeddingManager/manager.utils';
import {
  ManagerDesktopDashboard,
  ManagerInvitationDrawer,
  ManagerMobileDashboard,
  ManagerNotesModal,
} from '../../weddings/WeddingManager/components';
import { AdminWedding, createAdminWedding, fetchAdminWeddings } from '../../../services/wedding/api/admin-wedding.api';
import { fetchConfirmations } from '../../../services/wedding/api/confirmations.api';
import { errorMessage } from '../../../services/error-messages';
import { useApiError } from '../useApiError';

interface CreateWeddingFormValues {
  title: string;
  slug: string;
  eventDate?: Dayjs;
  closingDate?: Dayjs;
  codeLength?: number;
  guestFile: UploadFile[];
}

const formatDate = (date: string | null) =>
  date ? new Date(date).toLocaleDateString('ca-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';

export const WeddingsTab: FC = () => {
  const onError = useApiError();
  const isMobile = useIsMobile();
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [weddings, setWeddings] = useState<AdminWedding[]>([]);
  const [creating, setCreating] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createForm] = Form.useForm<CreateWeddingFormValues>();
  const [selected, setSelected] = useState<AdminWedding | null>(null);
  const [rows, setRows] = useState<ConfirmationRow[]>([]);
  const [rowsLoading, setRowsLoading] = useState(false);
  const [selectedSummary, setSelectedSummary] = useState<InvitationSummary | null>(null);
  const [noteModal, setNoteModal] = useState<string | null>(null);

  const loadWeddings = () => {
    setLoading(true);
    fetchAdminWeddings()
      .then(list => setWeddings(list))
      .catch(onError)
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadWeddings(); }, []);

  const closeCreate = () => {
    setCreateOpen(false);
    setCreateError(null);
    createForm.resetFields();
  };

  const submitCreate = async (values: CreateWeddingFormValues) => {
    setCreating(true);
    setCreateError(null);
    try {
      await createAdminWedding(
        {
          title: values.title,
          slug: values.slug,
          eventDate: values.eventDate?.format('YYYY-MM-DD') ?? null,
          closingDate: values.closingDate?.toISOString() ?? null,
          codeLength: values.codeLength ?? 6,
        },
        values.guestFile[0].originFileObj as File,
      );
      message.success('Casament creat');
      closeCreate();
      loadWeddings();
    } catch (err) {
      setCreateError(errorMessage(err, "No s'ha pogut crear el casament. Torna-ho a provar."));
    } finally {
      setCreating(false);
    }
  };

  const openWedding = async (wedding: AdminWedding) => {
    setSelected(wedding);
    setRows([]);
    setRowsLoading(true);
    try {
      setRows(await fetchConfirmations(wedding.id));
    } catch (err) {
      onError(err);
      setSelected(null);
    } finally {
      setRowsLoading(false);
    }
  };

  const closeWedding = () => {
    setSelected(null);
    setRows([]);
    setSelectedSummary(null);
    setNoteModal(null);
  };

  const columns: ResponsiveColumn<AdminWedding>[] = [
    { title: 'Casament', dataIndex: 'title', key: 'title', mobileTitle: true },
    {
      title: 'Data',
      key: 'eventDate',
      width: 130,
      render: (_, w) => formatDate(w.eventDate),
    },
    {
      title: 'Tancament confirmacions',
      key: 'closingDate',
      width: 200,
      render: (_, w) => formatDate(w.closingDate),
    },
    { title: 'Convidats', dataIndex: 'guestCount', key: 'guestCount', width: 110 },
    { title: 'Enllaç web', dataIndex: 'slug', key: 'slug', width: 180 },
  ];

  const dashboardProps = selected && {
    weddingTitle: selected.title,
    rows,
    stats: computeStats(rows),
    onLogout: closeWedding,
    embedded: true,
    onSelectInvitation: (id: number) => setSelectedSummary(buildSummary(rows, id)),
    onShowNote: (note: string) => setNoteModal(note),
  };

  return (
    <>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={() => setCreateOpen(true)}>Nou casament</Button>
      </Space>

      <ResponsiveTable
        columns={columns}
        dataSource={[...weddings].sort((a, b) => (b.eventDate ?? '').localeCompare(a.eventDate ?? ''))}
        rowKey="id"
        loading={loading}
        pagination={false}
        locale={{ emptyText: <Empty description="No hi ha casaments" /> }}
        onRow={(wedding) => ({ onClick: () => openWedding(wedding), style: { cursor: 'pointer' } })}
      />

      <Drawer
        width={isMobile ? '100%' : 900}
        open={!!selected}
        onClose={closeWedding}
        title={selected?.title ?? ''}
      >
        {rowsLoading ? (
          <Spin />
        ) : (
          dashboardProps &&
          (isMobile ? <ManagerMobileDashboard {...dashboardProps} /> : <ManagerDesktopDashboard {...dashboardProps} />)
        )}
      </Drawer>

      <Drawer
        width={isMobile ? '100%' : 480}
        open={createOpen}
        onClose={closeCreate}
        title="Nou casament"
      >
        <Form form={createForm} layout="vertical" onFinish={submitCreate} disabled={creating}>
          <Form.Item name="title" label="Títol" rules={[{ required: true, message: 'Camp obligatori' }]}>
            <Input placeholder="Carla & Joel" />
          </Form.Item>
          <Form.Item
            name="slug"
            label="Enllaç web (slug)"
            rules={[
              { required: true, message: 'Camp obligatori' },
              { pattern: /^[a-z0-9-]+$/, message: 'Només minúscules, números i guions' },
            ]}
          >
            <Input placeholder="carla-i-joel" />
          </Form.Item>
          <Form.Item name="eventDate" label="Data del casament">
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>
          <Form.Item name="closingDate" label="Tancament de confirmacions">
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>
          <Form.Item name="codeLength" label="Llargada del codi d'invitació" initialValue={6}>
            <InputNumber min={6} max={12} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            label="Fitxer de convidats (Excel)"
            name="guestFile"
            valuePropName="fileList"
            getValueFromEvent={(e) => e?.fileList}
            rules={[{ required: true, message: 'Cal el fitxer de convidats' }]}
          >
            <Upload maxCount={1} accept=".xlsx,.xls" beforeUpload={() => false}>
              <Button>Selecciona el fitxer</Button>
            </Upload>
          </Form.Item>

          {createError && (
            <Form.Item>
              <Alert type="warning" showIcon message={createError} />
            </Form.Item>
          )}

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={creating} block>
              Crear casament
            </Button>
          </Form.Item>
        </Form>
      </Drawer>

      <ManagerNotesModal note={noteModal} onClose={() => setNoteModal(null)} />
      <ManagerInvitationDrawer summary={selectedSummary} onClose={() => setSelectedSummary(null)} />
    </>
  );
};
