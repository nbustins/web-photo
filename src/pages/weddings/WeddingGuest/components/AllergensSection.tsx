import { FC, useState } from 'react';
import { Form, Input } from 'antd';
import { IconButton } from '@ui/icons';
import type { GuestFormValue } from '../WeddingGuestPage.types';
import styles from './GuestSections.module.css';

export const MAX_ALLERGENS = 15;
export const MAX_ALLERGEN_LENGTH = 100;
const SUGGESTIONS = ['Gluten', 'Lactosa', 'Fruits secs', 'Marisc'];

const has = (list: string[], item: string) => list.some((a) => a.toLowerCase() === item.toLowerCase());

interface AllergenFieldProps {
  guestName: string;
  value?: string[];
  onChange?: (value: string[]) => void;
}

/** Controlled field (value/onChange) so it can sit inside a Form.Item. */
const AllergenField: FC<AllergenFieldProps> = ({ guestName, value = [], onChange }) => {
  const [draft, setDraft] = useState('');
  const atLimit = value.length >= MAX_ALLERGENS;

  const add = (raw: string) => {
    const item = raw.trim();
    if (!item || atLimit) return;
    if (!has(value, item)) onChange?.([...value, item]);
    setDraft('');
  };

  const remove = (item: string) => onChange?.(value.filter((a) => a !== item));

  return (
    <div className={styles.guestBlock}>
      <span className={styles.guestNameStrong}>{guestName}</span>
      <div className={styles.chips}>
        {value.length === 0 && <span className={styles.muted}>Cap</span>}
        {value.map((a) => (
          <span key={a} className={styles.chip}>
            {a}
            <button type="button" className={styles.chipRemove} aria-label={`Treure ${a}`} onClick={() => remove(a)}>
              ×
            </button>
          </span>
        ))}
      </div>
      <div className={styles.addRow}>
        <Input
          className={styles.addInput}
          value={draft}
          maxLength={MAX_ALLERGEN_LENGTH}
          placeholder="Afegir al·lèrgia"
          aria-label={`Afegir al·lèrgia per a ${guestName}`}
          disabled={atLimit}
          onChange={(e) => setDraft(e.target.value)}
          onPressEnter={(e) => {
            e.preventDefault();
            add(draft);
          }}
        />
        <IconButton
          icon="create"
          label="Afegir"
          type="primary"
          className={styles.addButton}
          disabled={atLimit}
          onClick={() => add(draft)}
        />
      </div>
      {atLimit && <p className={styles.muted}>Has arribat al màxim de {MAX_ALLERGENS} al·lèrgies.</p>}
      <div className={styles.chips}>
        {SUGGESTIONS.filter((s) => !has(value, s)).map((s) => (
          <button key={s} type="button" className={styles.suggestion} disabled={atLimit} onClick={() => add(s)}>
            + {s}
          </button>
        ))}
      </div>
    </div>
  );
};

interface AllergensSectionProps {
  guests: GuestFormValue[];
}

export const AllergensSection: FC<AllergensSectionProps> = ({ guests }) => {
  const attending = guests.map((g, index) => ({ g, index })).filter(({ g }) => g.attending);
  if (attending.length === 0) return null;

  return (
    <section className={styles.section}>
      <p className={styles.label}>Al·lèrgies i intoleràncies</p>
      {attending.map(({ g, index }) => (
        <Form.Item key={g.id} name={['guests', index, 'allergens']} noStyle>
          <AllergenField guestName={g.name} />
        </Form.Item>
      ))}
    </section>
  );
};
