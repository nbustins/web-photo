import { apiGet } from '../../api.client';

export interface AdminWedding {
  id: number;
  slug: string;
  title: string;
  eventDate: string | null;
  closingDate: string | null;
  createdAt: string;
  guestCount: number;
}

export function fetchAdminWeddings(): Promise<AdminWedding[]> {
  return apiGet<AdminWedding[]>('/api/weddings');
}
