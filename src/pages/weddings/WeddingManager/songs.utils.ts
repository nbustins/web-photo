import type { InvitationSongs } from '../../../model/wedding.types';
import type { SongEntry } from './WeddingManager.types';

const fold = (text: string) => text.trim().replace(/\s+/g, ' ').toLowerCase();

/**
 * Merges every invitation's requests into one list. Songs are the same when title and artist
 * match ignoring case and surrounding/repeated whitespace; votes count distinct invitations.
 * Sorted by votes (desc), then title.
 */
export const aggregateSongs = (invitationSongs: InvitationSongs[]): SongEntry[] => {
  const byKey = new Map<string, SongEntry>();
  for (const invitation of invitationSongs) {
    for (const song of invitation.songRequests) {
      const title = song.title.trim().replace(/\s+/g, ' ');
      if (!title) continue;
      const artist = song.artist?.trim().replace(/\s+/g, ' ') || null;
      const key = `${fold(title)}|${fold(artist ?? '')}`;
      let entry = byKey.get(key);
      if (!entry) {
        entry = { key, title, artist, votes: 0, invitations: [] };
        byKey.set(key, entry);
      }
      if (!entry.invitations.some(i => i.id === invitation.invitationId)) {
        entry.invitations.push({ id: invitation.invitationId, label: invitation.label });
        entry.votes += 1;
      }
    }
  }
  return [...byKey.values()].sort((a, b) => b.votes - a.votes || a.title.localeCompare(b.title, 'ca'));
};

export const filterSongs = (songs: SongEntry[], query: string): SongEntry[] => {
  const q = fold(query);
  if (!q) return songs;
  return songs.filter(s => fold(s.title).includes(q) || fold(s.artist ?? '').includes(q));
};

const songLine = (song: SongEntry) => (song.artist ? `${song.title} — ${song.artist}` : song.title);

/** Plain text, one "Title — Artist" line per song. */
export const songsToPlainText = (songs: SongEntry[]): string => songs.map(songLine).join('\n');

const csvCell = (value: string) => `"${value.replace(/"/g, '""')}"`;

/** CSV for the DJ: votes, title, artist. */
export const songsToCsv = (songs: SongEntry[]): string =>
  ['Vots,Cançó,Artista', ...songs.map(s => [String(s.votes), csvCell(s.title), csvCell(s.artist ?? '')].join(','))].join('\r\n');
