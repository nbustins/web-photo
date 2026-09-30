import { FC, useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Layout, Card, Typography, Form } from 'antd';
import { guestService } from '../../../services/wedding/guest.provider';
import { login, logout } from '../../../services/auth/auth.service';
import { getUser } from '../../../services/auth/auth.store';
import type { Wedding, ConfirmationRow } from '../../../model/wedding.types';
import { useIsMobile } from '@ui/hooks/useIsMobile';
import { LoginCard } from '@ui/LoginCard';
import { AdminShell, ShellItem } from '@ui/AdminShell';
import { weddingManagerSectionPath } from '../../../model/routes.model';
import type { LoginFormValues } from './WeddingManager.types';
import type { ManagerShellContext } from './managerShell';
import styles from './WeddingManager.module.css';

const { Content } = Layout;
const { Title, Text } = Typography;

const SECTIONS: ShellItem[] = [
  { key: 'confirmacions', label: 'Confirmacions', icon: 'guests' },
];

type ManagerState = 'login' | 'loading' | 'error' | 'data';

export const WeddingManagerPage: FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [state, setState] = useState<ManagerState>(() => (getUser() ? 'loading' : 'login'));
  const [wedding, setWedding] = useState<Wedding | null>(null);
  const [weddingImages, setWeddingImages] = useState<string[]>([]);
  const [weddingNotFound, setWeddingNotFound] = useState(false);
  const [rows, setRows] = useState<ConfirmationRow[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm<LoginFormValues>();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!slug) return;
    loadWeddingVisuals();
  }, [slug]);

  useEffect(() => {
    if (slug && getUser()) loadData();
  }, [slug]);

  const loadData = async () => {
    if (!slug) return;
    setState('loading');
    try {
      await loadWeddingVisuals();
      const data = await guestService.getConfirmations(slug);
      setRows(data);
      setState('data');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Error desconegut');
      setState('error');
    }
  };

  const loadWeddingVisuals = async () => {
    if (!slug) return;

    const [weddingData, photoUrls] = await Promise.all([
      guestService.getWeddingBySlug(slug),
      guestService.getWeddingPhotos(slug),
    ]);

    setWedding(
      weddingData && photoUrls.length > 0
        ? {
            ...weddingData,
            hero_image: weddingData.hero_image ?? photoUrls[0],
            background_image: weddingData.background_image ?? photoUrls[0],
          }
        : weddingData
    );
    setWeddingImages(photoUrls);
    setWeddingNotFound(weddingData === null);
  };

  const handleLogin = async ({ email, password }: LoginFormValues) => {
    setSubmitting(true);
    setErrorMessage('');
    const result = await login(email, password);
    setSubmitting(false);
    if (!result.success) { setErrorMessage(result.error); return; }
    await loadData();
  };

  const handleLogout = () => {
    logout();
    setRows([]);
    form.resetFields();
    setState('login');
  };

  const weddingTitle = wedding?.title ?? '';
  const managerTitle = weddingTitle ? `Gestió ${weddingTitle}` : 'Gestió';

  if (weddingNotFound) {
    return (
      <Layout className={styles.layout}>
        <Content className={styles.content}>
          <Card className={styles.card}>
            <Title level={3} className={styles.title}>Boda no trobada</Title>
            <Text type="secondary">No existeix cap boda amb el slug "{slug}".</Text>
          </Card>
        </Content>
      </Layout>
    );
  }

  if (state === 'login' || state === 'error') {
    return (
      <LoginCard
        form={form}
        title={managerTitle}
        alt={weddingTitle}
        images={weddingImages}
        fallbackImage={isMobile ? wedding?.hero_image : wedding?.background_image}
        isMobile={isMobile}
        submitting={submitting}
        errorMessage={errorMessage}
        onFinish={handleLogin}
      />
    );
  }

  if (state === 'loading') {
    return (
      <Layout className={styles.layout}>
        <Content className={styles.content}>
          <Card className={styles.card}><Text>Carregant...</Text></Card>
        </Content>
      </Layout>
    );
  }

  const outletContext: ManagerShellContext = { weddingTitle, rows };

  return (
    <AdminShell
      brandTitle={weddingTitle || 'Casament'}
      brandCaption="Gestió del casament"
      items={SECTIONS}
      activeKey={pathname.split('/')[4] ?? SECTIONS[0].key}
      onSelect={(key) => navigate(weddingManagerSectionPath(slug ?? '', key))}
      onLogout={handleLogout}
      outletContext={outletContext}
    />
  );
};
