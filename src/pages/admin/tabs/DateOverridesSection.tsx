import { FC, useEffect, useState } from 'react';
import { Alert, Button, DatePicker, Drawer, Empty, Popconfirm, Space, Spin, TimePicker } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { Link } from 'react-router-dom';
import { useIsMobile } from '@ui/hooks/useIsMobile';
import {
  AvailabilityOverrideDay, BlockedPeriod, TimeRange, Weekday, WeeklyAvailability,
  fetchAvailabilityOverrides, fetchBlockedPeriods, saveAvailabilityOverrideDay,
} from '../../../services/booking/booking.admin.api';
import { formatDateHeading, WEEKDAY_LABEL, weekdayOfDate } from '../labels';
import { AdminIcons, IconButton } from '../icons';
import { useApiError } from '../useApiError';
import styles from '../admin.module.css';

const TIME_FMT = 'HH:mm';
const rangeLabel = (r: TimeRange) => `${r.startTime.slice(0, 5)} – ${r.endTime.slice(0, 5)}`;

/** One builder row: either side may be empty while the admin is still filling it in. */
type RangeRow = [Dayjs | null, Dayjs | null];

interface Props {
  sessionTypeId: number;
  /** The selected type's weekly ranges, already loaded by ScheduleTab — reused for the weekly comparison. */
  weeklyRanges: WeeklyAvailability[];
}

/**
 * Client-side guard before the bulk save: every row complete, end after start, no two rows
 * overlapping. The backend 409 (spec 009 §8) is only a backstop for races, this is the primary
 * check — it also drives which row(s) get `status="error"`.
 */
function validateBuilderRows(rows: RangeRow[]): { errorRows: number[]; message: string | null } {
  const incompleteIndex = rows.findIndex(([start, end]) => !start || !end);
  if (incompleteIndex >= 0) {
    return { errorRows: [incompleteIndex], message: "Cada franja necessita una hora d'inici i de fi." };
  }

  const invalidIndex = rows.findIndex(([start, end]) => !end!.isAfter(start!));
  if (invalidIndex >= 0) {
    return { errorRows: [invalidIndex], message: "L'hora de fi ha de ser posterior a la d'inici." };
  }

  const overlapRows = new Set<number>();
  for (let i = 0; i < rows.length; i++) {
    for (let j = i + 1; j < rows.length; j++) {
      const [aStart, aEnd] = rows[i];
      const [bStart, bEnd] = rows[j];
      if (aStart!.isBefore(bEnd!) && bStart!.isBefore(aEnd!)) {
        overlapRows.add(i);
        overlapRows.add(j);
      }
    }
  }
  if (overlapRows.size > 0) return { errorRows: [...overlapRows], message: 'Hi ha franges que se superposen.' };

  return { errorRows: [], message: null };
}

/**
 * "Dates especials" (spec 009, design A): the page shows only a read-only list grouped by day;
 * all editing happens inside a right-side Drawer (the "day builder"), same pattern as the
 * session-type editor in SessionsTab. Kept apart from ScheduleTab's week grid to keep that file
 * readable.
 *
 * Semantic trap to keep in mind everywhere in this file: an override day with `ranges: []` is not
 * "closed" — it simply has no override any more, so that date falls back to the weekly hours.
 * Closing a day entirely is what Dies bloquejats is for.
 */
export const DateOverridesSection: FC<Props> = ({ sessionTypeId, weeklyRanges }) => {
  const onError = useApiError();
  const isMobile = useIsMobile();
  const [overrideDays, setOverrideDays] = useState<AvailabilityOverrideDay[]>([]);
  const [blockedPeriods, setBlockedPeriods] = useState<BlockedPeriod[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [builderDate, setBuilderDate] = useState<Dayjs | null>(null);
  const [builderRows, setBuilderRows] = useState<RangeRow[]>([]);

  const loadOverrides = async () => {
    setLoading(true);
    try {
      const days = await fetchAvailabilityOverrides({ sessionTypeId, from: dayjs().format('YYYY-MM-DD') });
      // API already returns days sorted by date; re-sort defensively rather than trust it blindly.
      setOverrideDays([...days].sort((a, b) => a.date.localeCompare(b.date)));
    } catch (err) {
      onError(err, "No s'han pogut carregar les dates especials");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOverrides();
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [sessionTypeId]);

  useEffect(() => {
    fetchBlockedPeriods().then(setBlockedPeriods).catch(() => {});
  }, []);

  // Merge a saved day into local state instead of refetching the whole list — the POST already
  // returns the day's current shape (spec 009 §8). Empty ranges means the override was removed.
  const mergeDay = (saved: AvailabilityOverrideDay) => {
    setOverrideDays(days => {
      const others = days.filter(d => d.date !== saved.date);
      return saved.ranges.length === 0
        ? others
        : [...others, saved].sort((a, b) => a.date.localeCompare(b.date));
    });
  };

  const isBlockedDate = (date: string) => blockedPeriods.some(p => date >= p.from && date <= p.to);
  const weeklyRangesFor = (weekday: Weekday) => weeklyRanges.filter(r => r.weekday === weekday);
  const weeklyLabelFor = (weekday: Weekday) => {
    const ranges = weeklyRangesFor(weekday);
    return ranges.length === 0 ? 'tancat' : ranges.map(rangeLabel).join(', ');
  };
  const revertConfirmText = (weekday: Weekday) =>
    `Eliminar la data especial? El dia tornarà a l'horari setmanal (${weeklyLabelFor(weekday)}).`;

  const resetBuilder = () => { setBuilderDate(null); setBuilderRows([]); };

  const openCreateDrawer = () => { resetBuilder(); setDrawerOpen(true); };

  const openEditDrawer = (day: AvailabilityOverrideDay) => {
    setBuilderDate(dayjs(day.date));
    setBuilderRows(day.ranges.map(r => [dayjs(r.startTime, 'HH:mm:ss'), dayjs(r.endTime, 'HH:mm:ss')] as RangeRow));
    setDrawerOpen(true);
  };

  // Same slots, no date: the admin picks the target date in the drawer.
  const openCopyDrawer = (day: AvailabilityOverrideDay) => {
    setBuilderDate(null);
    setBuilderRows(day.ranges.map(r => [dayjs(r.startTime, 'HH:mm:ss'), dayjs(r.endTime, 'HH:mm:ss')] as RangeRow));
    setDrawerOpen(true);
  };

  const closeDrawer = () => { setDrawerOpen(false); resetBuilder(); };

  const onPickDate = (d: Dayjs | null) => {
    setBuilderDate(d);
    if (!d) { setBuilderRows([]); return; }
    const existing = overrideDays.find(day => day.date === d.format('YYYY-MM-DD'));
    // Keep rows already in the builder (copied slots) unless the picked date has its own override.
    if (existing) setBuilderRows(existing.ranges.map(r => [dayjs(r.startTime, 'HH:mm:ss'), dayjs(r.endTime, 'HH:mm:ss')] as RangeRow));
  };

  const addRow = () => setBuilderRows(rows => [...rows, [null, null]]);
  const removeRow = (i: number) => setBuilderRows(rows => rows.filter((_, idx) => idx !== i));
  const updateRow = (i: number, v: RangeRow | null) =>
    setBuilderRows(rows => rows.map((r, idx) => (idx === i ? (v ?? [null, null]) : r)));

  const copyWeekly = (weekday: Weekday) =>
    setBuilderRows(weeklyRangesFor(weekday).map(r => [dayjs(r.startTime, 'HH:mm:ss'), dayjs(r.endTime, 'HH:mm:ss')] as RangeRow));

  const save = async () => {
    if (!builderDate) return;
    setSaving(true);
    try {
      const payload: TimeRange[] = builderRows.map(([start, end]) => ({
        startTime: start!.format('HH:mm:ss'),
        endTime: end!.format('HH:mm:ss'),
      }));
      const saved = await saveAvailabilityOverrideDay(sessionTypeId, builderDate.format('YYYY-MM-DD'), payload);
      mergeDay(saved);
      closeDrawer();
    } catch (err) {
      onError(err);
    } finally {
      setSaving(false);
    }
  };

  const revertDay = async (day: AvailabilityOverrideDay) => {
    try {
      const saved = await saveAvailabilityOverrideDay(sessionTypeId, day.date, []);
      mergeDay(saved);
    } catch (err) {
      onError(err);
    }
  };

  const builderDateStr = builderDate ? builderDate.format('YYYY-MM-DD') : null;
  const builderWeekday = builderDateStr ? weekdayOfDate(builderDateStr) : null;
  const builderIsBlocked = builderDateStr ? isBlockedDate(builderDateStr) : false;
  const builderIsExistingDay = builderDateStr ? overrideDays.some(d => d.date === builderDateStr) : false;
  const { errorRows, message: validationMessage } = validateBuilderRows(builderRows);
  // ranges: [] is only a meaningful save when it reverts an existing override day, never for a
  // brand-new date (there is nothing to revert, so an empty save is a no-op — keep it disabled).
  const revertMode = builderRows.length === 0 && builderIsExistingDay;

  return (
    <div className={styles.stack}>
      <div className={styles.cardHead}>
        <span className={styles.iconText}>
          <span className={styles.caption}>Dates especials</span>
          <span className={styles.muted}>
            {overrideDays.length} {overrideDays.length === 1 ? 'data programada' : 'dates programades'}
          </span>
        </span>
        <IconButton icon="create" label="Nova data especial" type="primary" onClick={openCreateDrawer} />
      </div>

      <Alert
        type="info"
        showIcon
        message={(
          <>
            <strong>Substitueix l&apos;horari setmanal d&apos;aquest dia.</strong> Si una data té franges
            especials, només s&apos;ofereixen aquestes; l&apos;horari setmanal d&apos;aquell dia s&apos;ignora.
            Per tancar un dia sencer, fes servir <Link to="/admin/blocked">Dies bloquejats</Link>.
          </>
        )}
      />

      <div className={`${styles.surface} ${styles.weekCard}`}>
        <Spin spinning={loading}>
          {!loading && overrideDays.length === 0 ? (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Cap data especial programada" />
          ) : (
            overrideDays.map(day => {
              const weekday = weekdayOfDate(day.date);
              const blocked = isBlockedDate(day.date);
              return (
                <div key={day.date} className={styles.dateOverrideRow}>
                  <div className={styles.dateOverrideHead}>
                    <span className={styles.strong}>{formatDateHeading(day.date)}</span>
                    <span className={styles.dateOverrideActions}>
                      <IconButton icon="edit" label="Editar dia" onClick={() => openEditDrawer(day)} />
                      <IconButton icon="copy" label="Copiar franges a una altra data" onClick={() => openCopyDrawer(day)} />
                      <Popconfirm title={revertConfirmText(weekday)} onConfirm={() => revertDay(day)}>
                        <IconButton icon="remove" label="Tornar a l'horari setmanal" danger />
                      </Popconfirm>
                    </span>
                    {blocked && <span className={styles.warningLine}>Dins d&apos;un període bloquejat · no té efecte</span>}
                  </div>
                  <span className={`${styles.muted} ${styles.strikethrough}`}>Setmanal: {weeklyLabelFor(weekday)}</span>
                  <div className={styles.chipRow}>
                    {day.ranges.map(r => (
                      <span
                        key={`${day.date}-${r.startTime}`}
                        className={blocked ? `${styles.overrideChip} ${styles.overrideChipMuted}` : styles.overrideChip}
                      >
                        {rangeLabel(r)}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </Spin>
      </div>

      <Drawer
        width={isMobile ? '100%' : 480}
        open={drawerOpen}
        title={builderIsExistingDay ? 'Editar data especial' : 'Nova data especial'}
        onClose={closeDrawer}
        footer={
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={closeDrawer}>Cancel·lar</Button>
            {revertMode ? (
              <Popconfirm title={builderWeekday ? revertConfirmText(builderWeekday) : ''} onConfirm={save}>
                <Button danger loading={saving}>Tornar a l&apos;horari setmanal</Button>
              </Popconfirm>
            ) : (
              <Button
                type="primary"
                icon={<AdminIcons.save />}
                onClick={save}
                loading={saving}
                disabled={!builderDate || !!validationMessage || builderRows.length === 0}
              >
                Desar dia
              </Button>
            )}
          </Space>
        }
      >
        <div className={styles.stack}>
          <span className={styles.caption}>Data</span>
          <div className={styles.dayBuilderHead}>
            <DatePicker
              placeholder="Nova data especial"
              value={builderDate}
              onChange={onPickDate}
              disabled={builderIsExistingDay}
              disabledDate={d => d.isBefore(dayjs().startOf('day'))}
            />
            {builderWeekday && (
              <span className={styles.muted}>
                {WEEKDAY_LABEL[builderWeekday]} · horari setmanal: {weeklyLabelFor(builderWeekday)}
              </span>
            )}
            {builderWeekday && (
              <Button onClick={() => copyWeekly(builderWeekday)} disabled={weeklyRangesFor(builderWeekday).length === 0}>
                Copiar horari setmanal
              </Button>
            )}
          </div>

          <span className={styles.caption}>Franges</span>
          {builderRows.map((row, i) => (
            <div key={i} className={styles.builderRow}>
              <span className={styles.muted}>Franja {i + 1}</span>
              <TimePicker.RangePicker
                format={TIME_FMT}
                minuteStep={15}
                value={row}
                status={errorRows.includes(i) ? 'error' : undefined}
                onChange={v => updateRow(i, v as RangeRow | null)}
                className={styles.builderRange}
              />
              <IconButton icon="remove" label="Treure franja" onClick={() => removeRow(i)} />
            </div>
          ))}

          <div className={styles.dayBuilderHead}>
            <Button icon={<AdminIcons.create />} onClick={addRow} disabled={!builderDate}>
              Afegir franja
            </Button>
            <span className={styles.muted}>
              {builderRows.length} {builderRows.length === 1 ? 'franja' : 'franges'}
            </span>
          </div>

          {validationMessage && <Alert type="error" showIcon message={validationMessage} />}
          {builderIsBlocked && (
            <Alert
              type="warning"
              showIcon
              message="Aquesta data és dins d'un període bloquejat: la data especial no tindrà cap efecte mentre el bloqueig hi sigui."
            />
          )}
        </div>
      </Drawer>
    </div>
  );
};
