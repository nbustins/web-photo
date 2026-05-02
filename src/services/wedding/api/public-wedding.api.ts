import { apiGet, ApiError } from '../../api.client';
import type { Wedding } from '../../../model/wedding.types';

interface PublicWeddingDto {
  slug: string;
  title: string;
  eventDate: string | null;
}

function mapPublicWedding(dto: PublicWeddingDto): Wedding {
  return {
    id: dto.slug,
    slug: dto.slug,
    title: dto.title,
    event_date: dto.eventDate ?? '',
    closing_date: dto.eventDate ?? '',
  };
}

export async function fetchPublicWedding(slug: string): Promise<Wedding | null> {
  try {
    const dto = await apiGet<PublicWeddingDto>(`/api/public/weddings/${encodeURIComponent(slug)}`);
    return mapPublicWedding(dto);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

interface WeddingPhotoDto {
  url: string;
}

export async function fetchPublicWeddingPhotos(slug: string): Promise<string[]> {
  try {
    const photos = await apiGet<WeddingPhotoDto[]>(`/api/public/weddings/${encodeURIComponent(slug)}/photos`);
    return photos.map(photo => photo.url).filter(Boolean);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return [];
    throw err;
  }
}

interface WeddingSummaryDto {
  id: number;
  slug: string;
  title: string;
  eventDate: string | null;
}

export async function fetchAuthWeddingBySlug(slug: string): Promise<{ id: number; wedding: Wedding } | null> {
  try {
    const dto = await apiGet<WeddingSummaryDto>(`/api/weddings/by-slug/${encodeURIComponent(slug)}`);
    return {
      id: dto.id,
      wedding: {
        id: String(dto.id),
        slug: dto.slug,
        title: dto.title,
        event_date: dto.eventDate ?? '',
        closing_date: dto.eventDate ?? '',
      },
    };
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}
