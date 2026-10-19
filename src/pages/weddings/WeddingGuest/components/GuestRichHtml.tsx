import { FC, useMemo } from 'react';
import { sanitizeGuestHtml } from '@utils/richHtml.utils';
import styles from './GuestSections.module.css';

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
