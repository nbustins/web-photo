import { FC } from 'react';
import { Button, Form, FormInstance, Input, Typography } from 'antd';
import { DesktopSplitBackground, MobileShell, WeddingCard, WeddingCardHeader } from '../../common';
import type { LoginFormValues } from '../WeddingManager.types';

const { Title, Text } = Typography;

interface ManagerLoginCardProps {
  form: FormInstance<LoginFormValues>;
  title: string;
  weddingTitle: string;
  images: string[];
  fallbackImage?: string;
  isMobile: boolean;
  submitting: boolean;
  errorMessage?: string;
  onFinish: (values: LoginFormValues) => void;
}

const labelStyle: React.CSSProperties = {
  fontFamily: "'Raleway', sans-serif",
  fontSize: 'clamp(0.85rem, 1.3vw, 0.9rem)',
  fontWeight: 500,
  color: '#5a5a5a',
  letterSpacing: '0.02em',
};

const inputStyle: React.CSSProperties = {
  fontFamily: "'Raleway', sans-serif",
  borderRadius: 8,
};

export const ManagerLoginCard: FC<ManagerLoginCardProps> = ({
  form,
  title,
  weddingTitle,
  images,
  fallbackImage,
  isMobile,
  submitting,
  errorMessage,
  onFinish,
}) => {
  const loginForm = (
    <Form form={form} layout="vertical" onFinish={onFinish} requiredMark={false}>
      <Form.Item
        name="email"
        label={<span style={labelStyle}>Email</span>}
        rules={[{ required: true, type: 'email', message: 'Email vàlid requerit' }]}
      >
        <Input size="large" autoComplete="email" style={inputStyle} />
      </Form.Item>
      <Form.Item
        name="password"
        label={<span style={labelStyle}>Contrasenya</span>}
        rules={[{ required: true, message: 'Contrasenya requerida' }]}
      >
        <Input.Password size="large" autoComplete="current-password" style={inputStyle} />
      </Form.Item>
      <Form.Item style={{ marginBottom: 0 }}>
        <Button size="large" type="primary" htmlType="submit" loading={submitting} block>
          Accedir
        </Button>
      </Form.Item>
      {errorMessage && <Text type="danger" style={{ display: 'block', marginTop: 12 }}>{errorMessage}</Text>}
    </Form>
  );

  if (isMobile) {
    return (
      <MobileShell images={images} fallbackImage={fallbackImage} alt={weddingTitle} expanded>
        <Title
          level={2}
          style={{
            fontFamily: "'Italiana', Georgia, serif",
            fontSize: 'clamp(1.6rem, 6vw, 2rem)',
            fontWeight: 500,
            color: '#7C7458',
            margin: 0,
            letterSpacing: '0.02em',
            textAlign: 'center',
          }}
        >
          {title}
        </Title>
        <Text
          style={{
            display: 'block',
            fontFamily: "'Raleway', sans-serif",
            fontSize: '0.78rem',
            color: 'rgb(174, 142, 116)',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            textAlign: 'center',
            marginTop: 6,
            marginBottom: 20,
          }}
        >
          Àrea privada
        </Text>
        {loginForm}
      </MobileShell>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      position: 'relative',
      backgroundColor: 'rgb(246, 244, 240)',
      padding: '40px 16px',
      boxSizing: 'border-box',
    }}>
      <DesktopSplitBackground images={images} fallbackImage={fallbackImage} />

      <div style={{
        position: 'relative',
        zIndex: 1,
        width: '100%',
        maxWidth: 520,
        margin: 'auto',
      }}>
        <WeddingCard>
          <WeddingCardHeader title={title} subtitle="Àrea privada" />
          <div style={{ maxWidth: 320, margin: '0 auto', textAlign: 'left' }}>
            {loginForm}
          </div>
        </WeddingCard>
      </div>
    </div>
  );
};
