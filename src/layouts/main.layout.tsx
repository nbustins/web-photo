import { Layout } from 'antd';
import React from 'react';
import { Outlet } from 'react-router-dom';
import { MainHeader } from './components/main.header';
import { Content } from 'antd/es/layout/layout';
import { Footer } from './components/footer';

export const MainLayout: React.FC = () => {

    return (
          <Layout style={{ minHeight: '100vh', minWidth :'99vw', display: 'flex', flexDirection: 'column' }}>
            <MainHeader/>
            <Content 
              style={{ 
                flex: 1, 
                width: '100%', 
              }}
            >
                <Outlet /> 
            </Content>
            
            <Footer author="Laura Trias Fotografia" />
            
          </Layout>
)};