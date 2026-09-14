import { Layout } from 'antd';
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { MainHeader } from './components/main.header';
import styles from './layout.module.css';
import { Footer } from './components/footer';
import { ErrorBoundary } from '@components';
import { AppRoutes, appRoutesTitle } from '../model/routes.model';

const SITE_NAME = 'Laura Trias Fotografia';

const { Content } = Layout;

export const MainLayout: React.FC = () => {
    const { pathname } = useLocation();

    // Només la home té el header fix i el contingut a pantalla completa.
    const isHome = pathname === AppRoutes.home;
    const pageTitle = appRoutesTitle[pathname as AppRoutes];

    return (
          <Layout className={styles.layout}>
            <title>{pageTitle && !isHome ? `${pageTitle} · ${SITE_NAME}` : SITE_NAME}</title>
            <MainHeader/>
            <Content className={isHome ? styles.contentHome : styles.content}>
                {/* key: en navegar a una altra pàgina es reinicia l'error. */}
                <ErrorBoundary key={pathname}>
                    <Outlet />
                </ErrorBoundary>
            </Content>

            <Footer author={SITE_NAME} />

          </Layout>
)};
