import { FC, useMemo, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { Card, Input, Table, message } from 'antd';
import type { TableColumnsType } from 'antd';
import { Icons } from '@ui/icons';
import { PageHeader } from '@ui/PageHeader';
import { ManagerSections, weddingManagerSectionPath } from '../../../model/routes.model';
import type { SongEntry } from './WeddingManager.types';
import { aggregateSongs, filterSongs, songsToCsv, songsToPlainText } from './songs.utils';
import { useManagerShell } from './managerShell';
import { LabelTag } from './components';
import shared from './components/ManagerShared.module.css';
import styles from './WeddingManager.module.css';
import local from './SongsSection.module.css';

const columns: TableColumnsType<SongEntry> = [
  {
    title: 'Vots',
    key: 'votes',
    width: 80,
    render: (_, song) => <span className={local.count}>{song.votes}</span>,
  },
  {
    title: 'Cançó',
    key: 'title',
    render: (_, song) => <span className={local.songTitle}>{song.title}</span>,
  },
  {
    title: 'Artista',
    key: 'artist',
    render: (_, song) => (song.artist ? song.artist : <span className={shared.muted}>—</span>),
  },
  {
    title: 'Proposada per',
    key: 'by',
    render: (_, song) => (
      <span className={local.tags}>
        {song.invitations.map(i => <LabelTag key={i.id}>{i.label}</LabelTag>)}
      </span>
    ),
  },
];

const downloadFile = (content: string, filename: string, type: string) => {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

export const SongsSection: FC = () => {
  const { slug = '' } = useParams<{ slug: string }>();
  const { features, invitationSongs } = useManagerShell();
  const [query, setQuery] = useState('');

  const songs = useMemo(() => aggregateSongs(invitationSongs), [invitationSongs]);
  const visible = useMemo(() => filterSongs(songs, query), [songs, query]);
  const proposers = useMemo(() => new Set(songs.flatMap(s => s.invitations.map(i => i.id))).size, [songs]);

  if (!features.songRequests) {
    return <Navigate to={weddingManagerSectionPath(slug, ManagerSections.confirmacions)} replace />;
  }

  const copyList = async () => {
    try {
      await navigator.clipboard.writeText(songsToPlainText(songs));
      message.success('Llista copiada');
    } catch {
      message.error("No s'ha pogut copiar la llista");
    }
  };

  const exportForDj = () => {
    // BOM so spreadsheet apps read the accents as UTF-8.
    downloadFile(`\uFEFF${songsToCsv(songs)}`, `${slug}-musica.csv`, 'text/csv;charset=utf-8');
  };

  const noSongs = songs.length === 0;

  return (
    <>
      <PageHeader
        title="Música"
        actions={[
          ...(noSongs ? [] : [
            { label: 'Copiar llista', icon: 'copy' as const, onClick: copyList },
            { label: 'Exportar per al DJ', icon: 'download' as const, onClick: exportForDj },
          ]),
        ]}
      />
      <div className={styles.sectionBody}>
        <div className={local.toolbar}>
          <p className={local.summary}>
            <b>{songs.length} {songs.length === 1 ? 'cançó' : 'cançons'}</b>{' '}
            <span className={shared.muted}>
              proposad{songs.length === 1 ? 'a' : 'es'} per {proposers} {proposers === 1 ? 'invitació' : 'invitacions'} · ordenades per vots
            </span>
          </p>
          <Input
            allowClear
            className={local.search}
            prefix={<Icons.search />}
            aria-label="Cercar cançó"
            placeholder="Cercar títol o artista"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
        <Card className={styles.tableCard}>
          <Table
            columns={columns}
            dataSource={visible}
            rowKey="key"
            pagination={{ pageSize: 20, hideOnSinglePage: true }}
            locale={{ emptyText: noSongs ? 'Encara no hi ha cap cançó proposada' : 'Cap cançó coincideix amb la cerca' }}
          />
        </Card>
      </div>
    </>
  );
};
