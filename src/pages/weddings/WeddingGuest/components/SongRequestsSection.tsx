import { FC, useState } from 'react';
import { Form, Input } from 'antd';
import { IconButton } from '@ui/icons';
import type { SongRequest } from '../../../../model/wedding.types';
import styles from './GuestSections.module.css';

export const MAX_SONGS = 10;
const MAX_SONG_FIELD_LENGTH = 200;

interface SongRequestsFieldProps {
  value?: SongRequest[];
  onChange?: (value: SongRequest[]) => void;
}

/** Controlled field (value/onChange) so it can sit inside a Form.Item. */
const SongRequestsField: FC<SongRequestsFieldProps> = ({ value = [], onChange }) => {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const atLimit = value.length >= MAX_SONGS;

  const add = () => {
    const cleanTitle = title.trim();
    if (!cleanTitle || atLimit) return;
    onChange?.([...value, { title: cleanTitle, artist: artist.trim() || null }]);
    setTitle('');
    setArtist('');
  };

  const remove = (index: number) => onChange?.(value.filter((_, i) => i !== index));

  const onEnter = (e: React.KeyboardEvent) => {
    e.preventDefault();
    add();
  };

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <p className={styles.label}>Cançons per a la festa</p>
        <span className={styles.muted}>{value.length} / {MAX_SONGS}</span>
      </div>
      <p className={styles.muted}>Quines cançons no poden faltar? El DJ les tindrà en compte.</p>

      {value.map((song, index) => (
        <div key={`${song.title}-${index}`} className={styles.song}>
          <span className={styles.songText}>
            <span className={styles.songTitle}>{song.title}</span>
            <span className={styles.muted}>{song.artist || 'Sense artista'}</span>
          </span>
          <IconButton
            icon="close"
            label={`Treure ${song.title}`}
            type="text"
            className={styles.songRemove}
            onClick={() => remove(index)}
          />
        </div>
      ))}

      {!atLimit && (
        <div className={styles.songForm}>
          <label className={styles.muted} htmlFor="song-title">Títol</label>
          <Input
            id="song-title"
            className={styles.addInput}
            value={title}
            maxLength={MAX_SONG_FIELD_LENGTH}
            placeholder="Títol de la cançó"
            onChange={(e) => setTitle(e.target.value)}
            onPressEnter={onEnter}
          />
          <label className={styles.muted} htmlFor="song-artist">Artista (opcional)</label>
          <div className={styles.addRow}>
            <Input
              id="song-artist"
              className={styles.addInput}
              value={artist}
              maxLength={MAX_SONG_FIELD_LENGTH}
              placeholder="Artista"
              onChange={(e) => setArtist(e.target.value)}
              onPressEnter={onEnter}
            />
            <IconButton
              icon="create"
              label="Afegir cançó"
              type="primary"
              className={styles.addButton}
              onClick={add}
            />
          </div>
        </div>
      )}
    </section>
  );
};

export const SongRequestsSection: FC = () => (
  <Form.Item name="songRequests" noStyle>
    <SongRequestsField />
  </Form.Item>
);
