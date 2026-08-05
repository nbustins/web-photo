import { Layout } from 'antd';
import React from 'react';
import { Outlet } from 'react-router-dom';
import { MainHeader } from './components/main.header';
import styles from './layout.module.css';
import { Footer } from './components/footer';

const { Content } = Layout;

export const MainLayout: React.FC = () => {

    return (
          <Layout className={styles.layout}>
            <MainHeader/>
            <Content className={styles.content}>
                <Outlet /> 
            </Content>
            
            <Footer author="Laura Trias Fotografia" />
            
          </Layout>
)};