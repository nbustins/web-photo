import { FC, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { message } from 'antd';
import { Form } from 'antd';
import { guestService } from '../../../services/wedding';
import type { Wedding, Invitation, ConfirmInvitationPayload } from '../../../model/wedding.types';
import { DesktopSplitBackground } from '../common';
import {
  GuestLoadingState,
  GuestCodeEntry,
  GuestNotFoundState,
  GuestClosedState,
  GuestConfirmationForm,
  GuestSuccessState,
  GuestMobileLayout,
} from './components';
import type { WeddingGuestPageProps, WeddingGuestPageContext, InvitationFormValues } from './WeddingGuestPage.types';
import { useIsMobile } from '../common';

export type { WeddingGuestPageProps, WeddingGuestPageContext, InvitationFormValues } from './WeddingGuestPage.types';

const renderDefault = (ctx: WeddingGuestPageContext, attendingCount: number) => {
  const { pageState, wedding, invitation, manualCode, submitting, form, onCodeChange, onCodeSubmit, onFormSubmit, onReset } = ctx;

  const weddingTitle = wedding?.title ?? '';
  const weddingSubtitle = wedding?.subtitle ?? 'Confirma la teva assistència';

  switch (pageState) {
    case 'loading':
      return <GuestLoadingState />;
    case 'enter-code':
      return (
        <GuestCodeEntry
          title={weddingTitle}
          subtitle={weddingSubtitle}
          value={manualCode}
          onChange={onCodeChange}
          onSubmit={onCodeSubmit}
        />
      );
    case 'not-found':
      return <GuestNotFoundState title={weddingTitle} onReset={onReset} />;
    case 'closed':
      return <GuestClosedState title={weddingTitle} />;
    case 'form':
      return invitation ? (
        <GuestConfirmationForm
          title={weddingTitle}
          subtitle={weddingSubtitle}
          invitation={invitation}
          form={form}
          submitting={submitting}
          onFinish={onFormSubmit}
        />
      ) : null;
    case 'success':
      return (
        <GuestSuccessState
          attendingCount={attendingCount}
          totalCount={invitation?.guests.length ?? 0}
          onReset={onReset}
        />
      );
    default:
      return null;
  }
};

export const WeddingGuestPage: FC<WeddingGuestPageProps> = ({ slug, images = [], renderCustom }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const isMobile = useIsMobile();
  const [pageState, setPageState] = useState<WeddingGuestPageContext['pageState']>('loading');
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

  const ctx: WeddingGuestPageContext = {
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
    return <GuestMobileLayout {...ctx} images={ctx.images} attendingCount={attendingCount} />;
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
      <DesktopSplitBackground images={ctx.images} fallbackImage={wedding?.background_image} />

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
