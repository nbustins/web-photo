import { FC } from 'react';
import { WeddingPage } from '../../WeddingPage';
import { AnnaJoanCustomLayout } from './AnnaJoanCustom.layout';

export const AnnaJoanCustomWedding: FC = () => (
  <WeddingPage
    slug="anna-joan"
    renderCustom={(ctx) => <AnnaJoanCustomLayout {...ctx} />}
  />
);
