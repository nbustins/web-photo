import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Alert, Button, Radio, Space } from 'antd';
import dayjs from 'dayjs';
import { BookingContract, ImageRightsConsent } from '../../services/booking/booking.api';
import { SignaturePad } from './SignaturePad';

const OLIVE = '#7C7458';
const INK = '#4a4539';
const RULE = 'rgba(124, 116, 88, 0.25)';

const IMAGE_RIGHTS_CHOICES: { value: ImageRightsConsent; label: string }[] = [
  { value: 'GrantAll', label: 'Autoritzo la publicació de les fotografies, incloses les dels menors' },
  { value: 'GrantMineDenyMinors', label: 'Autoritzo les meves fotografies, però no la de les dels menors' },
  { value: 'DenyAll', label: 'No autoritzo la publicació de les fotografies' },
];

const sheetStyle: React.CSSProperties = {
  background: '#FFFDF7',
  border: `1px solid ${RULE}`,
  borderRadius: 4,
  boxShadow: '0 10px 40px rgba(124, 116, 88, 0.12)',
  padding: 'clamp(28px, 5vw, 56px) clamp(22px, 5vw, 60px)',
};

const titleStyle: React.CSSProperties = {
  fontFamily: "'Italiana', Georgia, serif",
  color: OLIVE,
  fontSize: 'clamp(1.5rem, 4vw, 2.1rem)',
  letterSpacing: '0.06em',
  textAlign: 'center',
  margin: 0,
};

const sectionTitleStyle: React.CSSProperties = {
  fontFamily: "'Italiana', Georgia, serif",
  color: OLIVE,
  fontSize: 'clamp(1.05rem, 2.2vw, 1.2rem)',
  letterSpacing: '0.04em',
  margin: '0 0 8px',
};

const paragraphStyle: React.CSSProperties = {
  fontFamily: "'Raleway', sans-serif",
  fontSize: 'clamp(0.88rem, 1.4vw, 0.95rem)',
  color: INK,
  lineHeight: 1.8,
  textAlign: 'justify',
  margin: '0 0 10px',
};

interface ContractSheetProps {
  contract: BookingContract;
  onSign: (imageRights: ImageRightsConsent, signaturePngBase64: string) => Promise<void>;
  onDownload: () => void;
  signing: boolean;
  error: string | null;
}

export const ContractSheet = ({ contract, onSign, onDownload, signing, error }: ContractSheetProps) => {
  const reduceMotion = useReducedMotion();
  const [imageRights, setImageRights] = useState<ImageRightsConsent>(contract.imageRights);
  const [signature, setSignature] = useState<string | null>(null);

  const signed = contract.signed;

  return (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      style={sheetStyle}
    >
      <h1 style={titleStyle}>Contracte de prestació de serveis fotogràfics</h1>
      <div style={{ height: 1, background: RULE, margin: '18px auto 32px', maxWidth: 120 }} />

      {contract.sections.map((section) => (
        <section key={section.title} style={{ marginBottom: 26 }}>
          <h2 style={sectionTitleStyle}>{section.title}</h2>
          {section.paragraphs.map((paragraph, index) =>
            // The image-rights clause is the one the client decides here, so while the contract
            // is unsigned it is a choice, not a sentence (API spec 010 Q7).
            paragraph === contract.fields.checkAuthorization && !signed ? (
              <Radio.Group
                key={index}
                value={imageRights}
                onChange={(event) => setImageRights(event.target.value)}
                style={{ display: 'block', margin: '4px 0 14px' }}
              >
                <Space direction="vertical" size={8}>
                  {IMAGE_RIGHTS_CHOICES.map((choice) => (
                    <Radio key={choice.value} value={choice.value} style={{ ...paragraphStyle, textAlign: 'left', margin: 0 }}>
                      {choice.label}
                    </Radio>
                  ))}
                </Space>
              </Radio.Group>
            ) : (
              <p key={index} style={paragraphStyle}>{paragraph}</p>
            ),
          )}
        </section>
      ))}

      <div style={{ height: 1, background: RULE, margin: '32px 0 24px' }} />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 'clamp(24px, 4vw, 48px)',
          alignItems: 'end',
        }}
      >
        <div>
          <div style={{ ...sectionTitleStyle, fontSize: '1rem', marginBottom: 4 }}>La Fotògrafa</div>
          <div style={{ height: 120, display: 'flex', alignItems: 'flex-end', borderBottom: `1px solid ${RULE}` }}>
            <span style={{ fontFamily: "'Borel', cursive", color: INK, fontSize: '1.1rem', paddingBottom: 6 }}>
              Laura Trias
            </span>
          </div>
          <div style={{ fontFamily: "'Raleway', sans-serif", fontSize: '0.78rem', color: '#9a9a9a', marginTop: 6 }}>
            Laura Trias Corredor · DNI 41649068R
          </div>
        </div>

        <div>
          <div style={{ ...sectionTitleStyle, fontSize: '1rem', marginBottom: 4 }}>El/La Client/a</div>
          {signed ? (
            <>
              <div style={{ height: 120, display: 'flex', alignItems: 'flex-end', borderBottom: `1px solid ${RULE}` }}>
                <span style={{ fontFamily: "'Borel', cursive", color: INK, fontSize: '1.1rem', paddingBottom: 6 }}>
                  {contract.fields.clientName}
                </span>
              </div>
              <div style={{ fontFamily: "'Raleway', sans-serif", fontSize: '0.78rem', color: '#9a9a9a', marginTop: 6 }}>
                Signat el {dayjs(contract.signedAtUtc).format('D MMMM YYYY [a les] HH:mm')}
              </div>
            </>
          ) : (
            <SignaturePad onChange={setSignature} />
          )}
        </div>
      </div>

      {error && <Alert type="error" showIcon message={error} style={{ marginTop: 24 }} />}

      <div style={{ marginTop: 28, textAlign: 'center' }}>
        {signed ? (
          <Button size="large" onClick={onDownload} style={{ borderColor: OLIVE, color: OLIVE }}>
            Descarrega el contracte signat
          </Button>
        ) : (
          <>
            <Button
              type="primary"
              size="large"
              loading={signing}
              disabled={!signature}
              onClick={() => signature && onSign(imageRights, signature)}
              style={{ background: OLIVE, borderColor: OLIVE, paddingInline: 36 }}
            >
              Signar el contracte
            </Button>
            <div style={{ fontFamily: "'Raleway', sans-serif", fontSize: '0.78rem', color: '#9a9a9a', marginTop: 10 }}>
              En signar acceptes les condicions d'aquest contracte. No es podrà modificar després.
            </div>
          </>
        )}
      </div>
    </motion.article>
  );
};
