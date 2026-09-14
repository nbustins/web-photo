import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, Button, Spin, Tag } from 'antd';
import dayjs from 'dayjs';
import { ApiError } from '../../services/api.client';
import {
  BookingByToken,
  BookingContract,
  BookingStatus,
  ImageRightsConsent,
  fetchBookingByToken,
  fetchBookingContract,
  fetchContractPdf,
  signBookingContract,
} from '../../services/booking/booking.api';
import { bookingContractPath } from '../../model/routes.model';
import { ContractSheet } from './ContractSheet';
import styles from './BookingViewPage.module.css';
import { errorMessage } from '../../services/error-messages';

const STATUS: Record<BookingStatus, { label: string; color: string }> = {
  Requested: { label: 'Pendent de confirmar', color: 'gold' },
  Confirmed: { label: 'Confirmada', color: 'green' },
  Paid: { label: 'Pagada', color: 'green' },
  Cancelled: { label: 'Cancel·lada', color: 'red' },
};

interface BookingViewPageProps {
  /** 'summary' is the booking's own page; 'contract' is the signing page under it. */
  view: 'summary' | 'contract';
}

export const BookingViewPage = ({ view }: BookingViewPageProps) => {
  const { token = '' } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState<BookingByToken | null>(null);
  const [contract, setContract] = useState<BookingContract | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [signing, setSigning] = useState(false);
  const [signError, setSignError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [bookingData, contractData] = await Promise.all([
        fetchBookingByToken(token),
        fetchBookingContract(token),
      ]);
      setBooking(bookingData);
      setContract(contractData);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) setNotFound(true);
      else setSignError("No s'ha pogut carregar la reserva. Torna-ho a provar.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const sign = async (imageRights: ImageRightsConsent, signaturePngBase64: string) => {
    setSigning(true);
    setSignError(null);
    try {
      await signBookingContract(token, { imageRights, signatureImagePngBase64: signaturePngBase64 });
      await load();
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setSignError(errorMessage(err, 'Aquest contracte ja està signat.'));
        await load();
      } else if (err instanceof ApiError && err.status === 429) {
        setSignError(errorMessage(err, 'Massa intents. Espera uns minuts i torna-ho a provar.'));
      } else {
        setSignError(errorMessage(err, "No s'ha pogut signar el contracte. Torna-ho a provar."));
      }
    } finally {
      setSigning(false);
    }
  };

  const download = async () => {
    const blob = await fetchContractPdf(token);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'contracte.pdf';
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className={styles.loadingWrap}>
        <Spin size="large" />
      </div>
    );
  }

  if (notFound || !booking || !contract) {
    return (
      <div className={styles.narrowPage}>
        <Alert
          type="warning"
          showIcon
          message="No hem trobat aquesta reserva"
          description="Comprova l'enllaç del correu de confirmació o escriu-nos i te'l tornem a enviar."
        />
      </div>
    );
  }

  const status = STATUS[booking.status];

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.eyebrow}>
          La teva reserva
        </div>
        <h1 className={styles.title}>
          {contract.fields.packName}
        </h1>
        <div className={styles.dateLine}>
          {dayjs(booking.startAt).format('dddd D [de] MMMM [de] YYYY · HH:mm')} h
        </div>
        <div className={styles.statusRow}>
          <Tag color={status.color}>{status.label}</Tag>
          <Tag color={contract.signed ? 'green' : 'default'}>
            {contract.signed ? 'Contracte signat' : 'Contracte pendent de signar'}
          </Tag>
        </div>
      </header>

      {booking.status === 'Cancelled' ? (
        <Alert
          type="info"
          showIcon
          message="Aquesta reserva està cancel·lada"
          description="Si vols recuperar-la o triar una altra data, escriu-nos i ho mirem."
        />
      ) : view === 'contract' ? (
        <ContractSheet
          contract={contract}
          onSign={sign}
          onDownload={download}
          signing={signing}
          error={signError}
        />
      ) : (
        <div className={styles.centerText}>
          <p className={styles.bodyText}>
            {contract.signed
              ? 'El teu contracte ja està signat. En pots descarregar una còpia quan vulguis.'
              : 'Falta el contracte de la sessió. El pots llegir i signar des d\'aquí, en un minut.'}
          </p>
          {contract.signed ? (
            <Button size="large" onClick={download} className={styles.secondaryButton}>
              Descarrega el contracte signat
            </Button>
          ) : (
            <Button
              type="primary"
              size="large"
              onClick={() => navigate(bookingContractPath(token))}
              className={styles.primaryButton}
            >
              Llegeix i signa el contracte
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
