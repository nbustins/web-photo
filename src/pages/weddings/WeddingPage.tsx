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
import type { WeddingPageProps, WeddingPageContext, FormValues } from './WeddingPage.types';

export type { WeddingPageProps, WeddingPageContext, FormValues } from './WeddingPage.types';

const renderDefault = (ctx: WeddingPageContext) => {
  const { pageState, wedding, guest, manualCode, submitting, form, onCodeChange, onCodeSubmit, onFormSubmit, onReset } = ctx;

  const weddingTitle = wedding?.title ?? '';
  const weddingSubtitle = wedding?.subtitle ?? 'Confirma la teva assistència';
  const heroImage = wedding?.hero_image;

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

export const WeddingPage: FC<WeddingPageProps> = ({ slug, renderCustom }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [pageState, setPageState] = useState<WeddingPageContext['pageState']>('loading');
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

  const handleFormSubmit = async (values: FormValues) => {
    if (!guest) return;

    setSubmitting(true);

    const payload: ConfirmationPayload = {
      guest_id: guest.id,
      slug,
      invite_code: guest.invite_code,
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

  const ctx: WeddingPageContext = {
    pageState,
    wedding,
    guest,
    manualCode,
    submitting,
    form,
    onCodeChange: setManualCode,
    onCodeSubmit: handleCodeSubmit,
    onFormSubmit: handleFormSubmit,
    onReset: () => setSearchParams({}),
  };

  if (renderCustom) {
    return <>{renderCustom(ctx)}</>;
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
        {renderDefault(ctx)}
      </div>
    </div>
  );
};
