import { FC, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { message } from 'antd';
import { Form } from 'antd';
import { guestService } from '../../services/wedding';
import { getPublicPath } from '../../utils/pathUtils';
import type { Wedding, Invitation, ConfirmInvitationPayload } from '../../model/wedding.types';
import {
  LoadingState,
  EnterCodeState,
  NotFoundState,
  ClosedState,
  FormState,
  SuccessState,
  MobileLayout,
} from './components';
import type { WeddingPageProps, WeddingPageContext, InvitationFormValues } from './WeddingPage.types';
import { useIsMobile } from './useIsMobile';

export type { WeddingPageProps, WeddingPageContext, InvitationFormValues } from './WeddingPage.types';

const renderDefault = (ctx: WeddingPageContext, attendingCount: number) => {
  const { pageState, wedding, invitation, manualCode, submitting, form, onCodeChange, onCodeSubmit, onFormSubmit, onReset } = ctx;

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
      return invitation ? (
        <FormState
          title={weddingTitle}
          subtitle={weddingSubtitle}
          heroImage={heroImage}
          invitation={invitation}
          form={form}
          submitting={submitting}
          onFinish={onFormSubmit}
        />
      ) : null;
    case 'success':
      return (
        <SuccessState
          attendingCount={attendingCount}
          totalCount={invitation?.guests.length ?? 0}
          onReset={onReset}
        />
      );
    default:
      return null;
  }
};

export const WeddingPage: FC<WeddingPageProps> = ({ slug, images = [], renderCustom }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const isMobile = useIsMobile();
  const [pageState, setPageState] = useState<WeddingPageContext['pageState']>('loading');
  const [wedding, setWedding] = useState<Wedding | null>(null);
  const [weddingImages, setWeddingImages] = useState<string[]>([]);
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [form] = Form.useForm<InvitationFormValues>();
  const [submitting, setSubmitting] = useState(false);
  const [attendingCount, setAttendingCount] = useState(0);

  const code = searchParams.get('code');

  useEffect(() => {
    const init = async () => {
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
    const found = await guestService.getInvitation(slug, inviteCode);

    if (!found) {
      setPageState('not-found');
      return;
    }

    const closingDate = new Date(found.eventDate ?? '');
    if (!isNaN(closingDate.getTime()) && closingDate < new Date()) {
      setPageState('closed');
      return;
    }

    setInvitation(found);
    form.setFieldsValue({
      notes: found.notes ?? undefined,
      guests: found.guests.map(g => ({
        id: g.id,
        name: g.name,
        attending: g.attending ?? false,
      })),
    });
    setPageState('form');
  };

  const handleCodeSubmit = () => {
    if (manualCode.trim()) {
      setSearchParams({ code: manualCode.trim().toUpperCase() });
    }
  };

  const handleFormSubmit = async (values: InvitationFormValues) => {
    if (!invitation) return;

    setSubmitting(true);

    const payload: ConfirmInvitationPayload = {
      slug,
      inviteCode: invitation.inviteCode,
      notes: values.notes || null,
      guests: values.guests.map(g => ({ id: g.id, name: g.name, attending: g.attending })),
    };

    const result = await guestService.saveConfirmation(payload);
    setSubmitting(false);

    if (result.success) {
      setAttendingCount(values.guests.filter(g => g.attending).length);
      setPageState('success');
    } else {
      message.error(result.error || 'Error al guardar la confirmació');
    }
  };

  const ctx: WeddingPageContext = {
    pageState,
    wedding,
    images: weddingImages.length > 0 ? weddingImages : images,
    invitation,
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

  if (isMobile) {
    return <MobileLayout {...ctx} images={ctx.images} attendingCount={attendingCount} />;
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
        {renderDefault(ctx, attendingCount)}
      </div>
    </div>
  );
};
