import { FC } from 'react';
import { Button, Result } from 'antd';
import { Link } from 'react-router-dom';
import { AppRoutes } from '../model/routes.model';

export const NotFoundPage: FC = () => (
  <Result
    status="404"
    title="Pàgina no trobada"
    subTitle="La pàgina que busques no existeix o s'ha mogut."
    extra={<Link to={AppRoutes.home}>
            <Button type="primary">Tornar a l'inici</Button>
          </Link>}
  />
);
