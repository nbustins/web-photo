import { FC, useMemo } from 'react';
import DOMPurify from 'dompurify';
import styles from './GuestSections.module.css';
import hotel from './HotelInfoSection.module.css';

const ALLOWED_TAGS = ['p', 'br', 'strong', 'em', 'u', 'h3', 'h4', 'ul', 'ol', 'li', 'a'];

// Allow-list for hrefs: web, mail and phone links only (blocks javascript:, data:, …).
const ALLOWED_URI = /^(?:https?|mailto|tel):/i;

// External web links open in a new tab without leaking the opener.
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.tagName === 'A' && /^https?:/i.test(node.getAttribute('href') ?? '')) {
    node.setAttribute('target', '_blank');
    node.setAttribute('rel', 'noopener noreferrer');
  }
});

const sanitizeHotelInfo = (html: string): string =>
  DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR: ['href'],
    ALLOWED_URI_REGEXP: ALLOWED_URI,
  });

interface HotelInfoSectionProps {
  html: string;
}

export const HotelInfoSection: FC<HotelInfoSectionProps> = ({ html }) => {
  const clean = useMemo(() => sanitizeHotelInfo(html), [html]);
  if (!clean.trim()) return null;

  return (
    <section className={styles.section}>
      <p className={styles.label}>Allotjament</p>
      <div className={hotel.hotel} dangerouslySetInnerHTML={{ __html: clean }} />
    </section>
  );
};
