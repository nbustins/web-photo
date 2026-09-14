import { ReactNode } from 'react';
import { Empty, Spin, Table } from 'antd';
import type { TableColumnType, TableProps } from 'antd';
import { useIsMobile } from './hooks/useIsMobile';
import styles from './ResponsiveTable.module.css';

export type ResponsiveColumn<T> = TableColumnType<T> & {
  /** Marks the column whose value becomes the card title on mobile (default: first column with a title). */
  mobileTitle?: boolean;
  /** Excludes the column from the mobile card. */
  mobileHidden?: boolean;
};

interface ResponsiveTableProps<T> extends Omit<TableProps<T>, 'columns'> {
  columns: ResponsiveColumn<T>[];
}

/**
 * antd Table on desktop; on mobile (useIsMobile) a vertical card list generated
 * from the same column definitions. Mobile ignores pagination and column
 * filters/sorters — spec 008.
 */
export function ResponsiveTable<T extends object>(props: ResponsiveTableProps<T>) {
  const isMobile = useIsMobile();
  if (!isMobile) return <Table<T> {...props} />;

  const { columns, dataSource, rowKey, loading, locale, onRow } = props;
  const rows = [...(dataSource ?? [])];

  // ponytail: string dataIndex only — no tab uses array paths; extend if one ever does.
  const cellValue = (col: ResponsiveColumn<T>, record: T, index: number): ReactNode => {
    const raw = col.dataIndex != null ? (record as Record<string, unknown>)[col.dataIndex as string] : record;
    return (col.render ? col.render(raw, record, index) : raw) as ReactNode;
  };

  const getKey = (record: T, index: number): React.Key =>
    typeof rowKey === 'function'
      ? rowKey(record, index)
      : rowKey
        ? ((record as Record<string, unknown>)[rowKey as string] as React.Key)
        : index;

  const visible = columns.filter(c => !c.mobileHidden);
  const titleCol = visible.find(c => c.mobileTitle) ?? visible.find(c => c.title);
  const fieldCols = visible.filter(c => c !== titleCol && c.title);
  const actionCols = visible.filter(c => c !== titleCol && !c.title);
  const spinning = typeof loading === 'object' ? !!loading.spinning : !!loading;

  return (
    <Spin spinning={spinning}>
      {rows.length === 0 ? (
        (locale?.emptyText as ReactNode) ?? <Empty />
      ) : (
        <div className={styles.list}>
          {rows.map((record, index) => {
            const rowProps = onRow?.(record, index);
            return (
              <article
                key={getKey(record, index)}
                className={rowProps?.onClick ? `${styles.card} ${styles.clickable}` : styles.card}
                onClick={rowProps?.onClick}
              >
                {titleCol && <div className={styles.cardTitle}>{cellValue(titleCol, record, index)}</div>}
                {fieldCols.map((col, i) => (
                  <div key={i} className={styles.field}>
                    <span className={styles.label}>{col.title as ReactNode}</span>
                    <span className={styles.value}>{cellValue(col, record, index)}</span>
                  </div>
                ))}
                {actionCols.length > 0 && (
                  <div className={styles.actions}>
                    {actionCols.map((col, i) => (
                      <span key={i}>{cellValue(col, record, index)}</span>
                    ))}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </Spin>
  );
}
