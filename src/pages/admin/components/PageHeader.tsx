import { FC } from 'react';
import { Button } from 'antd';
import { AppBar } from '@ui/AppBar';
import { useIsMobile } from '@ui/hooks/useIsMobile';
import { AdminIcons, IconButton, IconName } from '../icons';
import { useAdminShell } from '../adminShell';
import styles from '../admin.module.css';

export interface HeaderAction {
  label: string;
  icon: IconName;
  onClick: () => void;
  /** The section's main action: a labelled button on desktop. The rest are icon buttons. */
  primary?: boolean;
}

// On the dark AppBar the text buttons need the on-brand ink; inline so it beats antd's own colour.
const onBrand = { color: 'var(--lt-color-text-on-brand)' };

/**
 * Section title bar. Desktop: a light bar beside the sidebar. Mobile: the dark AppBar with the
 * menu button, where every action shrinks to an icon.
 */
export const PageHeader: FC<{ title: string; actions?: HeaderAction[] }> = ({ title, actions = [] }) => {
  const isMobile = useIsMobile();
  const { openMenu } = useAdminShell();

  if (isMobile) {
    return (
      <AppBar
        title={
          <span className={styles.mobileTitle}>
            <Button type="text" icon={<AdminIcons.menu />} aria-label="Obrir menú" onClick={openMenu} style={onBrand} />
            {title}
          </span>
        }
        actions={
          <span className={styles.headerActions}>
            {actions.map((a) => (
              <IconButton key={a.label} icon={a.icon} label={a.label} type="text" onClick={a.onClick} style={onBrand} />
            ))}
          </span>
        }
      />
    );
  }

  return (
    <header className={styles.pageHeader}>
      <h1 className={styles.pageTitle}>{title}</h1>
      <span className={styles.headerActions}>
        {actions.map((a) => {
          const Icon = AdminIcons[a.icon];
          return a.primary ? (
            <Button key={a.label} type="primary" icon={<Icon />} onClick={a.onClick}>{a.label}</Button>
          ) : (
            <IconButton key={a.label} icon={a.icon} label={a.label} onClick={a.onClick} />
          );
        })}
      </span>
    </header>
  );
};
