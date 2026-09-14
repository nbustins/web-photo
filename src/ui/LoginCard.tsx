import { FC } from 'react';
import { Button, Form, FormInstance, Input, Typography } from 'antd';
import { DesktopSplitBackground } from '@ui/DesktopSplitBackground';
import { MobileShell } from '@ui/MobileShell';
import { SurfaceCard, SurfaceCardHeader } from '@ui/SurfaceCard';
import formStyles from '@ui/formStyles.module.css';
import styles from './LoginCard.module.css';

const { Title, Text } = Typography;

export interface LoginFormValues {
  email: string;
  password: string;
}

interface LoginCardProps {
  title: string;
  subtitle?: string;
  images?: string[];
  fallbackImage?: string;
  alt?: string;
  isMobile: boolean;
  submitting: boolean;
  errorMessage?: string;
  onFinish: (values: LoginFormValues) => void;
  form?: FormInstance<LoginFormValues>;
}

export const LoginCard: FC<LoginCardProps> = ({
  title,
  subtitle = 'Àrea privada',
  images = [],
  fallbackImage,
  alt,
  isMobile,
  submitting,
  errorMessage,
  onFinish,
  form,
}) => {
  const loginForm = (
    <Form form={form} layout="vertical" onFinish={onFinish} requiredMark={false}>
      <Form.Item
        name="email"
        label={<span className={formStyles.label}>Email</span>}
        rules={[{ required: true, type: 'email', message: 'Email vàlid requerit' }]}
      >
        <Input size="large" autoComplete="email" className={formStyles.input} />
      </Form.Item>
      <Form.Item
        name="password"
        label={<span className={formStyles.label}>Contrasenya</span>}
        rules={[{ required: true, message: 'Contrasenya requerida' }]}
      >
        <Input.Password size="large" autoComplete="current-password" className={formStyles.input} />
      </Form.Item>
      <Form.Item className={styles.submitItem}>
        <Button size="large" type="primary" htmlType="submit" loading={submitting} block>
          Accedir
        </Button>
      </Form.Item>
      {errorMessage && <Text type="danger" className={styles.error}>{errorMessage}</Text>}
    </Form>
  );

  if (isMobile) {
    return (
      <MobileShell images={images} fallbackImage={fallbackImage} alt={alt ?? title} expanded>
        <Title level={2} className={styles.mobileTitle}>
          {title}
        </Title>
        <Text className={styles.mobileSubtitle}>{subtitle}</Text>
        {loginForm}
      </MobileShell>
    );
  }

  return (
    <div className={styles.screen}>
      <DesktopSplitBackground images={images} fallbackImage={fallbackImage} />

      <div className={styles.panel}>
        <SurfaceCard>
          <SurfaceCardHeader title={title} subtitle={subtitle} />
          <div className={styles.formWrap}>
            {loginForm}
          </div>
        </SurfaceCard>
      </div>
    </div>
  );
};
