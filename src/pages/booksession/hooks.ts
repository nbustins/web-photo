import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import {
  fetchBookableSessionGroups, fetchAvailability, BookableSessionGroup, BookableSessionType,
  AvailabilitySlot,
} from '../../services/booking/booking.api';

/**
 * Loads the *bookable* catalog (a type published on the website is not necessarily reservable,
 * API spec 008 QS5) and resolves the requested type in it. An undefined id is not an error:
 * that is the picker's starting state (spec 004).
 */
export const useSessionType = (sessionTypeId: number | undefined) => {
  const [groups, setGroups] = useState<BookableSessionGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchBookableSessionGroups()
      .then(loaded => {
        setGroups(loaded);
        if (loaded.every(group => group.sessionTypes.length === 0)) setError(true);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const { sessionType, groupName } = useMemo(() => {
    for (const group of groups) {
      const type = group.sessionTypes.find(t => t.id === sessionTypeId);
      if (type) return { sessionType: type, groupName: group.name };
    }
    return { sessionType: null as BookableSessionType | null, groupName: '' };
  }, [groups, sessionTypeId]);

  // An id that is not in the catalog is a dead link; no id at all just means "not picked yet".
  const notFound = sessionTypeId !== undefined && !loading && !sessionType;

  return { groups, sessionType, groupName, loading, error: error || notFound, setError };
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
