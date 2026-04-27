import { FC } from 'react';
import { WeddingPage } from '../../WeddingPage';
import { CarlaJoelCustomLayout } from './CarlaJoelCustom.layout';

export const CarlaJoelCustomWedding: FC = () => (
  <WeddingPage
    slug="carla-joel"
    renderCustom={(ctx) => <CarlaJoelCustomLayout {...ctx} />}
  />
);
