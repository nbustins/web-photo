import { FC } from 'react';
import { Alert, Spin, Typography, Input, Button, Space, Form, Switch } from 'antd';
import type { WeddingGuestPageContext } from '../WeddingGuestPage.types';
import { MobileShell } from '@ui/MobileShell';
import shared from './GuestShared.module.css';
import styles from './GuestMobileLayout.module.css';

const { Title, Text } = Typography;

interface MobileLayoutProps extends WeddingGuestPageContext {
  images: string[];
  attendingCount: number;
}

export const GuestMobileLayout: FC<MobileLayoutProps> = ({
  pageState,
  wedding,
  invitation,
  manualCode,
  submitting,
  form,
  onCodeChange,
  onCodeSubmit,
  submitError,
  onFormSubmit,
  onReset,
  images,
  attendingCount,
}) => {
  const weddingTitle = wedding?.title ?? '';
  const weddingSubtitle = wedding?.subtitle ?? 'Confirma la teva assistència';

  const expanded = pageState === 'form' || pageState === 'success' || pageState === 'not-found' || pageState === 'closed';

  const renderPanelContent = () => {
    switch (pageState) {
      case 'loading':
        return (
          <div className={styles.spinnerWrap}>
            <Spin size="large" />
          </div>
        );

      case 'enter-code':
        return (
          <>
            <Title level={2} className={styles.title}>{weddingTitle}</Title>
            <Text className={styles.subtitle}>{weddingSubtitle}</Text>
            <div className={styles.codeBlock}>
              <span className={styles.label}>Introdueix el teu codi d'invitació</span>
              <Space.Compact className={styles.codeField}>
                <Input
                  size="large"
                  placeholder="Codi d'invitació"
                  value={manualCode}
                  onChange={(e) => onCodeChange(e.target.value.toUpperCase())}
                  onPressEnter={onCodeSubmit}
                  className={shared.codeInput}
                />
                <Button size="large" type="primary" onClick={onCodeSubmit}>
                  Continuar
                </Button>
              </Space.Compact>
            </div>
          </>
        );

      case 'not-found':
        return (
          <>
            <div className={`${styles.icon} ${styles.iconError}`}>✕</div>
            <Title level={3} className={styles.stateTitle}>
              Convidat no trobat
            </Title>
            <Text className={styles.stateText}>
              No hem trobat cap convidat amb aquest codi. Si us plau, verifica el codi i torna-ho a intentar.
            </Text>
            <Button type="primary" onClick={onReset} block className={styles.actionButton}>
              Tornar a introduir codi
            </Button>
          </>
        );

      case 'closed':
        return (
          <>
            <div className={`${styles.icon} ${styles.iconInfo}`}>ℹ</div>
            <Title level={3} className={styles.stateTitle}>
              Confirmació tancada
            </Title>
            <Text className={styles.stateText}>
              La data límit per confirmar l'assistència ha passat. Si necessites fer algún canvi, contacta amb els nuvis.
            </Text>
          </>
        );

      case 'form':
        if (!invitation) return null;
        return (
          <>
            <Title level={2} className={styles.title}>{weddingTitle}</Title>
            <Text className={styles.subtitle}>{weddingSubtitle}</Text>
            <Text className={styles.greeting}>
              Hola, {invitation.label}!
            </Text>

            <Form
              form={form}
              layout="vertical"
              onFinish={onFormSubmit}
              className={styles.form}
            >
              <Form.Item
                label={<span className={styles.label}>Qui assistirà a la celebració?</span>}
                className={styles.guestsItem}
              >
                <Form.List name="guests">
                  {(fields) =>
                    fields.map((field) => (
                      <div key={field.key} className={shared.guestRow}>
                        <Form.Item name={[field.name, 'id']} hidden noStyle>
                          <input type="hidden" />
                        </Form.Item>
                        <Form.Item name={[field.name, 'name']} hidden noStyle>
                          <input type="hidden" />
                        </Form.Item>
                        <Text className={styles.guestName}>
                          {form.getFieldValue(['guests', field.name, 'name'])}
                        </Text>
                        <Form.Item
                          name={[field.name, 'attending']}
                          valuePropName="checked"
                          noStyle
                        >
                          <Switch checkedChildren="Vinc" unCheckedChildren="No vinc" />
                        </Form.Item>
                      </div>
                    ))
                  }
                </Form.List>
              </Form.Item>

              <Form.Item
                name="notes"
                label={<span className={styles.label}>Observacions (al·lèrgies, menú especial, etc.)</span>}
              >
                <Input.TextArea
                  rows={3}
                  placeholder="Escriu les teves observacions aquí..."
                  className={shared.input}
                  showCount
                  maxLength={500}
                />
              </Form.Item>

              {submitError && (
                <Form.Item>
                  <Alert type="warning" showIcon message={submitError} />
                </Form.Item>
              )}

              <Form.Item className={styles.submitItem}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={submitting}
                  size="large"
                  block
                  className={styles.submitButton}
                >
                  Confirmar assistència
                </Button>
              </Form.Item>
            </Form>
          </>
        );

      case 'success': {
        const totalCount = invitation?.guests.length ?? 0;
        const allAttending = attendingCount === totalCount && totalCount > 0;
        const noneAttending = attendingCount === 0;
        const message = allAttending
          ? 'Gràcies per confirmar la vostra assistència. Esperem veure-us a la celebració!'
          : noneAttending
            ? 'Ens sap greu que no pugueu assistir. Us trobarem a faltar!'
            : `${attendingCount} de ${totalCount} persones assistiran a la celebració. Gràcies per confirmar!`;
        return (
          <>
            <div className={`${styles.icon} ${styles.iconSuccess}`}>✓</div>
            <Title level={3} className={styles.stateTitle}>
              Confirmació rebuda!
            </Title>
            <Text className={styles.stateText}>{message}</Text>
            <Text className={styles.successHint}>
              Pots tancar aquesta finestra, si vols modificar la teva confirmació accedeix de nou amb el codi.
            </Text>
            <Button
              type="primary"
              size="large"
              onClick={onReset}
              block
              className={styles.actionButton}
            >
              Tornar a introduir codi
            </Button>
          </>
        );
      }

      default:
        return null;
    }
  };

  return (
    <MobileShell
      images={images}
      fallbackImage={wedding?.hero_image}
      alt={weddingTitle}
      expanded={expanded}
    >
      {renderPanelContent()}
    </MobileShell>
  );
};
