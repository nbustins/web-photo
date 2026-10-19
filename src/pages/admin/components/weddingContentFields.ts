import { toContentFieldValue } from '@utils/richHtml.utils';
import type { WeddingContent, WeddingFeatures } from '../../../model/wedding.types';

export interface WeddingContentFieldSpec {
  name: keyof WeddingContent;
  label: string;
  /** Wire limit of `WeddingFeaturesContentDto`. */
  maxLength: number;
}

/** Editable content fields in guest-display order, with their API limits. */
export const WEDDING_CONTENT_FIELDS: WeddingContentFieldSpec[] = [
  { name: 'introductionText', label: 'Benvinguda', maxLength: 2_000 },
  { name: 'weddingPlace', label: 'Lloc de la celebració', maxLength: 500 },
  { name: 'schedule', label: 'Horari', maxLength: 10_000 },
  { name: 'hotelInfo', label: 'Allotjament', maxLength: 10_000 },
  { name: 'transportToHotelPhrase', label: "Transport a l'hotel", maxLength: 1_000 },
  { name: 'songRequestsPhrase', label: 'Cançons per a la festa', maxLength: 1_000 },
  { name: 'donations', label: 'Regals', maxLength: 2_000 },
  { name: 'contact', label: 'Contacte', maxLength: 2_000 },
];

export const EMPTY_FEATURES: WeddingFeatures = {
  transportToHotel: false,
  songRequests: false,
  allergens: false,
};

/** Fills the form with the stored values, defaulting missing/null content to an empty editor. */
export const toContentFormValues = (content?: WeddingContent | null): WeddingContent =>
  WEDDING_CONTENT_FIELDS.reduce<WeddingContent>(
    (values, field) => ({ ...values, [field.name]: content?.[field.name] ?? '' }),
    {},
  );

/**
 * Wire format of the whole content object. Applied on submit because untouched fields
 * keep the API's raw stored string in the form (the editor only normalizes what it edits).
 */
export const toWireContent = (content?: WeddingContent | null): WeddingContent =>
  WEDDING_CONTENT_FIELDS.reduce<WeddingContent>(
    (values, field) => ({ ...values, [field.name]: toContentFieldValue(content?.[field.name] ?? '') }),
    {},
  );

export const toFeaturesFormValues = (features?: WeddingFeatures | null): WeddingFeatures => ({
  transportToHotel: features?.transportToHotel ?? false,
  songRequests: features?.songRequests ?? false,
  allergens: features?.allergens ?? false,
});
