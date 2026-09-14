import { FC, useEffect, useState } from 'react';
import { App, Badge, Button, Calendar, Collapse, DatePicker, Empty, Input, Segmented, Spin, Tag } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useIsMobile } from '@ui/hooks/useIsMobile';
import { AdminIcons, IconButton } from '../icons';
import { BookingDetail } from '../components/BookingDetail';
import { PageHeader } from '../components/PageHeader';
import { useAdminShell } from '../adminShell';
import type { BookingEmailKind } from '../components/ResendEmailButtons';
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
import { STATUS_COLOR, STATUS_FILTER_LABEL, STATUS_LABEL, formatDayHeading, formatTime, studioDay } from '../labels';
import { useApiError } from '../useApiError';
import styles from '../admin.module.css';

const { RangePicker } = DatePicker;

type StatusFilter = BookingStatus | 'all';
type View = 'list' | 'calendar';

const STATUSES = Object.keys(STATUS_LABEL) as BookingStatus[];

const byStart = (a: AdminBooking, b: AdminBooking) =>
  new Date(a.startAt).getTime() - new Date(b.startAt).getTime();

/** Bookings grouped by studio day, keeping the order they come in. */
function groupByDay(list: AdminBooking[]): Map<string, AdminBooking[]> {
  const groups = new Map<string, AdminBooking[]>();
  for (const b of list) {
    const key = studioDay(b.startAt);
    const group = groups.get(key);
    if (group) group.push(b);
    else groups.set(key, [b]);
  }
  return groups;
}

const participantsText = (n: number) => `${n} participant${n === 1 ? '' : 's'}`;

interface BookingRowProps {
  booking: AdminBooking;
  typeName: string;
  /** Narrow layout (mobile, calendar side panel): time, who + session, status. */
  compact: boolean;
  onOpen: (id: number) => void;
}

const BookingRow: FC<BookingRowProps> = ({ booking: b, typeName, compact, onOpen }) => (
  <button type="button" className={compact ? `${styles.row} ${styles.rowCompact}` : styles.row} onClick={() => onOpen(b.id)}>
    <span className={styles.rowTime}>{formatTime(b.startAt)}</span>
    <span className={styles.rowWho}>
      <span className={styles.rowName}>{b.clientName}</span>
      <span className={styles.muted}>
        {compact
          ? typeName
          : [b.clientPhone, b.participants.length > 0 && participantsText(b.participants.length)].filter(Boolean).join(' · ')}
      </span>
    </span>
    {!compact && <span>{typeName}</span>}
    <span><Tag color={STATUS_COLOR[b.status]}>{STATUS_LABEL[b.status]}</Tag></span>
    {!compact && (
      <span>{b.contractSignedAt ? <Tag color="green">Contracte signat</Tag> : <Tag>Contracte pendent</Tag>}</span>
    )}
    {!compact && <AdminIcons.next className={styles.rowChevron} />}
  </button>
);

export const BookingsTab: FC = () => {
  const { message } = App.useApp();
  const onError = useApiError();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshPending } = useAdminShell();
  // View and open booking live in the URL: a booking can be linked and Back closes the drawer.
  const [params, setParams] = useSearchParams();
  const view: View = params.get('view') === 'calendar' ? 'calendar' : 'list';
  const selectedId = Number(params.get('id')) || null;

  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [typeNames, setTypeNames] = useState<Record<number, string>>({});
  const [status, setStatus] = useState<StatusFilter>('Requested');
  const [query, setQuery] = useState('');
  const [range, setRange] = useState<{ from?: string; to?: string }>({});
  // Calendar: the selected day. Its month, padded to whole weeks, is what gets loaded.
  const [day, setDay] = useState<Dayjs>(() => dayjs());
  const [acting, setActing] = useState(false);

  const month = day.format('YYYY-MM');

  // ponytail: status and search filter on the client over one fetch, which also gives the
  // counters for free; move them server-side if a range ever holds too many bookings.
  const load = async () => {
    setLoading(true);
    try {
      const filter = view === 'calendar'
        ? {
            from: day.startOf('month').startOf('week').format('YYYY-MM-DD'),
            to: day.endOf('month').endOf('week').format('YYYY-MM-DD'),
          }
        : range;
      setBookings(await fetchBookings(filter));
    } catch (err) {
      onError(err, 'No s\'han pogut carregar les reserves');
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [view, month, range.from, range.to]);

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

  const setView = (next: View) =>
    setParams((p) => {
      const n = new URLSearchParams(p);
      if (next === 'calendar') n.set('view', 'calendar');
      else n.delete('view');
      return n;
    }, { replace: true });

  const openBooking = (id: number) =>
    setParams((p) => {
      const n = new URLSearchParams(p);
      n.set('id', String(id));
      return n;
    }, { state: { openedFromList: true } });

  // Opened from the list: step back, so Back doesn't reopen it. Opened from a link: just drop the id.
  const closeBooking = () => {
    if ((location.state as { openedFromList?: boolean } | null)?.openedFromList) {
      navigate(-1);
      return;
    }
    setParams((p) => {
      const n = new URLSearchParams(p);
      n.delete('id');
      return n;
    }, { replace: true });
  };

  const changeStatus = async (booking: AdminBooking, next: BookingStatus) => {
    setActing(true);
    try {
      const updated = await updateBookingStatus(booking.id, next);
      message.success(`Estat actualitzat a ${STATUS_LABEL[next]}`);
      setBookings((list) => list.map((b) => (b.id === updated.id ? updated : b)));
      refreshPending();
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

  const resend = async (booking: AdminBooking, kind: BookingEmailKind) => {
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

  const q = query.trim().toLowerCase();
  const matching = bookings.filter((b) =>
    !q || [b.clientName, b.clientPhone, b.clientEmail ?? ''].some((v) => v.toLowerCase().includes(q)));
  const count = (s: BookingStatus) => matching.filter((b) => b.status === s).length;
  const visible = (status === 'all' ? [...matching] : matching.filter((b) => b.status === status)).sort(byStart);
  const typeName = (id: number) => typeNames[id] ?? `#${id}`;
  const selected = bookings.find((b) => b.id === selectedId) ?? null;

  const row = (b: AdminBooking, compact = isMobile) => (
    <BookingRow key={b.id} booking={b} typeName={typeName(b.sessionTypeId)} compact={compact} onOpen={openBooking} />
  );

  const dayGroups = (list: AdminBooking[]) => [...groupByDay(list)].map(([key, items]) => (
    <section key={key} className={styles.dayGroup}>
      <span className={styles.caption}>{formatDayHeading(items[0].startAt)}</span>
      <div className={`${styles.surface} ${styles.rows}`}>{items.map((b) => row(b))}</div>
    </section>
  ));

  const now = Date.now();
  const upcoming = visible.filter((b) => new Date(b.endAt).getTime() >= now);
  const past = visible.filter((b) => new Date(b.endAt).getTime() < now).reverse();

  const listView = visible.length === 0 ? (
    <Empty className={styles.empty} description="Cap reserva amb aquests filtres" />
  ) : (
    <div className={styles.stack}>
      {upcoming.length > 0 ? dayGroups(upcoming) : <Empty description="Cap reserva propera" />}
      {past.length > 0 && (
        <Collapse
          ghost
          items={[{
            key: 'past',
            label: `Anteriors (${past.length})`,
            children: <div className={styles.stack}>{dayGroups(past)}</div>,
          }]}
        />
      )}
    </div>
  );

  const byDay = groupByDay(visible);
  const dayItems = byDay.get(day.format('YYYY-MM-DD')) ?? [];

  const calendarView = (
    <div className={styles.split}>
      <div className={`${styles.surface} ${styles.calendarCard} ${styles.splitMain}`}>
        <Calendar
          fullscreen={!isMobile}
          value={day}
          onSelect={(d) => setDay(d)}
          headerRender={() => (
            <div className={styles.calendarHeader}>
              <span className={styles.calendarTitle}>{day.format('MMMM YYYY')}</span>
              <Button onClick={() => setDay(dayjs())}>Avui</Button>
              <IconButton icon="prev" label="Mes anterior" onClick={() => setDay(day.subtract(1, 'month'))} />
              <IconButton icon="next" label="Mes següent" onClick={() => setDay(day.add(1, 'month'))} />
            </div>
          )}
          cellRender={(d, info) => {
            if (info.type !== 'date') return info.originNode;
            const items = byDay.get(d.format('YYYY-MM-DD')) ?? [];
            if (isMobile) {
              return (
                <span className={styles.calendarDots}>
                  {items.slice(0, 3).map((b) => <Badge key={b.id} color={STATUS_COLOR[b.status]} />)}
                </span>
              );
            }
            return (
              <ul className={styles.calendarEvents}>
                {items.slice(0, 3).map((b) => (
                  <li key={b.id}>
                    <Badge color={STATUS_COLOR[b.status]} text={`${formatTime(b.startAt)} ${b.clientName}`} />
                  </li>
                ))}
                {items.length > 3 && <li className={styles.muted}>+{items.length - 3} més</li>}
              </ul>
            );
          }}
        />
        <div className={styles.legend}>
          {STATUSES.map((s) => <Badge key={s} color={STATUS_COLOR[s]} text={STATUS_LABEL[s]} />)}
        </div>
      </div>

      <aside className={styles.sidePanel}>
        <span className={styles.caption}>
          {day.format('dddd D [de] MMMM')} · {dayItems.length} {dayItems.length === 1 ? 'reserva' : 'reserves'}
        </span>
        {dayItems.length > 0 ? (
          <div className={`${styles.surface} ${styles.rows}`}>{dayItems.map((b) => row(b, true))}</div>
        ) : (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Cap reserva aquest dia" />
        )}
      </aside>
    </div>
  );

  return (
    <>
      <PageHeader title="Reserves" actions={[{ label: 'Actualitzar', icon: 'refresh', onClick: load }]} />
      <div className={styles.body}>
        <div className={styles.toolbar}>
          <div className={styles.segmentScroll}>
            <Segmented<StatusFilter>
              value={status}
              onChange={setStatus}
              options={[
                ...STATUSES.map((s) => ({
                  value: s,
                  label: (
                    <span className={styles.segmentLabel}>
                      {STATUS_FILTER_LABEL[s]}
                      <span className={styles.count}>{count(s)}</span>
                    </span>
                  ),
                })),
                { value: 'all', label: 'Totes' },
              ]}
            />
          </div>
          <span className={styles.spacer} />
          <Input
            allowClear
            prefix={<AdminIcons.search />}
            placeholder="Cerca per nom, telèfon o email"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={styles.search}
          />
          {view === 'list' && (
            <RangePicker
              onChange={(_, ds) => setRange({ from: ds?.[0] || undefined, to: ds?.[1] || undefined })}
            />
          )}
          <Segmented<View>
            value={view}
            onChange={setView}
            options={[
              { value: 'list', icon: <AdminIcons.list />, label: isMobile ? undefined : 'Llista', title: 'Llista' },
              { value: 'calendar', icon: <AdminIcons.calendar />, label: isMobile ? undefined : 'Calendari', title: 'Calendari' },
            ]}
          />
        </div>

        <Spin spinning={loading}>{view === 'list' ? listView : calendarView}</Spin>
      </div>

      <BookingDetail
        booking={selected}
        typeName={selected ? typeName(selected.sessionTypeId) : ''}
        acting={acting}
        onClose={closeBooking}
        onChangeStatus={(next) => selected && changeStatus(selected, next)}
        onResend={(kind) => selected && resend(selected, kind)}
        onDownloadContract={() => selected && downloadContract(selected)}
      />
    </>
  );
};
