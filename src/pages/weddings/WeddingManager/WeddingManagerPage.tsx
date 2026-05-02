import { FC, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Layout, Card, Typography, Form } from 'antd';
import { guestService } from '../../../services/wedding';
import { login, logout } from '../../../services/auth/auth.service';
import { getUser } from '../../../services/auth/auth.store';
import type { Wedding, ConfirmationRow } from '../../../model/wedding.types';
import { useIsMobile } from '../common';
import type { InvitationSummary, LoginFormValues, ManagerStats } from './WeddingManager.types';
import {
  ManagerDesktopDashboard,
  ManagerInvitationDrawer,
  ManagerLoginCard,
  ManagerMobileDashboard,
  ManagerNotesModal,
} from './components';
import './WeddingManager.css';

const { Content } = Layout;
const { Title, Text } = Typography;

type ManagerState = 'login' | 'loading' | 'error' | 'data';

const buildSummary = (rows: ConfirmationRow[], invitationId: number): InvitationSummary | null => {
  const matching = rows.filter(r => r.invitationId === invitationId);
  if (!matching.length) return null;
  const first = matching[0];
  return {
    invitationId: first.invitationId,
    label: first.label,
    inviteCode: first.inviteCode,
    maxAddedGuests: first.maxAddedGuests,
    notes: first.notes,
    guests: matching.map(r => ({ id: r.guestId, name: r.guestName, isPredefined: r.isPredefined, attending: r.guestAttending })),
  };
};

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
  const [selectedSummary, setSelectedSummary] = useState<InvitationSummary | null>(null);
  const [noteModal, setNoteModal] = useState<string | null>(null);
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
      <Layout className="manager-layout">
        <Content className="manager-content">
          <Card className="manager-card">
            <Title level={3} className="manager-title">Boda no trobada</Title>
            <Text type="secondary">No existeix cap boda amb el slug "{slug}".</Text>
          </Card>
        </Content>
      </Layout>
    );
  }

  const getStats = (): ManagerStats => {
    const totalGuests = rows.length;
    const confirmed = rows.filter(r => r.guestAttending === true).length;
    const declined = rows.filter(r => r.guestAttending === false).length;
    const pending = rows.filter(r => r.guestAttending === null).length;
    const invitationIds = new Set(rows.map(r => r.invitationId));
    const respondedIds = new Set(rows.filter(r => r.guestAttending !== null).map(r => r.invitationId));
    return { totalGuests, confirmed, declined, pending, totalInvitations: invitationIds.size, respondedInvitations: respondedIds.size };
  };

  if (state === 'login' || state === 'error') {
    return (
      <ManagerLoginCard
        form={form}
        title={managerTitle}
        weddingTitle={weddingTitle}
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
      <Layout className="manager-layout">
        <Content className="manager-content">
          <Card className="manager-card"><Text>Carregant...</Text></Card>
        </Content>
      </Layout>
    );
  }

  const stats = getStats();

  const overlays = (
    <>
      <ManagerNotesModal note={noteModal} onClose={() => setNoteModal(null)} />
      <ManagerInvitationDrawer summary={selectedSummary} onClose={() => setSelectedSummary(null)} />
    </>
  );

  if (isMobile) {
    return (
      <>
        <ManagerMobileDashboard
          weddingTitle={weddingTitle}
          rows={rows}
          stats={stats}
          onLogout={handleLogout}
          onSelectInvitation={(id) => setSelectedSummary(buildSummary(rows, id))}
          onShowNote={(note) => setNoteModal(note)}
        />
        {overlays}
      </>
    );
  }

  return (
    <>
      <ManagerDesktopDashboard
        weddingTitle={weddingTitle}
        rows={rows}
        stats={stats}
        onLogout={handleLogout}
        onSelectInvitation={(id) => setSelectedSummary(buildSummary(rows, id))}
        onShowNote={(note) => setNoteModal(note)}
      />
      {overlays}
    </>
  );
};
