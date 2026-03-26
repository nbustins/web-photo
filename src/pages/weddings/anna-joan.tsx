import { FC, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Form, Input, Radio, Button, InputNumber, message, Typography, Space, Divider } from 'antd';
import { motion } from 'framer-motion';
import { guestService } from '../../services/guestService';
import type { GuestWithWedding, ConfirmationPayload } from '../../model/wedding.types';
import './wedding-rsvp.css';

const { Title, Text } = Typography;

type PageState = 'loading' | 'enter-code' | 'not-found' | 'closed' | 'form' | 'success';

export const AnnaJoanWedding: FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [pageState, setPageState] = useState<PageState>('loading');
  const [guest, setGuest] = useState<GuestWithWedding | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const code = searchParams.get('code');

  useEffect(() => {
    if (code) {
      validateCode(code);
    } else {
      setPageState('enter-code');
    }
  }, [code]);

  const validateCode = async (inviteCode: string) => {
    setPageState('loading');
    const foundGuest = await guestService.getGuestBySlugAndCode('anna-joan', inviteCode);
    
    if (!foundGuest) {
      setPageState('not-found');
      return;
    }

    const closingDate = new Date(foundGuest.wedding.closing_date);
    if (closingDate < new Date()) {
      setPageState('closed');
      return;
    }

    setGuest(foundGuest);
    setPageState('form');
  };

  const handleCodeSubmit = () => {
    if (manualCode.trim()) {
      setSearchParams({ code: manualCode.trim().toUpperCase() });
    }
  };

  const handleSubmit = async (values: { attending: boolean; companions_count?: number; companion_names?: string[]; notes?: string }) => {
    if (!guest) return;

    setSubmitting(true);
    
    const payload: ConfirmationPayload = {
      guest_id: guest.id,
      attending: values.attending,
      companions_count: values.attending ? (values.companions_count || 0) : 0,
      companion_names: values.attending ? (values.companion_names || []) : [],
      notes: values.notes || '',
    };

    const result = await guestService.saveConfirmation(payload);
    
    setSubmitting(false);
    
    if (result.success) {
      setPageState('success');
    } else {
      message.error(result.error || 'Error al guardar la confirmació');
    }
  };

  const renderContent = () => {
    switch (pageState) {
      case 'loading':
        return (
          <div className="wedding-loading">
            <div className="wedding-spinner" />
          </div>
        );

      case 'enter-code':
        return (
          <motion.div
            className="wedding-card"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="wedding-card-header">
              <Title level={2} className="wedding-title">Anna & Joan</Title>
              <Text className="wedding-subtitle">Confirma la teva assistència</Text>
            </div>
            <Divider className="wedding-divider" />
            <div className="wedding-code-form">
              <Text className="wedding-label">Introdueix el teu codi d'invitació</Text>
              <Space.Compact style={{ width: '100%', maxWidth: 300 }}>
                <Input
                  size="large"
                  placeholder="Codi d'invitació"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                  onPressEnter={handleCodeSubmit}
                  className="wedding-code-input"
                />
                <Button size="large" type="primary" onClick={handleCodeSubmit} className="wedding-code-btn">
                  Continuar
                </Button>
              </Space.Compact>
            </div>
          </motion.div>
        );

      case 'not-found':
        return (
          <motion.div
            className="wedding-card"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="wedding-icon-error">✕</div>
            <Title level={3} className="wedding-title">Convidat no trobat</Title>
            <Text className="wedding-text">
              No hem trobat cap convidat amb aquest codi. Si us plau, verifica el codi i torna-ho a intentar.
            </Text>
            <Button 
              type="primary" 
              onClick={() => setSearchParams({})}
              className="wedding-btn"
              style={{ marginTop: 24 }}
            >
              Tornar a introduir codi
            </Button>
          </motion.div>
        );

      case 'closed':
        return (
          <motion.div
            className="wedding-card"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="wedding-icon-info">ℹ</div>
            <Title level={3} className="wedding-title">Confirmació tancada</Title>
            <Text className="wedding-text">
              La data límit per confirmar l'assistència ha passat. Si necessites fer algún canvi, si us plau contacta directament amb els nuvis.
            </Text>
          </motion.div>
        );

      case 'form':
        return (
          <motion.div
            className="wedding-card"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="wedding-card-header">
              <Title level={2} className="wedding-title">Anna & Joan</Title>
              <Text className="wedding-subtitle">Confirma la teva assistència</Text>
              <Text className="wedding-guest-name">Hola, {guest?.name}!</Text>
            </div>
            <Divider className="wedding-divider" />
            
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              className="wedding-form"
              initialValues={{ attending: true, companions_count: 0 }}
            >
              <Form.Item
                name="attending"
                label={<span className="wedding-label">Assistiràs a la celebració?</span>}
                rules={[{ required: true, message: 'Si us plau, selecciona una opció' }]}
              >
                <Radio.Group className="wedding-radio-group">
                  <Radio value={true} className="wedding-radio">
                    <span className="wedding-radio-label">Sí, hi seré</span>
                  </Radio>
                  <Radio value={false} className="wedding-radio">
                    <span className="wedding-radio-label">No podré assistir</span>
                  </Radio>
                </Radio.Group>
              </Form.Item>

              <Form.Item noStyle shouldUpdate={(prev, curr) => prev.attending !== curr.attending}>
                {({ getFieldValue }) => 
                  getFieldValue('attending') === true && (
                    <>
                      <Form.Item
                        name="companions_count"
                        label={<span className="wedding-label">Nombre de acompanyants (màxim {guest?.max_companions})</span>}
                        rules={[
                          { required: true, message: 'Si us plau, indica el nombre de acompanyants' },
                          { type: 'number', min: 0, max: guest?.max_companions || 0, message: `El nombre màxim és ${guest?.max_companions}` }
                        ]}
                      >
                        <InputNumber min={0} max={guest?.max_companions || 0} className="wedding-input-number" />
                      </Form.Item>

                      <Form.Item noStyle shouldUpdate={(prev, curr) => prev.companions_count !== curr.companions_count}>
                        {({ getFieldValue }) => {
                          const count = getFieldValue('companions_count') || 0;
                          const companionFields = [];
                          for (let i = 0; i < count; i++) {
                            companionFields.push(
                              <Form.Item
                                key={i}
                                name={['companion_names', i]}
                                label={<span className="wedding-label">Nom de l'acompanyant {i + 1}</span>}
                                rules={[{ required: true, message: 'Si us plau, introdueix el nom' }]}
                              >
                                <Input placeholder={`Acompanyant ${i + 1}`} className="wedding-input" />
                              </Form.Item>
                            );
                          }
                          return <>{companionFields}</>;
                        }}
                      </Form.Item>
                    </>
                  )
                }
              </Form.Item>

              <Form.Item
                name="notes"
                label={<span className="wedding-label">Observacions (al·lèrgies, menú especial, etc.)</span>}
              >
                <Input.TextArea 
                  rows={3} 
                  placeholder="Escriu les teves observacions aquí..." 
                  className="wedding-textarea"
                  showCount
                  maxLength={500}
                />
              </Form.Item>

              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={submitting}
                  className="wedding-btn wedding-btn-submit"
                  size="large"
                >
                  Confirmar assistència
                </Button>
              </Form.Item>
            </Form>
          </motion.div>
        );

      case 'success':
        return (
          <motion.div
            className="wedding-card"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="wedding-icon-success">✓</div>
            <Title level={3} className="wedding-title">Confirmació rebuda!</Title>
            <Text className="wedding-text">
              {form.getFieldValue('attending')
                ? "Gràcies per confirmar la teva assistència. Esperem veure't a la celebració!"
                : 'Ens sap greu que no puguis assistir. Et trobarem a faltar!'}
            </Text>
            <Text className="wedding-text wedding-text-small">
              Pots tancar aquesta finestra. Si necessites fer algún canvi, contacta amb els nuvis.
            </Text>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="wedding-page">
      <div className="wedding-background" />
      <div className="wedding-container">
        {renderContent()}
      </div>
    </div>
  );
};
