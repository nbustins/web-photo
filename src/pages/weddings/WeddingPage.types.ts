import { ReactNode } from 'react';
import { FormInstance } from 'antd';
import type { Wedding, GuestWithWedding } from '../../model/wedding.types';

export type PageState = 'loading' | 'enter-code' | 'not-found' | 'closed' | 'form' | 'success';

export interface FormValues {
  attending: boolean;
  companions_count?: number;
  companions_names?: string[];
  notes?: string;
}

export interface WeddingPageContext {
  pageState: PageState;
  wedding: Wedding | null;
  guest: GuestWithWedding | null;
  manualCode: string;
  submitting: boolean;
  form: FormInstance;
  onCodeChange: (code: string) => void;
  onCodeSubmit: () => void;
  onFormSubmit: (values: FormValues) => Promise<void>;
  onReset: () => void;
}

export interface WeddingPageProps {
  slug: string;
  renderCustom?: (context: WeddingPageContext) => ReactNode;
}
