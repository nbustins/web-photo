import { FC } from 'react';
import { Spin } from 'antd';
import type { WeddingGuestPageContext } from '../../WeddingGuestPage.types';
import { DesktopSplitBackground } from '@ui/DesktopSplitBackground';
import {
  GuestCodeEntry,
  GuestNotFoundState,
  GuestClosedState,
  GuestConfirmationForm,
  GuestSuccessState,
} from '../../components';
import styles from '../../WeddingGuest.module.css';

export const CarlaJoelGuestLayout: FC<WeddingGuestPageContext> = ({
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
          <div className={styles.customLoading}>
            <Spin size="large" />
          </div>
        );
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
        return <GuestSuccessState attendingCount={attendingCount} totalCount={totalCount} />;
      default:
        return null;
    }
  };

  return (
    <div className={styles.screen}>
      <DesktopSplitBackground images={images} fallbackImage={wedding?.background_image} />

      <div className={styles.panel}>
        {renderContent()}
      </div>
    </div>
  );
};
