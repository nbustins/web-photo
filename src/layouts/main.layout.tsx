import { Layout } from 'antd';
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { MainHeader } from './components/main.header';
import styles from './layout.module.css';
import { Footer } from './components/footer';
import { AppRoutes } from '../model/routes.model';

const { Content } = Layout;

export const MainLayout: React.FC = () => {
    const { pathname } = useLocation();

    // Només la home té el header fix i el contingut a pantalla completa.
    const isHome = pathname === AppRoutes.home;

    return (
          <Layout className={styles.layout}>
            <MainHeader/>
            <Content className={isHome ? styles.contentHome : styles.content}>
                <Outlet />
            </Content>

            <Footer author="Laura Trias Fotografia" />

          </Layout>
)};
