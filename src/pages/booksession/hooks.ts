import { useCallback, useEffect, useState } from 'react';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import {
  fetchBookableSessionGroups, fetchAvailability, BookableSessionType, AvailabilitySlot,
} from '../../services/booking/booking.api';

/**
 * Loads the session type (and its group name) from the route param, from the *bookable* catalog:
 * a type published on the website is not necessarily reservable (API spec 008 QS5).
 */
export const useSessionType = (sessionTypeId: string | undefined) => {
  const typeId = Number(sessionTypeId);
  const [sessionType, setSessionType] = useState<BookableSessionType | null>(null);
  const [groupName, setGroupName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!sessionTypeId || Number.isNaN(typeId)) {
      setLoading(false);
      setError(true);
      return;
    }
    fetchBookableSessionGroups()
      .then(groups => {
        for (const group of groups) {
          const type = group.sessionTypes.find(t => t.id === typeId);
          if (type) {
            setSessionType(type);
            setGroupName(group.name);
            return;
          }
        }
        setError(true);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [sessionTypeId, typeId]);

  return { sessionType, groupName, loading, error, setError };
};

/** Loads free slots for the visible month, keyed by YYYY-MM-DD. */
export const useMonthAvailability = (sessionType: BookableSessionType | null) => {
  const [month, setMonth] = useState<Dayjs>(dayjs());
  const [slotsByDate, setSlotsByDate] = useState<Record<string, AvailabilitySlot[]>>({});
  const [loading, setLoading] = useState(false);

  const loadMonth = useCallback((target: Dayjs) => {
    if (!sessionType) return;
    const monthStart = target.startOf('month');
    const start = monthStart.isBefore(dayjs(), 'day') ? dayjs() : monthStart;
    const end = target.endOf('month');
    if (end.isBefore(dayjs(), 'day')) {
      setSlotsByDate({});
      return;
    }
    setLoading(true);
    fetchAvailability(sessionType.id, start.format('YYYY-MM-DD'), end.format('YYYY-MM-DD'))
      .then(availability => {
        const byDate: Record<string, AvailabilitySlot[]> = {};
        for (const day of availability.days) {
          if (day.slots.length > 0) byDate[day.date] = day.slots;
        }
        setSlotsByDate(byDate);
      })
      .catch(() => setSlotsByDate({}))
      .finally(() => setLoading(false));
  }, [sessionType]);

  useEffect(() => {
    loadMonth(month);
  }, [loadMonth, month]);

  return { month, setMonth, slotsByDate, loading, reload: () => loadMonth(month) };
};
