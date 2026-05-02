import { FC } from 'react';
import { useParams } from 'react-router-dom';
import { WeddingGuestPage } from '../WeddingGuestPage';

export const GenericWedding: FC = () => {
  const { slug } = useParams<{ slug: string }>();
  if (!slug) return null;
  return <WeddingGuestPage slug={slug} />;
};
