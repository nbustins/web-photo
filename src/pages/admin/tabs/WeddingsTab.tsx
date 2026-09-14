import { FC, useEffect, useState } from 'react';
import {
  Alert, App, Button, DatePicker, Drawer, Empty, Form, Input, InputNumber, Segmented, Spin, Tag, Upload,
} from 'antd';
import type { UploadFile } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
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
import { PageHeader } from '../components/PageHeader';
import { AdminIcons } from '../icons';
import { useApiError } from '../useApiError';
import styles from '../admin.module.css';

interface CreateWeddingFormValues {
  title: string;
  slug: string;
  eventDate?: Dayjs;
  closingDate?: Dayjs;
  codeLength?: number;
  guestFile: UploadFile[];
}

type WeddingFilter = 'all' | 'open' | 'closed';

const formatDate = (date: string | null) =>
  date ? new Date(date).toLocaleDateString('ca-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';

/** Guests can still answer: no closing date, or one still ahead. */
const isOpen = (w: AdminWedding) => !w.closingDate || new Date(w.closingDate).getTime() > Date.now();
/** Undated weddings count as upcoming: they're still being set up. */
const isUpcoming = (w: AdminWedding) => !w.eventDate || w.eventDate.slice(0, 10) >= dayjs().format('YYYY-MM-DD');

export const WeddingsTab: FC = () => {
  const onError = useApiError();
  const isMobile = useIsMobile();
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [weddings, setWeddings] = useState<AdminWedding[]>([]);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<WeddingFilter>('all');
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

  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const q = query.trim().toLowerCase();
  const matching = weddings.filter((w) => !q || w.title.toLowerCase().includes(q) || w.slug.includes(q));
  const openCount = matching.filter(isOpen).length;
  const visible = matching.filter((w) => filter === 'all' || (filter === 'open') === isOpen(w));
  const byDate = (a: AdminWedding, b: AdminWedding) => (a.eventDate ?? '').localeCompare(b.eventDate ?? '');
  const upcoming = visible.filter(isUpcoming).sort(byDate);
  const past = visible.filter((w) => !isUpcoming(w)).sort((a, b) => byDate(b, a));

  const card = (w: AdminWedding) => (
    <button
      key={w.id}
      type="button"
      className={`${styles.surface} ${styles.weddingCard}${isUpcoming(w) ? '' : ` ${styles.past}`}`}
      onClick={() => openWedding(w)}
    >
      <span className={styles.cardHead}>
        <span className={styles.rowWho}>
          <span className={styles.weddingTitle}>{w.title}</span>
          <span className={styles.muted}>{formatDate(w.eventDate)}</span>
        </span>
        {isOpen(w) ? <Tag color="green">Confirmacions obertes</Tag> : <Tag>Tancat</Tag>}
      </span>
      <span className={styles.weddingMeta}>
        <span className={styles.iconText}><AdminIcons.guests /> {w.guestCount} convidats</span>
        {w.closingDate && <span className={styles.muted}>Tancament {formatDate(w.closingDate)}</span>}
      </span>
      <span className={styles.weddingFooter}>
        <span className={styles.iconText}><AdminIcons.link /> /weddings/{w.slug}</span>
        <span className={styles.iconText}>Veure confirmacions <AdminIcons.next /></span>
      </span>
    </button>
  );

  const section = (title: string, list: AdminWedding[]) => list.length > 0 && (
    <section className={styles.dayGroup}>
      <span className={styles.caption}>{title}</span>
      <div className={`${styles.cardGrid} ${styles.cardGridWide}`}>{list.map(card)}</div>
    </section>
  );

  const dashboardProps = selected && {
    weddingTitle: selected.title,
    rows,
    stats: computeStats(rows),
    onLogout: closeWedding,
    embedded: true,
    onSelectInvitation: (id: number) => setSelectedSummary(buildSummary(rows, id)),
    onShowNote: (note: string) => setNoteModal(note),
  };

  const countLabel = (label: string, n: number) => (
    <span className={styles.segmentLabel}>{label}<span className={styles.count}>{n}</span></span>
  );

  return (
    <>
      <PageHeader
        title="Casaments"
        actions={[{ label: 'Nou casament', icon: 'create', primary: true, onClick: () => setCreateOpen(true) }]}
      />
      <div className={styles.body}>
        <div className={styles.toolbar}>
          <Input
            allowClear
            prefix={<AdminIcons.search />}
            placeholder="Cerca per nom de la parella o enllaç"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={styles.search}
          />
          <div className={styles.segmentScroll}>
            <Segmented<WeddingFilter>
              value={filter}
              onChange={setFilter}
              options={[
                { value: 'all', label: countLabel('Tots', matching.length) },
                { value: 'open', label: countLabel(isMobile ? 'Oberts' : 'Confirmacions obertes', openCount) },
                { value: 'closed', label: countLabel('Tancats', matching.length - openCount) },
              ]}
            />
          </div>
        </div>

        <Spin spinning={loading}>
          {visible.length === 0 ? (
            <Empty
              className={styles.empty}
              description={weddings.length ? 'Cap casament amb aquests filtres' : 'No hi ha casaments'}
            />
          ) : (
            <div className={styles.stack}>
              {section('Propers', upcoming)}
              {section('Passats', past)}
            </div>
          )}
        </Spin>
      </div>

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
