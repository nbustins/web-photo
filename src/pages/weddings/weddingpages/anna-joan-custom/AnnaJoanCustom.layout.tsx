import { FC } from 'react';
import { Spin, Typography } from 'antd';
import type { WeddingPageContext } from '../../WeddingPage.types';
import {
  EnterCodeState,
  NotFoundState,
  ClosedState,
  FormState,
  SuccessState,
} from '../../components';

const { Title, Text } = Typography;

/**
 * Layout custom de validació per anna-joan.
 * Demostra que renderCustom rep el context complet i pot renderitzar lliurement.
 */
export const AnnaJoanCustomLayout: FC<WeddingPageContext> = ({
  pageState,
  wedding,
  guest,
  manualCode,
  submitting,
  form,
  onCodeChange,
  onCodeSubmit,
  onFormSubmit,
  onReset,
}) => {
  const weddingTitle = wedding?.title ?? '';
  const weddingSubtitle = wedding?.subtitle ?? 'Confirma la teva assistència';
  const heroImage = wedding?.hero_image;

  const renderContent = () => {
    switch (pageState) {
      case 'loading':
        return (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 90 }}>
            <Spin size="large" />
          </div>
        );
      case 'enter-code':
        return (
          <EnterCodeState
            title={weddingTitle}
            subtitle={weddingSubtitle}
            heroImage={heroImage}
            value={manualCode}
            onChange={onCodeChange}
            onSubmit={onCodeSubmit}
          />
        );
      case 'not-found':
        return <NotFoundState title={weddingTitle} heroImage={heroImage} onReset={onReset} />;
      case 'closed':
        return <ClosedState title={weddingTitle} heroImage={heroImage} />;
      case 'form':
        return guest ? (
          <FormState
            title={weddingTitle}
            subtitle={weddingSubtitle}
            heroImage={heroImage}
            guest={guest}
            form={form}
            submitting={submitting}
            onFinish={onFormSubmit}
          />
        ) : null;
      case 'success':
        return <SuccessState attending={form.getFieldValue('attending')} />;
      default:
        return null;
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '40px 16px',
      boxSizing: 'border-box',
    }}>
      {/* Banner custom */}
      <div style={{ marginBottom: 32, textAlign: 'center' }}>
        <Title level={4} style={{ color: '#e2b96f', margin: 0, letterSpacing: '0.3em', textTransform: 'uppercase', fontWeight: 300 }}>
          disseny alternatiu · validació
        </Title>
        <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
          renderCustom actiu
        </Text>
      </div>

      <div style={{ width: '100%', maxWidth: 520 }}>
        {renderContent()}
      </div>
    </div>
  );
};
