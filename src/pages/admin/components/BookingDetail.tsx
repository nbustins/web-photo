import { FC } from 'react';
import { Button, Collapse, Drawer, Popconfirm, Space, Tag, Typography } from 'antd';
import { useIsMobile } from '@ui/hooks/useIsMobile';
import type { AdminBooking, BookingStatus } from '../../../services/booking/booking.admin.api';
import { bookingContractPath } from '../../../model/routes.model';
import { AdminIcons } from '../icons';
import { BookingEmailKind, ResendEmailButtons } from './ResendEmailButtons';
import {
  IMAGE_RIGHTS_LABEL, STATUS_ACTION_LABEL, STATUS_COLOR, STATUS_CONFIRM, STATUS_LABEL,
  STATUS_TRANSITIONS, formatDayHeading, formatInstant, formatTime,
} from '../labels';
import styles from '../admin.module.css';

// The app is a HashRouter SPA, so the shareable link carries the route after the '#'.
const contractLink = (token: string) =>
  `${window.location.origin}${window.location.pathname}#${bookingContractPath(token)}`;

interface BookingDetailProps {
  booking: AdminBooking | null;
  typeName: string;
  acting: boolean;
  onClose: () => void;
  onChangeStatus: (next: BookingStatus) => void;
  onResend: (kind: BookingEmailKind) => void;
  onDownloadContract: () => void;
}

/** One booking in a side drawer: who, when, contract, and the status actions pinned to the foot. */
export const BookingDetail: FC<BookingDetailProps> = ({
  booking, typeName, acting, onClose, onChangeStatus, onResend, onDownloadContract,
}) => {
  const isMobile = useIsMobile();
  // Destructive actions first, so the forward action ends up rightmost in the footer.
  const transitions = booking
    ? [...STATUS_TRANSITIONS[booking.status]].sort(
        (a, b) => Number(!!STATUS_CONFIRM[b].danger) - Number(!!STATUS_CONFIRM[a].danger))
    : [];

  return (
    <Drawer
      width={isMobile ? '100%' : 480}
      open={!!booking}
      onClose={onClose}
      title={booking ? `Reserva #${booking.id}` : ''}
      extra={booking && (
        <Typography.Text copyable={{ text: window.location.href, tooltips: ['Copiar enllaç a la reserva', 'Copiat'] }} />
      )}
      footer={transitions.length > 0 && (
        <Space className={styles.drawerFooter}>
          {transitions.map((next) => {
            const confirm = STATUS_CONFIRM[next];
            return (
              <Popconfirm
                key={next}
                title={confirm.title}
                description={confirm.description}
                okText={confirm.okText}
                cancelText="Deixa-ho estar"
                okButtonProps={{ danger: confirm.danger }}
                onConfirm={() => onChangeStatus(next)}
              >
                <Button type={confirm.danger ? 'default' : 'primary'} danger={confirm.danger} loading={acting}>
                  {STATUS_ACTION_LABEL[next]}
                </Button>
              </Popconfirm>
            );
          })}
        </Space>
      )}
    >
      {booking && (
        <>
          <div className={styles.detailHead}>
            <div className={styles.detailTitleRow}>
              <h2 className={styles.detailName}>{booking.clientName}</h2>
              <Tag color={STATUS_COLOR[booking.status]}>{STATUS_LABEL[booking.status]}</Tag>
            </div>
            <span className={styles.muted}>
              {formatDayHeading(booking.startAt)} · {formatTime(booking.startAt)} – {formatTime(booking.endAt)}
            </span>
            <span className={styles.detailSession}>{typeName}</span>
          </div>

          <section className={styles.detailSection}>
            <span className={styles.caption}>Client</span>
            <dl className={styles.kv}>
              <dt>Telèfon</dt>
              <dd><a href={`tel:${booking.clientPhone}`}>{booking.clientPhone}</a></dd>
              <dt>Email</dt>
              <dd>{booking.clientEmail ? <a href={`mailto:${booking.clientEmail}`}>{booking.clientEmail}</a> : '—'}</dd>
              <dt>DNI</dt>
              <dd>{booking.dni}</dd>
              <dt>Adreça</dt>
              <dd>{booking.address}</dd>
              <dt>Drets d'imatge</dt>
              <dd>{IMAGE_RIGHTS_LABEL[booking.imageRights]}</dd>
            </dl>
          </section>

          <section className={styles.detailSection}>
            <span className={styles.caption}>Sessió</span>
            <dl className={styles.kv}>
              <dt>Participants</dt>
              <dd>{booking.participants.map((p) => `${p.name}${p.age != null ? ` (${p.age})` : ''}`).join(', ') || '—'}</dd>
              <dt>Notes</dt>
              <dd>{booking.notes || '—'}</dd>
            </dl>
          </section>

          <section className={styles.detailSection}>
            <span className={styles.caption}>Contracte</span>
            <div className={styles.inlineRow}>
              {booking.contractSignedAt ? (
                <Tag color="green">Signat el {formatInstant(booking.contractSignedAt)}</Tag>
              ) : (
                <Tag>Pendent de signar</Tag>
              )}
              {booking.contractSignedAt && (
                <Button size="small" icon={<AdminIcons.download />} onClick={onDownloadContract}>Descarregar</Button>
              )}
            </div>
            <Typography.Paragraph type="secondary" style={{ margin: 0 }}>
              La pàgina on la clienta llegeix i signa el contracte. Es pot passar per WhatsApp o com
              convingui: el token ja hi dona accés, no cal cap contrasenya.
            </Typography.Paragraph>
            <Typography.Text copyable={{ text: contractLink(booking.confirmationToken) }} code className={styles.breakAll}>
              {contractLink(booking.confirmationToken)}
            </Typography.Text>
          </section>

          {/* Resending is a rescue action, not part of the daily flow: folded away by default. */}
          <Collapse
            ghost
            size="small"
            className={styles.detailCollapse}
            items={[{
              key: 'emails',
              label: 'Correus i avançat',
              children: (
                <Space direction="vertical" size={12}>
                  <Space wrap>
                    <ResendEmailButtons booking={booking} loading={acting} onResend={onResend} />
                  </Space>
                  <span className={styles.muted}>Token: {booking.confirmationToken}</span>
                </Space>
              ),
            }]}
          />
        </>
      )}
    </Drawer>
  );
};
