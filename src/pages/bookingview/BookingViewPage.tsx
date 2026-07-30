import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, Button, Spin, Tag } from 'antd';
import dayjs from 'dayjs';
import 'dayjs/locale/ca';
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
import { pageStyle } from '../booksession/styles';
import { ContractSheet } from './ContractSheet';

dayjs.locale('ca');

const OLIVE = '#7C7458';

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
        setSignError('Aquest contracte ja està signat.');
        await load();
      } else if (err instanceof ApiError && err.status === 429) {
        setSignError('Massa intents. Espera uns minuts i torna-ho a provar.');
      } else {
        setSignError(err instanceof ApiError ? err.message : "No s'ha pogut signar el contracte. Torna-ho a provar.");
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
      <div style={{ ...pageStyle, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (notFound || !booking || !contract) {
    return (
      <div style={pageStyle}>
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
    <div style={{ ...pageStyle, maxWidth: 900 }}>
      <header style={{ textAlign: 'center', marginBottom: 'clamp(24px, 5vw, 40px)' }}>
        <div
          style={{
            fontFamily: "'Raleway', sans-serif",
            fontSize: '0.75rem',
            letterSpacing: '0.24em',
            textTransform: 'uppercase',
            color: '#a09880',
          }}
        >
          La teva reserva
        </div>
        <h1
          style={{
            fontFamily: "'Italiana', Georgia, serif",
            color: OLIVE,
            fontSize: 'clamp(1.9rem, 5vw, 2.6rem)',
            margin: '8px 0 12px',
          }}
        >
          {contract.fields.packName}
        </h1>
        <div style={{ fontFamily: "'Raleway', sans-serif", color: '#6a6a6a', fontSize: '0.98rem' }}>
          {dayjs(booking.startAt).format('dddd D [de] MMMM [de] YYYY · HH:mm')} h
        </div>
        <div style={{ marginTop: 12 }}>
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
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontFamily: "'Raleway', sans-serif", color: '#6a6a6a', lineHeight: 1.8 }}>
            {contract.signed
              ? 'El teu contracte ja està signat. En pots descarregar una còpia quan vulguis.'
              : 'Falta el contracte de la sessió. El pots llegir i signar des d\'aquí, en un minut.'}
          </p>
          {contract.signed ? (
            <Button size="large" onClick={download} style={{ borderColor: OLIVE, color: OLIVE }}>
              Descarrega el contracte signat
            </Button>
          ) : (
            <Button
              type="primary"
              size="large"
              onClick={() => navigate(bookingContractPath(token))}
              style={{ background: OLIVE, borderColor: OLIVE, paddingInline: 32 }}
            >
              Llegeix i signa el contracte
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
