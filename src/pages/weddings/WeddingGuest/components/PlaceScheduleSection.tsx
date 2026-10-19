import { FC } from 'react';
import { GuestRichHtml } from './GuestRichHtml';
import { sanitizeGuestHtml } from '@utils/richHtml.utils';
import styles from './GuestSections.module.css';

interface PlaceScheduleSectionProps {
  place?: string | null;
  schedule?: string | null;
}

/** Groups the ceremony location and the schedule into one section, rendered first after the introduction. */
export const PlaceScheduleSection: FC<PlaceScheduleSectionProps> = ({ place, schedule }) => {
  const cleanPlace = place ? sanitizeGuestHtml(place) : '';
  const cleanSchedule = schedule ? sanitizeGuestHtml(schedule) : '';
  if (!cleanPlace.trim() && !cleanSchedule.trim()) return null;

  return (
    <section className={styles.placeScheduleSection}>
      {cleanPlace.trim() && (
        <div className={styles.placeScheduleBlock}>
          <p className={styles.label}>Lloc de la celebració</p>
          <GuestRichHtml html={cleanPlace} />
        </div>
      )}
      {cleanSchedule.trim() && (
        <div className={styles.placeScheduleBlock}>
          <p className={styles.label}>Horari</p>
          <GuestRichHtml html={cleanSchedule} />
        </div>
      )}
    </section>
  );
};
