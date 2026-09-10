import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Alert, Button, Radio, Space } from 'antd';
import dayjs from 'dayjs';
import { BookingContract, ImageRightsConsent } from '../../services/booking/booking.api';
import { imageUrl } from '@utils/pathUtils';
import { SignaturePad } from './SignaturePad';
import styles from './ContractSheet.module.css';

const IMAGE_RIGHTS_CHOICES: { value: ImageRightsConsent; label: string }[] = [
  { value: 'GrantAll', label: 'Autoritzo la publicació de les fotografies, incloses les dels menors' },
  { value: 'GrantMineDenyMinors', label: 'Autoritzo les meves fotografies, però no la de les dels menors' },
  { value: 'DenyAll', label: 'No autoritzo la publicació de les fotografies' },
];

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
      className={styles.sheet}
    >
      <h1 className={styles.title}>Contracte de prestació de serveis fotogràfics</h1>
      <div className={styles.dividerTop} />

      {contract.sections.map((section) => (
        <section key={section.title} className={styles.sectionBlock}>
          <h2 className={styles.sectionTitle}>{section.title}</h2>
          {section.paragraphs.map((paragraph, index) =>
            // The image-rights clause is the one the client decides here, so while the contract
            // is unsigned it is a choice, not a sentence (API spec 010 Q7).
            paragraph === contract.fields.checkAuthorization && !signed ? (
              <Radio.Group
                key={index}
                value={imageRights}
                onChange={(event) => setImageRights(event.target.value)}
                className={styles.radioGroup}
              >
                <Space direction="vertical" size={8}>
                  {IMAGE_RIGHTS_CHOICES.map((choice) => (
                    <Radio key={choice.value} value={choice.value} className={`${styles.paragraph} ${styles.paragraphChoice}`}>
                      {choice.label}
                    </Radio>
                  ))}
                </Space>
              </Radio.Group>
            ) : (
              <p key={index} className={styles.paragraph}>{paragraph}</p>
            ),
          )}
        </section>
      ))}

      <div className={styles.dividerMid} />

      <div className={styles.signatureGrid}>
        <div>
          <div className={`${styles.sectionTitle} ${styles.signatureLabel}`}>La Fotògrafa</div>
          <div className={styles.signatureLine}>
            <img
              src={imageUrl('Logo.png')}
              alt="Signatura de Laura Trias"
              className={styles.signatureImage}
            />
          </div>
          <div className={styles.signatureMeta}>
            Laura Trias Corredor · DNI 41649068R
          </div>
        </div>

        <div>
          <div className={`${styles.sectionTitle} ${styles.signatureLabel}`}>El/La Client/a</div>
          {signed ? (
            <>
              <div className={styles.signatureLine}>
                {contract.signatureImageDataUrl && (
                  <img
                    src={contract.signatureImageDataUrl}
                    alt={`Signatura de ${contract.fields.clientName}`}
                    className={styles.signatureImage}
                  />
                )}
              </div>
              <div className={styles.signatureMeta}>
                Signat el {dayjs(contract.signedAtUtc).format('D MMMM YYYY [a les] HH:mm')}
              </div>
            </>
          ) : (
            <SignaturePad onChange={setSignature} />
          )}
        </div>
      </div>

      {error && <Alert type="error" showIcon message={error} className={styles.alertSpacing} />}

      <div className={styles.actions}>
        {signed ? (
          <Button size="large" onClick={onDownload} className={styles.secondaryButton}>
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
              className={styles.primaryButton}
            >
              Signar el contracte
            </Button>
            <div className={styles.signHint}>
              En signar acceptes les condicions d'aquest contracte. No es podrà modificar després.
            </div>
          </>
        )}
      </div>
    </motion.article>
  );
};
