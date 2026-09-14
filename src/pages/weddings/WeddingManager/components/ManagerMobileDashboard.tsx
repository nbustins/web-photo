import { FC, useMemo, useState } from 'react';
import { Input, Button, Dropdown } from 'antd';
import { FilterOutlined, SearchOutlined } from '@ant-design/icons';
import type { ConfirmationRow } from '../../../../model/wedding.types';
import { StatusPill, LabelTag, StatCell } from './ManagerShared';
import managerStyles from '../WeddingManager.module.css';
import styles from './ManagerMobileDashboard.module.css';

type StatusFilter = 'all' | 'confirmed' | 'declined' | 'pending';

interface Stats {
  totalGuests: number;
  confirmed: number;
  declined: number;
  pending: number;
}

interface ManagerMobileDashboardProps {
  weddingTitle: string;
  rows: ConfirmationRow[];
  stats: Stats;
  onLogout: () => void;
  /** Renders only the dashboard body, without its own header (for embedding in the admin panel). */
  embedded?: boolean;
  onSelectInvitation: (invitationId: number) => void;
  onShowNote: (note: string) => void;
}

const NOTES_TRUNCATE = 90;

export const ManagerMobileDashboard: FC<ManagerMobileDashboardProps> = ({
  weddingTitle,
  rows,
  stats,
  onLogout,
  embedded = false,
  onSelectInvitation,
  onShowNote,
}) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<StatusFilter>('all');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter(r => {
      if (filter === 'confirmed' && r.guestAttending !== true) return false;
      if (filter === 'declined' && r.guestAttending !== false) return false;
      if (filter === 'pending' && r.guestAttending !== null) return false;
      if (!q) return true;
      return r.guestName.toLowerCase().includes(q) || r.label.toLowerCase().includes(q);
    });
  }, [rows, search, filter]);

  const filterItems = [
    { key: 'all', label: 'Tots' },
    { key: 'confirmed', label: 'Confirmats' },
    { key: 'pending', label: 'Pendents' },
    { key: 'declined', label: 'Rebutjats' },
  ];

  const body = (
      <main className={styles.main}>
        <section className={styles.statsCard}>
          <StatCell value={stats.totalGuests} label="Total" />
          <StatCell value={stats.confirmed} label="Confirmats" tone="success" />
          <StatCell value={stats.pending} label="Pendents" />
          <StatCell value={stats.declined} label="Rebutjats" tone="danger" />
        </section>

        <section className={styles.searchCard}>
          <Input
            size="large"
            placeholder="Cerca..."
            prefix={<SearchOutlined className={styles.searchIcon} />}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={styles.searchInput}
          />
          <Dropdown
            overlayClassName={managerStyles.filterDropdown}
            menu={{
              items: filterItems,
              onClick: ({ key }) => setFilter(key as StatusFilter),
              selectedKeys: [filter],
            }}
            trigger={['click']}
          >
            <Button size="large" icon={<FilterOutlined />} className={styles.filterButton}>
              Filtre
            </Button>
          </Dropdown>
        </section>

        {filtered.length === 0 ? (
          <div className={styles.emptyState}>No hi ha resultats</div>
        ) : (
          <section className={styles.list}>
            {filtered.map((r) => (
              <article
                key={r.guestId}
                onClick={() => onSelectInvitation(r.invitationId)}
                className={styles.row}
              >
                <div className={styles.rowHead}>
                  <span className={styles.rowName}>{r.guestName}</span>
                  <StatusPill attending={r.guestAttending} />
                </div>
                <LabelTag>{r.label}</LabelTag>
                {r.notes && (
                  <span
                    onClick={(e) => {
                      if (r.notes && r.notes.length > NOTES_TRUNCATE) {
                        e.stopPropagation();
                        onShowNote(r.notes);
                      }
                    }}
                    className={styles.rowNotes}
                  >
                    {r.notes.length > NOTES_TRUNCATE ? `${r.notes.slice(0, NOTES_TRUNCATE)}…` : r.notes}
                  </span>
                )}
              </article>
            ))}
          </section>
        )}
      </main>
  );

  if (embedded) return body;

  return (
    <div className={styles.screen}>
      <header className={styles.header}>
        <span className={styles.headerTitle}>{weddingTitle}</span>
        <button onClick={onLogout} className={styles.logoutButton}>
          Tancar sessió
        </button>
      </header>
      {body}
    </div>
  );
};
