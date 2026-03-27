import { FC, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { message } from 'antd';
import { Form } from 'antd';
import { guestService } from '../../services/guestService';
import type { GuestWithWedding, ConfirmationPayload } from '../../model/wedding.types';
import {
  LoadingState,
  EnterCodeState,
  NotFoundState,
  ClosedState,
  FormState,
  SuccessState,
} from './components';
import './wedding-rsvp.css';

type PageState = 'loading' | 'enter-code' | 'not-found' | 'closed' | 'form' | 'success';

export const AnnaJoanWedding: FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [pageState, setPageState] = useState<PageState>('loading');
  const [guest, setGuest] = useState<GuestWithWedding | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const code = searchParams.get('code');

  useEffect(() => {
    if (code) {
      validateCode(code);
    } else {
      setPageState('enter-code');
    }
  }, [code]);

  const validateCode = async (inviteCode: string) => {
    setPageState('loading');
    const foundGuest = await guestService.getGuestBySlugAndCode('anna-joan', inviteCode);
    
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

  const renderContent = () => {
    switch (pageState) {
      case 'loading':
        return <LoadingState />;

      case 'enter-code':
        return (
          <EnterCodeState
            value={manualCode}
            onChange={setManualCode}
            onSubmit={handleCodeSubmit}
          />
        );

      case 'not-found':
        return <NotFoundState onReset={() => setSearchParams({})} />;

      case 'closed':
        return <ClosedState />;

      case 'form':
        return guest ? (
          <FormState
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
    <div className="wedding-page">
      <div className="wedding-background" />
      <div className="wedding-container">
        {renderContent()}
      </div>
    </div>
  );
};
