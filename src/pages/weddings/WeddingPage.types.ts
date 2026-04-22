import { ReactNode } from 'react';
import { FormInstance } from 'antd';
import type { Wedding, Invitation } from '../../model/wedding.types';

export type PageState = 'loading' | 'enter-code' | 'not-found' | 'closed' | 'form' | 'success';

export interface GuestFormValue {
  id: number;
  name: string;
  attending: boolean;
}

export interface InvitationFormValues {
  notes?: string;
  guests: GuestFormValue[];
}

export interface WeddingPageContext {
  pageState: PageState;
  wedding: Wedding | null;
  invitation: Invitation | null;
  manualCode: string;
  submitting: boolean;
  form: FormInstance<InvitationFormValues>;
  onCodeChange: (code: string) => void;
  onCodeSubmit: () => void;
  onFormSubmit: (values: InvitationFormValues) => Promise<void>;
  onReset: () => void;
}

export interface WeddingPageProps {
  slug: string;
  renderCustom?: (context: WeddingPageContext) => ReactNode;
}
