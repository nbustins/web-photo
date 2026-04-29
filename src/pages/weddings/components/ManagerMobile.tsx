import { FC, useMemo, useState } from 'react';
import { Input, Button, Dropdown } from 'antd';
import { FilterOutlined, SearchOutlined } from '@ant-design/icons';
import type { ConfirmationRow } from '../../../model/wedding.types';
import { radii } from '../../../styles/tokens/radii';

type StatusFilter = 'all' | 'confirmed' | 'declined' | 'pending';

interface Stats {
  totalGuests: number;
  confirmed: number;
  declined: number;
  pending: number;
}

interface ManagerMobileProps {
  weddingTitle: string;
  rows: ConfirmationRow[];
  stats: Stats;
  onLogout: () => void;
  onSelectInvitation: (invitationId: number) => void;
  onShowNote: (note: string) => void;
}

const COLOR_BG = '#f5f0ea';
const COLOR_HEADER = '#5C5440';
const COLOR_TEXT_DARK = '#3d3228';
const COLOR_OLIVE = '#7C7458';
const COLOR_GREEN = '#5e8a4e';
const COLOR_RUST = '#b06a3a';
const NOTES_TRUNCATE = 90;

const statusPill = (attending: boolean | null): React.CSSProperties => {
  const base: React.CSSProperties = {
    fontFamily: "'Raleway', sans-serif",
    fontSize: 13,
    fontWeight: 500,
    padding: '6px 16px',
    borderRadius: 8,
    border: '1px solid',
    whiteSpace: 'nowrap',
  };
  if (attending === true) return { ...base, color: COLOR_GREEN, borderColor: 'rgba(94,138,78,0.45)', background: 'rgba(94,138,78,0.08)' };
  if (attending === false) return { ...base, color: COLOR_RUST, borderColor: 'rgba(176,106,58,0.45)', background: 'rgba(176,106,58,0.08)' };
  return { ...base, color: COLOR_OLIVE, borderColor: 'rgba(124,116,88,0.45)', background: 'rgba(124,116,88,0.08)' };
};

const statusLabel = (attending: boolean | null) =>
  attending === true ? 'Confirmat' : attending === false ? 'Rebutjat' : 'Pendent';

export const ManagerMobile: FC<ManagerMobileProps> = ({
  weddingTitle,
  rows,
  stats,
  onLogout,
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

  return (
    <div style={{
      minHeight: '100vh',
      background: COLOR_BG,
      display: 'flex',
      flexDirection: 'column',
    }}>
      <header style={{
        background: COLOR_HEADER,
        padding: '18px 20px calc(18px + env(safe-area-inset-top)) 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <span style={{
          fontFamily: "'Italiana', Georgia, serif",
          fontStyle: 'italic',
          fontSize: 26,
          color: '#fff',
          letterSpacing: '0.02em',
          lineHeight: 1.1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {weddingTitle}
        </span>
        <button
          onClick={onLogout}
          style={{
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.65)',
            color: '#fff',
            fontFamily: "'Raleway', sans-serif",
            fontSize: 14,
            padding: '10px 22px',
            borderRadius: 999,
            cursor: 'pointer',
          }}
        >
          Tancar sessió
        </button>
      </header>

      <main style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <section style={{
          background: '#fff',
          borderRadius: radii.md,
          boxShadow: '0 2px 12px rgba(124, 116, 88, 0.08)',
          padding: '18px 12px',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 4,
        }}>
          <StatCell value={stats.totalGuests} label="Total" color={COLOR_TEXT_DARK} />
          <StatCell value={stats.confirmed} label="Confirmats" color={COLOR_GREEN} />
          <StatCell value={stats.pending} label="Pendents" color={COLOR_TEXT_DARK} />
          <StatCell value={stats.declined} label="Rebutjats" color={COLOR_RUST} />
        </section>

        <section style={{
          background: '#fff',
          borderRadius: radii.md,
          boxShadow: '0 2px 12px rgba(124, 116, 88, 0.08)',
          padding: 12,
          display: 'flex',
          gap: 10,
          alignItems: 'center',
        }}>
          <Input
            size="large"
            placeholder="Cerca..."
            prefix={<SearchOutlined style={{ color: '#bfb8a8' }} />}
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ fontFamily: "'Raleway', sans-serif", borderRadius: radii.md }}
          />
          <Dropdown
            menu={{
              items: filterItems,
              onClick: ({ key }) => setFilter(key as StatusFilter),
              selectedKeys: [filter],
            }}
            trigger={['click']}
          >
            <Button size="large" icon={<FilterOutlined />} style={{ borderRadius: radii.md }}>
              Filtre
            </Button>
          </Dropdown>
        </section>

        {filtered.length === 0 ? (
          <div style={{
            background: '#fff',
            borderRadius: radii.md,
            padding: 32,
            textAlign: 'center',
            color: '#9a9a9a',
            fontFamily: "'Raleway', sans-serif",
          }}>
            No hi ha resultats
          </div>
        ) : (
          <section style={{
            background: '#fff',
            borderRadius: radii.md,
            boxShadow: '0 2px 12px rgba(124, 116, 88, 0.08)',
            overflow: 'hidden',
          }}>
            {filtered.map((r, i) => (
              <article
                key={r.guestId}
                onClick={() => onSelectInvitation(r.invitationId)}
                style={{
                  padding: '16px 18px',
                  borderTop: i === 0 ? 'none' : '1px solid rgba(124,116,88,0.12)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                  <span style={{
                    fontFamily: "'Italiana', Georgia, serif",
                    fontSize: 19,
                    color: COLOR_TEXT_DARK,
                    letterSpacing: '0.01em',
                  }}>
                    {r.guestName}
                  </span>
                  <span style={statusPill(r.guestAttending)}>
                    {statusLabel(r.guestAttending)}
                  </span>
                </div>
                <span style={{
                  alignSelf: 'flex-start',
                  fontFamily: "'Raleway', sans-serif",
                  fontSize: 13,
                  color: COLOR_OLIVE,
                  border: `1px solid rgba(124,116,88,0.35)`,
                  borderRadius: radii.md,
                  padding: '3px 10px',
                  background: 'rgba(124,116,88,0.04)',
                }}>
                  {r.label}
                </span>
                {r.notes && (
                  <span
                    onClick={(e) => {
                      if (r.notes && r.notes.length > NOTES_TRUNCATE) {
                        e.stopPropagation();
                        onShowNote(r.notes);
                      }
                    }}
                    style={{
                      fontFamily: "'Raleway', sans-serif",
                      fontSize: 14,
                      color: '#8a8275',
                      lineHeight: 1.5,
                    }}
                  >
                    {r.notes.length > NOTES_TRUNCATE ? `${r.notes.slice(0, NOTES_TRUNCATE)}…` : r.notes}
                  </span>
                )}
              </article>
            ))}
          </section>
        )}
      </main>
    </div>
  );
};

const StatCell: FC<{ value: number; label: string; color: string }> = ({ value, label, color }) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
  }}>
    <span style={{
      fontFamily: "'Italiana', Georgia, serif",
      fontSize: 30,
      fontWeight: 500,
      color,
      lineHeight: 1,
    }}>
      {value}
    </span>
    <span style={{
      fontFamily: "'Raleway', sans-serif",
      fontSize: 11,
      fontWeight: 500,
      color: '#9a9080',
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
    }}>
      {label}
    </span>
  </div>
);
