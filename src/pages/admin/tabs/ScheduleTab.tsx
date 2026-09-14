import { FC, useEffect, useMemo, useState } from 'react';
import { Alert, App, Button, Popconfirm, Select, Spin, TimePicker, Tooltip } from 'antd';
import { type Dayjs } from 'dayjs';
import { useIsMobile } from '@ui/hooks/useIsMobile';
import {
  SessionGroup, Weekday, WeeklyAvailability,
  createAvailabilityRange, deleteAvailabilityRange,
  fetchAvailabilityRanges, fetchSessionGroups, fetchSessionTypes,
} from '../../../services/booking/booking.admin.api';
import type { SessionType } from '../../../services/booking/booking.api';
import { WEEKDAYS_MON_FIRST, WEEKDAY_LABEL, WEEKDAY_SHORT } from '../labels';
import { AdminIcons, IconButton } from '../icons';
import { PageHeader } from '../components/PageHeader';
import { useApiError } from '../useApiError';
import styles from '../admin.module.css';

const TIME_FMT = 'HH:mm';
const HOUR_PX = 44;

/** 'HH:mm:ss' → fractional hours. */
const toHours = (t: string) => Number(t.slice(0, 2)) + Number(t.slice(3, 5)) / 60;
const rangeLabel = (r: WeeklyAvailability) => `${r.startTime.slice(0, 5)} – ${r.endTime.slice(0, 5)}`;
const rangesCount = (n: number) => (n === 0 ? 'Tancat' : `${n} ${n === 1 ? 'franja' : 'franges'}`);

interface WeekGridProps {
  ranges: WeeklyAvailability[];
  onRemove: (id: number) => void;
}

/** Read-only week at a glance: each range is a block placed by its hours. */
const WeekGrid: FC<WeekGridProps> = ({ ranges, onRemove }) => {
  const first = Math.min(9, ...ranges.map((r) => Math.floor(toHours(r.startTime))));
  const last = Math.max(20, ...ranges.map((r) => Math.ceil(toHours(r.endTime))));
  const height = (last - first) * HOUR_PX;

  return (
    <div className={styles.weekGrid}>
      <span />
      {WEEKDAYS_MON_FIRST.map((wd) => (
        <div key={wd} className={styles.dayHead}>
          {WEEKDAY_LABEL[wd]}
          <span className={styles.muted}>{rangesCount(ranges.filter((r) => r.weekday === wd).length)}</span>
        </div>
      ))}

      <div className={styles.hourAxis} style={{ height }}>
        {Array.from({ length: last - first + 1 }, (_, i) => (
          <span key={i} style={{ top: i * HOUR_PX }}>{String(first + i).padStart(2, '0')}:00</span>
        ))}
      </div>
      {WEEKDAYS_MON_FIRST.map((wd) => {
        const day = ranges.filter((r) => r.weekday === wd);
        return (
          <div
            key={wd}
            className={day.length ? styles.dayCol : `${styles.dayCol} ${styles.dayColClosed}`}
            style={{ height, backgroundSize: `100% ${HOUR_PX}px` }}
          >
            {day.map((r) => (
              <Tooltip key={r.id} title={`${WEEKDAY_LABEL[wd]} ${rangeLabel(r)}`}>
                <div
                  className={styles.rangeBlock}
                  style={{
                    top: (toHours(r.startTime) - first) * HOUR_PX + 2,
                    height: (toHours(r.endTime) - toHours(r.startTime)) * HOUR_PX - 4,
                  }}
                >
                  <span className={styles.rangeLabel}>{rangeLabel(r)}</span>
                  <Popconfirm title="Esborrar franja?" onConfirm={() => onRemove(r.id)}>
                    <IconButton icon="remove" label="Esborrar franja" size="small" type="text" danger />
                  </Popconfirm>
                </div>
              </Tooltip>
            ))}
          </div>
        );
      })}
    </div>
  );
};

export const ScheduleTab: FC = () => {
  const { message } = App.useApp();
  const onError = useApiError();
  const isMobile = useIsMobile();
  const [ranges, setRanges] = useState<WeeklyAvailability[]>([]);
  const [sessionTypes, setSessionTypes] = useState<SessionType[]>([]);
  const [groups, setGroups] = useState<SessionGroup[]>([]);
  const [loading, setLoading] = useState(false);

  // Ranges belong to one session type (API 001 §16); nothing is editable until one is picked.
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
  // New range draft. On mobile the day comes from the day chips, on desktop from a select.
  const [formDay, setFormDay] = useState<Weekday>('Monday');
  const [draft, setDraft] = useState<[Dayjs, Dayjs] | null>(null);

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
      const [t, g] = await Promise.all([fetchSessionTypes(), fetchSessionGroups()]);
      setSessionTypes(t);
      setGroups(g);
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

  const addRange = async () => {
    if (!draft || selectedTypeId === null) return;
    const [start, end] = draft;
    if (!end.isAfter(start)) { message.error('L\'hora de fi ha de ser posterior a la d\'inici'); return; }
    try {
      await createAvailabilityRange({
        sessionTypeId: selectedTypeId,
        weekday: formDay,
        startTime: start.format('HH:mm:ss'),
        endTime: end.format('HH:mm:ss'),
      });
      setDraft(null);
      reloadRanges();
    } catch (err) { onError(err); }
  };

  const removeRange = async (id: number) => {
    try { await deleteAvailabilityRange(id); reloadRanges(); } catch (err) { onError(err); }
  };

  const dayRanges = ranges.filter((r) => r.weekday === formDay);

  const mobileDay = (
    <>
      <div className={styles.dayChips}>
        {WEEKDAYS_MON_FIRST.map((wd) => {
          const active = wd === formDay;
          const n = ranges.filter((r) => r.weekday === wd).length;
          return (
            <button
              key={wd}
              type="button"
              aria-pressed={active}
              aria-label={`${WEEKDAY_LABEL[wd]}: ${rangesCount(n)}`}
              className={active ? `${styles.dayChip} ${styles.dayChipActive}` : styles.dayChip}
              onClick={() => setFormDay(wd)}
            >
              {WEEKDAY_SHORT[wd]}
              <span className={styles.chipDots}>{Array.from({ length: n }, (_, i) => <span key={i} />)}</span>
            </button>
          );
        })}
      </div>
      <span className={styles.caption}>{WEEKDAY_LABEL[formDay]}</span>
      {dayRanges.length === 0 ? (
        <span className={styles.muted}>Cap franja definida</span>
      ) : dayRanges.map((r) => (
        <div key={r.id} className={styles.rangeItem}>
          <span>{rangeLabel(r)}</span>
          <Popconfirm title="Esborrar franja?" onConfirm={() => removeRange(r.id)}>
            <IconButton icon="remove" label="Esborrar franja" size="small" danger />
          </Popconfirm>
        </div>
      ))}
    </>
  );

  const addForm = (
    <div className={styles.addForm}>
      {!isMobile && <span className={styles.muted}>Nova franja</span>}
      {!isMobile && (
        <Select
          value={formDay}
          onChange={setFormDay}
          options={WEEKDAYS_MON_FIRST.map((wd) => ({ value: wd, label: WEEKDAY_LABEL[wd] }))}
          style={{ width: 150 }}
        />
      )}
      <TimePicker.RangePicker
        format={TIME_FMT}
        minuteStep={15}
        value={draft}
        onChange={(v) => setDraft(v as [Dayjs, Dayjs] | null)}
      />
      <Button type="primary" icon={<AdminIcons.create />} onClick={addRange} disabled={!draft}>
        {isMobile ? 'Afegir' : 'Afegir franja'}
      </Button>
    </div>
  );

  return (
    <>
      <PageHeader title="Horaris" />
      <div className={styles.body}>
        <div className={styles.toolbar}>
          {!isMobile && <span className={styles.muted}>Horari de</span>}
          <Select
            className={styles.typeSelect}
            placeholder="Tria un tipus de sessió"
            options={typeOptions}
            value={selectedTypeId}
            onChange={(v) => { setSelectedTypeId(v); setDraft(null); }}
            showSearch
            optionFilterProp="label"
          />
          {!isMobile && (
            <span className={styles.muted}>
              Cada tipus té el seu horari; una reserva confirmada bloqueja l&apos;hora per a tots.
            </span>
          )}
        </div>

        {selectedTypeId === null ? (
          <Alert type="info" showIcon message="Tria un tipus de sessió per veure i editar el seu horari." />
        ) : (
          <Spin spinning={loading}>
            <div className={`${styles.surface} ${styles.weekCard}`}>
              {!loading && ranges.length === 0 && (
                <Alert
                  type="warning"
                  showIcon
                  message="Aquest tipus no té cap franja definida"
                  description="Sense franges no s'ofereix cap hora reservable per a aquest tipus de sessió."
                />
              )}
              {isMobile ? mobileDay : <WeekGrid ranges={ranges} onRemove={removeRange} />}
              {addForm}
            </div>
          </Spin>
        )}
      </div>
    </>
  );
};
