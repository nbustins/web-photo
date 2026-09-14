import { FC, useEffect, useState } from 'react';
import { Button, DatePicker, Empty, Input, Popconfirm } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import {
  BlockedPeriod, createBlockedPeriod, deleteBlockedPeriod, fetchBlockedPeriods,
} from '../../../services/booking/booking.admin.api';
import { AdminIcons, IconButton } from '../icons';
import { PageHeader } from '../components/PageHeader';
import { useApiError } from '../useApiError';
import styles from '../admin.module.css';

const { RangePicker } = DatePicker;
const formatDate = (d: string) => dayjs(d).format('DD/MM/YYYY');

/** Blocked periods close the agenda for every session type, so they live apart from schedules. */
export const BlockedTab: FC = () => {
  const onError = useApiError();
  const [blocks, setBlocks] = useState<BlockedPeriod[]>([]);
  const [blockRange, setBlockRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [blockReason, setBlockReason] = useState('');

  const reloadBlocks = async () => {
    try { setBlocks(await fetchBlockedPeriods()); } catch (err) { onError(err, 'No s\'han pogut carregar els dies bloquejats'); }
  };

  useEffect(() => {
    reloadBlocks();
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, []);

  const addBlock = async () => {
    if (!blockRange) return;
    try {
      await createBlockedPeriod({
        from: blockRange[0].format('YYYY-MM-DD'),
        to: blockRange[1].format('YYYY-MM-DD'),
        reason: blockReason || undefined,
      });
      setBlockRange(null);
      setBlockReason('');
      reloadBlocks();
    } catch (err) { onError(err); }
  };

  const removeBlock = async (id: number) => {
    try { await deleteBlockedPeriod(id); reloadBlocks(); } catch (err) { onError(err); }
  };

  return (
    <>
      <PageHeader title="Dies bloquejats" />
      <div className={styles.body}>
        <span className={styles.muted}>Els dies bloquejats tanquen l&apos;agenda per a tots els tipus de sessió.</span>
        <div className={`${styles.surface} ${styles.blockedCard}`}>
          <div className={styles.blockForm}>
            <RangePicker value={blockRange} onChange={(v) => setBlockRange(v as [Dayjs, Dayjs] | null)} />
            <Input placeholder="Motiu (opcional)" value={blockReason} onChange={(e) => setBlockReason(e.target.value)} />
            <Button type="primary" block icon={<AdminIcons.block />} onClick={addBlock} disabled={!blockRange}>
              Bloquejar aquests dies
            </Button>
          </div>
          {blocks.length === 0 ? (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Cap dia bloquejat" />
          ) : blocks.map((b) => (
            <div key={b.id} className={styles.listItem}>
              <div className={styles.listItemText}>
                <span className={styles.strong}>
                  {b.from === b.to ? formatDate(b.from) : `${formatDate(b.from)} → ${formatDate(b.to)}`}
                </span>
                <span className={styles.muted}>{b.reason || 'Sense motiu'}</span>
              </div>
              <Popconfirm title="Desbloquejar?" onConfirm={() => removeBlock(b.id)}>
                <IconButton icon="remove" label="Desbloquejar" size="small" danger />
              </Popconfirm>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
