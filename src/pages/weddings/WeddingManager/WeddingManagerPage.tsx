import { FC, useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Layout, Card, Typography, Form } from 'antd';
import { guestService } from '../../../services/wedding/guest.provider';
import { login, logout } from '../../../services/auth/auth.service';
import { getUser } from '../../../services/auth/auth.store';
import type { Wedding, ConfirmationRow, InvitationSongs, WeddingFeatures } from '../../../model/wedding.types';
import { useIsMobile } from '@ui/hooks/useIsMobile';
import { LoginCard } from '@ui/LoginCard';
import { AdminShell, ShellItem } from '@ui/AdminShell';
import { ManagerSections, weddingManagerSectionPath } from '../../../model/routes.model';
import type { LoginFormValues } from './WeddingManager.types';
import type { ManagerShellContext } from './managerShell';
import styles from './WeddingManager.module.css';

const { Content } = Layout;
const { Title, Text } = Typography;

const NO_FEATURES: WeddingFeatures = { hotelInfo: false, transportToHotel: false, songRequests: false, allergens: false };

type ManagerState = 'login' | 'loading' | 'error' | 'data';

export const WeddingManagerPage: FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [state, setState] = useState<ManagerState>(() => (getUser() ? 'loading' : 'login'));
  const [wedding, setWedding] = useState<Wedding | null>(null);
  const [weddingImages, setWeddingImages] = useState<string[]>([]);
  const [weddingNotFound, setWeddingNotFound] = useState(false);
  const [rows, setRows] = useState<ConfirmationRow[]>([]);
  const [invitationSongs, setInvitationSongs] = useState<InvitationSongs[]>([]);
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
      const loadedWedding = await loadWeddingVisuals();
      const [data, songs] = await Promise.all([
        guestService.getConfirmations(slug),
        loadedWedding?.features?.songRequests ? guestService.getInvitationSongs(slug) : Promise.resolve([]),
      ]);
      setRows(data);
      setInvitationSongs(songs);
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

    const withImages =
      weddingData && photoUrls.length > 0
        ? {
            ...weddingData,
            hero_image: weddingData.hero_image ?? photoUrls[0],
            background_image: weddingData.background_image ?? photoUrls[0],
          }
        : weddingData;
    setWedding(withImages);
    setWeddingImages(photoUrls);
    setWeddingNotFound(weddingData === null);
    return withImages;
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
    setInvitationSongs([]);
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

  const features = wedding?.features ?? NO_FEATURES;
  const sections: ShellItem[] = [
    {
      key: ManagerSections.confirmacions,
      label: 'Confirmacions',
      icon: 'guests',
      badge: rows.filter(r => r.guestAttending === null).length,
    },
    ...(features.songRequests ? [{ key: ManagerSections.musica, label: 'Música', icon: 'list' as const }] : []),
  ];
  const outletContext: ManagerShellContext = { weddingTitle, rows, features, invitationSongs };

  return (
    <AdminShell
      brandTitle={weddingTitle || 'Casament'}
      brandCaption="Gestió del casament"
      items={sections}
      activeKey={pathname.split('/')[4] ?? sections[0].key}
      onSelect={(key) => navigate(weddingManagerSectionPath(slug ?? '', key))}
      onLogout={handleLogout}
      outletContext={outletContext}
    />
  );
};
