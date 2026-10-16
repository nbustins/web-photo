import { FC, useMemo } from 'react';
import DOMPurify from 'dompurify';
import styles from './GuestSections.module.css';

const ALLOWED_TAGS = ['p', 'br', 'strong', 'em', 'u', 'h3', 'h4', 'ul', 'ol', 'li', 'a'];
const ALLOWED_URI = /^(?:https?|mailto|tel):/i;

DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.tagName === 'A' && /^https?:/i.test(node.getAttribute('href') ?? '')) {
    node.setAttribute('target', '_blank');
    node.setAttribute('rel', 'noopener noreferrer');
  }
});

const sanitizeGuestHtml = (html: string): string =>
  DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR: ['href'],
    ALLOWED_URI_REGEXP: ALLOWED_URI,
  });

const contentClass = (italic?: boolean) => (italic ? styles.richContentItalic : styles.richContent);

interface GuestRichHtmlProps {
  html: string;
  italic?: boolean;
}

export const GuestRichHtml: FC<GuestRichHtmlProps> = ({ html, italic }) => {
  const clean = useMemo(() => sanitizeGuestHtml(html), [html]);
  if (!clean.trim()) return null;
  return <div className={contentClass(italic)} dangerouslySetInnerHTML={{ __html: clean }} />;
};

interface GuestRichHtmlSectionProps extends GuestRichHtmlProps {
  label: string;
}

export const GuestRichHtmlSection: FC<GuestRichHtmlSectionProps> = ({ label, html, italic }) => {
  const clean = useMemo(() => sanitizeGuestHtml(html), [html]);
  if (!clean.trim()) return null;

  return (
    <section className={styles.section}>
      <p className={styles.label}>{label}</p>
      <div className={contentClass(italic)} dangerouslySetInnerHTML={{ __html: clean }} />
    </section>
  );
};
