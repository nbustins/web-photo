import { FC } from 'react';
import { Spin, Typography, Input, Button, Space, Form, Switch } from 'antd';
import { motion } from 'framer-motion';
import type { WeddingPageContext } from '../WeddingPage.types';
import { MobileSwiper } from './MobileSwiper';

const { Title, Text } = Typography;

interface MobileLayoutProps extends WeddingPageContext {
  images: string[];
  attendingCount: number;
}

const titleStyle: React.CSSProperties = {
  fontFamily: "'Italiana', Georgia, serif",
  fontSize: 'clamp(1.8rem, 7vw, 2.4rem)',
  fontWeight: 500,
  color: '#7C7458',
  margin: 0,
  letterSpacing: '0.02em',
  textAlign: 'center',
};

const subtitleStyle: React.CSSProperties = {
  fontFamily: "'Raleway', sans-serif",
  fontSize: 'clamp(0.7rem, 2.8vw, 0.85rem)',
  fontWeight: 400,
  color: 'rgb(174, 142, 116)',
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  display: 'block',
  textAlign: 'center',
  marginTop: 6,
};

const labelStyle: React.CSSProperties = {
  fontFamily: "'Raleway', sans-serif",
  fontSize: '0.85rem',
  fontWeight: 500,
  color: '#5a5a5a',
  letterSpacing: '0.02em',
};

const guestRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '14px 16px',
  borderRadius: 10,
  border: '1px solid rgba(124, 116, 88, 0.2)',
  marginBottom: 10,
  background: 'rgba(255,255,255,0.6)',
};

const inputStyle: React.CSSProperties = {
  fontFamily: "'Raleway', sans-serif",
  borderRadius: 8,
};

const iconStyle = (gradient: string): React.CSSProperties => ({
  width: 56,
  height: 56,
  borderRadius: '50%',
  background: gradient,
  color: 'white',
  fontSize: 28,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto 16px',
});

export const MobileLayout: FC<MobileLayoutProps> = ({
  pageState,
  wedding,
  invitation,
  manualCode,
  submitting,
  form,
  onCodeChange,
  onCodeSubmit,
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
          <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0' }}>
            <Spin size="large" />
          </div>
        );

      case 'enter-code':
        return (
          <>
            <Title level={2} style={titleStyle}>{weddingTitle}</Title>
            <Text style={subtitleStyle}>{weddingSubtitle}</Text>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12,
              marginTop: 20,
            }}>
              <span style={{
                fontFamily: "'Raleway', sans-serif",
                fontSize: '0.85rem',
                fontWeight: 500,
                color: '#5a5a5a',
                letterSpacing: '0.02em',
              }}>
                Introdueix el teu codi d'invitació
              </span>
              <Space.Compact style={{ width: '100%' }}>
                <Input
                  size="large"
                  placeholder="Codi d'invitació"
                  value={manualCode}
                  onChange={(e) => onCodeChange(e.target.value.toUpperCase())}
                  onPressEnter={onCodeSubmit}
                  style={{
                    fontFamily: "'Raleway', sans-serif",
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                  }}
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
            <div style={iconStyle('linear-gradient(135deg, #a09880 0%, #8a8070 100%)')}>✕</div>
            <Title level={3} style={{ ...titleStyle, fontSize: '1.5rem' }}>
              Convidat no trobat
            </Title>
            <Text style={{
              display: 'block',
              fontFamily: "'Raleway', sans-serif",
              fontSize: '0.95rem',
              color: '#6a6a6a',
              lineHeight: 1.6,
              textAlign: 'center',
              marginTop: 12,
            }}>
              No hem trobat cap convidat amb aquest codi. Si us plau, verifica el codi i torna-ho a intentar.
            </Text>
            <Button type="primary" onClick={onReset} block style={{ marginTop: 20 }}>
              Tornar a introduir codi
            </Button>
          </>
        );

      case 'closed':
        return (
          <>
            <div style={iconStyle('linear-gradient(135deg, rgb(174, 142, 116) 0%, rgb(154, 122, 96) 100%)')}>ℹ</div>
            <Title level={3} style={{ ...titleStyle, fontSize: '1.5rem' }}>
              Confirmació tancada
            </Title>
            <Text style={{
              display: 'block',
              fontFamily: "'Raleway', sans-serif",
              fontSize: '0.95rem',
              color: '#6a6a6a',
              lineHeight: 1.6,
              textAlign: 'center',
              marginTop: 12,
            }}>
              La data límit per confirmar l'assistència ha passat. Si necessites fer algún canvi, contacta amb els nuvis.
            </Text>
          </>
        );

      case 'form':
        if (!invitation) return null;
        return (
          <>
            <Title level={2} style={titleStyle}>{weddingTitle}</Title>
            <Text style={subtitleStyle}>{weddingSubtitle}</Text>
            <Text style={{
              display: 'block',
              fontFamily: "'Italiana', Georgia, serif",
              fontSize: '1.1rem',
              fontStyle: 'italic',
              color: '#9a9080',
              textAlign: 'center',
              marginTop: 12,
              marginBottom: 8,
            }}>
              Hola, {invitation.label}!
            </Text>

            <Form
              form={form}
              layout="vertical"
              onFinish={onFormSubmit}
              style={{ textAlign: 'left', marginTop: 16 }}
            >
              <Form.Item
                label={<span style={labelStyle}>Qui assistirà a la celebració?</span>}
                style={{ marginBottom: 8 }}
              >
                <Form.List name="guests">
                  {(fields) =>
                    fields.map((field) => (
                      <div key={field.key} style={guestRowStyle}>
                        <Form.Item name={[field.name, 'id']} hidden noStyle>
                          <input type="hidden" />
                        </Form.Item>
                        <Form.Item name={[field.name, 'name']} hidden noStyle>
                          <input type="hidden" />
                        </Form.Item>
                        <Text style={{
                          fontFamily: "'Raleway', sans-serif",
                          fontSize: '0.95rem',
                          color: '#333',
                        }}>
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
                label={<span style={labelStyle}>Observacions (al·lèrgies, menú especial, etc.)</span>}
              >
                <Input.TextArea
                  rows={3}
                  placeholder="Escriu les teves observacions aquí..."
                  style={inputStyle}
                  showCount
                  maxLength={500}
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={submitting}
                  size="large"
                  block
                  style={{ marginTop: 8 }}
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
            <div style={iconStyle('linear-gradient(135deg, #7C7458 0%, #6a6450 100%)')}>✓</div>
            <Title level={3} style={{ ...titleStyle, fontSize: '1.5rem' }}>
              Confirmació rebuda!
            </Title>
            <Text style={{
              display: 'block',
              fontFamily: "'Raleway', sans-serif",
              fontSize: '0.95rem',
              color: '#6a6a6a',
              lineHeight: 1.6,
              textAlign: 'center',
              marginTop: 12,
            }}>
              {message}
            </Text>
            <Text style={{
              display: 'block',
              fontFamily: "'Raleway', sans-serif",
              fontSize: '0.8rem',
              color: '#9a9a9a',
              textAlign: 'center',
              marginTop: 12,
            }}>
              Pots tancar aquesta finestra, si vols modificar la teva confirmació accedeix de nou amb el codi.
            </Text>
            <Button
              type="primary"
              size="large"
              onClick={onReset}
              block
              style={{ marginTop: 20 }}
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
    <div style={{
      position: 'fixed',
      inset: 0,
      background: '#f5f0ea',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      <div style={{
        flex: 1,
        minHeight: 0,
        position: 'relative',
      }}>
        <MobileSwiper
          images={images}
          fallbackImage={wedding?.hero_image}
          alt={weddingTitle}
        />
      </div>

      <motion.div
        initial={false}
        animate={{ maxHeight: expanded ? '80vh' : '45vh' }}
        transition={{ type: 'spring', stiffness: 220, damping: 28 }}
        style={{
          position: 'relative',
          marginTop: -28,
          background: 'rgba(255, 255, 255, 0.97)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderRadius: '24px 24px 0 0',
          boxShadow: '0 -6px 24px rgba(124, 116, 88, 0.12)',
          padding: '24px 22px calc(24px + env(safe-area-inset-bottom)) 22px',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <div style={{
          width: 44,
          height: 4,
          borderRadius: 2,
          background: 'rgba(124, 116, 88, 0.25)',
          margin: '0 auto 18px',
        }} />
        {renderPanelContent()}
      </motion.div>
    </div>
  );
};
