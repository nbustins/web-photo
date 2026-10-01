import { ReactNode } from 'react';
import { FormInstance } from 'antd';
import type { Wedding, Invitation, SongRequest } from '../../../model/wedding.types';

export type PageState = 'loading' | 'enter-code' | 'not-found' | 'closed' | 'form' | 'success';

export interface GuestFormValue {
  id: number;
  name: string;
  attending: boolean;
  /** Only meaningful while the transport section is shown; unanswered reads as "No". */
  usesTransportToHotel?: boolean;
  allergens?: string[];
}

export interface InvitationFormValues {
  notes?: string;
  guests: GuestFormValue[];
  songRequests?: SongRequest[];
}

export interface WeddingGuestPageContext {
  pageState: PageState;
  wedding: Wedding | null;
  images: string[];
  invitation: Invitation | null;
  manualCode: string;
  submitting: boolean;
  submitError: string | null;
  form: FormInstance<InvitationFormValues>;
  onCodeChange: (code: string) => void;
  onCodeSubmit: () => void;
  onFormSubmit: (values: InvitationFormValues) => Promise<void>;
  onReset: () => void;
}

export interface WeddingGuestPageProps {
  slug: string;
  images?: string[];
  renderCustom?: (context: WeddingGuestPageContext) => ReactNode;
}
