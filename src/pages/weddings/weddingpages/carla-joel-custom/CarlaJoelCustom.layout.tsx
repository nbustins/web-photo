import { FC } from 'react';
import { Spin } from 'antd';
import type { WeddingPageContext } from '../../WeddingPage.types';
import {
  EnterCodeState,
  NotFoundState,
  ClosedState,
  FormState,
  SuccessState,
  DesktopSplitBackground,
} from '../../components';

export const CarlaJoelCustomLayout: FC<WeddingPageContext> = ({
  pageState,
  wedding,
  images,
  invitation,
  manualCode,
  submitting,
  form,
  onCodeChange,
  onCodeSubmit,
  onFormSubmit,
  onReset,
}) => {
  const weddingTitle = wedding?.title ?? '';
  const weddingSubtitle = wedding?.subtitle ?? 'Confirma la teva assistència';

  const guestValues: { attending: boolean }[] = form.getFieldValue('guests') ?? [];
  const attendingCount = guestValues.filter(g => g.attending).length;
  const totalCount = invitation?.guests.length ?? 0;

  const renderContent = () => {
    switch (pageState) {
      case 'loading':
        return (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
            <Spin size="large" />
          </div>
        );
      case 'enter-code':
        return (
          <EnterCodeState
            title={weddingTitle}
            subtitle={weddingSubtitle}
            value={manualCode}
            onChange={onCodeChange}
            onSubmit={onCodeSubmit}
          />
        );
      case 'not-found':
        return <NotFoundState title={weddingTitle} onReset={onReset} />;
      case 'closed':
        return <ClosedState title={weddingTitle} />;
      case 'form':
        return invitation ? (
          <FormState
            title={weddingTitle}
            subtitle={weddingSubtitle}
            invitation={invitation}
            form={form}
            submitting={submitting}
            onFinish={onFormSubmit}
          />
        ) : null;
      case 'success':
        return <SuccessState attendingCount={attendingCount} totalCount={totalCount} />;
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
      <DesktopSplitBackground images={images} fallbackImage={wedding?.background_image} />

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
