import { FC } from 'react';
import { WeddingGuestPage } from '../../WeddingGuestPage';
import { CarlaJoelGuestLayout } from './CarlaJoelGuestLayout';

export const CarlaJoelCustomWedding: FC = () => (
  <WeddingGuestPage
    slug="carla-joel"
    renderCustom={(ctx) => <CarlaJoelGuestLayout {...ctx} />}
  />
);
