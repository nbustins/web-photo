import { FC, ReactNode } from 'react';
import { Layout } from 'antd';
import styles from './AppBar.module.css';

const { Header } = Layout;

interface AppBarProps {
  title: ReactNode;
  actions?: ReactNode;
  /** Classes pròpies del consumidor (p.ex. regles responsive que no comparteixen totes les zones). */
  headerClassName?: string;
  contentClassName?: string;
}

export const AppBar: FC<AppBarProps> = ({ title, actions, headerClassName, contentClassName }) => (
  <Header className={headerClassName ? `${styles.header} ${headerClassName}` : styles.header}>
    <div className={contentClassName ? `${styles.content} ${contentClassName}` : styles.content}>
      <span className={styles.title}>{title}</span>
      {actions}
    </div>
  </Header>
);
