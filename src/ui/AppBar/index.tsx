import { FC, ReactNode } from 'react';
import { Layout } from 'antd';
import styles from './AppBar.module.css';

const { Header } = Layout;

interface AppBarProps {
  title: ReactNode;
  actions?: ReactNode;
  /** Classe pròpia del consumidor (p.ex. regles responsive que no comparteixen totes les zones). */
  contentClassName?: string;
}

export const AppBar: FC<AppBarProps> = ({ title, actions, contentClassName }) => (
  <Header className={styles.header}>
    <div className={contentClassName ? `${styles.content} ${contentClassName}` : styles.content}>
      <span className={styles.title}>{title}</span>
      {actions}
    </div>
  </Header>
);
