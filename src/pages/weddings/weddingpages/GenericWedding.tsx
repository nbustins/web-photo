import { FC } from 'react';
import { useParams } from 'react-router-dom';
import { WeddingPage } from '../WeddingPage';

export const GenericWedding: FC = () => {
  const { slug } = useParams<{ slug: string }>();
  if (!slug) return null;
  return <WeddingPage slug={slug} />;
};
