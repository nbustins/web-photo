import { FC, useState } from 'react';
import { Form } from 'antd';
import { useNavigate } from 'react-router-dom';
import { login } from '../../services/auth/auth.service';
import { isAuthenticated } from '../../services/auth/auth.store';
import { LoginCard, type LoginFormValues } from '@ui/LoginCard';
import { useIsMobile } from '@ui/hooks/useIsMobile';

export const AdminLogin: FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [form] = Form.useForm<LoginFormValues>();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>();

  if (isAuthenticated()) {
    navigate('/admin', { replace: true });
  }

  const onFinish = async ({ email, password }: LoginFormValues) => {
    setSubmitting(true);
    setError(undefined);
    const result = await login(email, password);
    setSubmitting(false);
    if (result.success) {
      navigate('/admin', { replace: true });
    } else {
      setError(result.error);
    }
  };

  return (
    <LoginCard
      form={form}
      title="Administració"
      subtitle="Gestió de reserves"
      isMobile={isMobile}
      submitting={submitting}
      errorMessage={error}
      onFinish={onFinish}
    />
  );
};
