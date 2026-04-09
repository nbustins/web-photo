import { FC, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { message } from 'antd';
import { Form } from 'antd';
import { guestService } from '../../services/wedding';
import { getPublicPath } from '../../utils/pathUtils';
import type { Wedding, GuestWithWedding, ConfirmationPayload } from '../../model/wedding.types';
import {
  LoadingState,
  EnterCodeState,
  NotFoundState,
  ClosedState,
  FormState,
  SuccessState,
} from './components';

type PageState = 'loading' | 'enter-code' | 'not-found' | 'closed' | 'form' | 'success';

export interface WeddingConfig {
  slug: string;
}

export const WeddingPage: FC<WeddingConfig> = ({ slug }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [pageState, setPageState] = useState<PageState>('loading');
  const [wedding, setWedding] = useState<Wedding | null>(null);
  const [guest, setGuest] = useState<GuestWithWedding | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const code = searchParams.get('code');

  useEffect(() => {
    const init = async () => {
      const weddingData = await guestService.getWeddingBySlug(slug);
      setWedding(weddingData);

      if (code) {
        validateCode(code);
      } else {
        setPageState('enter-code');
      }
    };
    init();
  }, [code]);

  const validateCode = async (inviteCode: string) => {
    setPageState('loading');
    const foundGuest = await guestService.getGuestBySlugAndCode(slug, inviteCode);

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

  const handleSubmit = async (values: { attending: boolean; companions_count?: number; companions_names?: string[]; notes?: string }) => {
    if (!guest) return;

    setSubmitting(true);

    const payload: ConfirmationPayload = {
      guest_id: guest.id,
      attending: values.attending,
      companions_count: values.attending ? (values.companions_count || 0) : 0,
      companion_names: values.attending ? (values.companions_names || []) : [],
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

  const weddingTitle = wedding?.title ?? '';
  const weddingSubtitle = wedding?.subtitle ?? 'Confirma la teva assistència';
  const heroImage = wedding?.hero_image;

  const renderContent = () => {
    switch (pageState) {
      case 'loading':
        return <LoadingState />;

      case 'enter-code':
        return (
          <EnterCodeState
            title={weddingTitle}
            subtitle={weddingSubtitle}
            heroImage={heroImage}
            value={manualCode}
            onChange={setManualCode}
            onSubmit={handleCodeSubmit}
          />
        );

      case 'not-found':
        return <NotFoundState title={weddingTitle} heroImage={heroImage} onReset={() => setSearchParams({})} />;

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
            onFinish={handleSubmit}
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
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      position: 'relative',
      backgroundColor: 'rgb(246, 244, 240)',
      padding: '40px 16px',
      boxSizing: 'border-box',
    }}>
      {wedding?.background_image ? (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          backgroundImage: `url(${getPublicPath(wedding.background_image)})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(20px) brightness(0.9)',
          transform: 'scale(1.1)',
        }} />
      ) : (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          backgroundColor: 'rgb(246, 244, 240)',
        }} />
      )}

      <div style={{
        position: 'relative',
        zIndex: 1,
        width: '100%',
        maxWidth: 520,
        margin: 'auto',
      }}>
        {renderContent()}
      </div>
    </div>
  );
};
