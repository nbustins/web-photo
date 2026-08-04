import { ImageRightsConsent } from '../../services/booking/booking.api';

export interface FormValues {
  name: string;
  email: string;
  phone: string;
  dni: string;
  address: string;
  participants: { name: string; age?: number }[];
  imageRights: ImageRightsConsent;
  notes?: string;
}

export const IMAGE_RIGHTS_OPTIONS: { label: string; value: ImageRightsConsent }[] = [
  { label: 'SI CEDEIXO ELS DRETS', value: 'GrantAll' },
  { label: 'NO CEDEIXO ELS DRETS', value: 'DenyAll' },
  { label: 'NO CEDEIXO ELS DRETS DELS MENORS PERO SI ELS MEUS', value: 'GrantMineDenyMinors' },
];
