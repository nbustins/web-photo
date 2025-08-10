import { Layout } from 'antd';
import React from 'react';
import { Outlet } from 'react-router-dom';
import { MainHeader } from './components/main.header';
import { Content } from 'antd/es/layout/layout';

export const MainLayout: React.FC = () => {

    return (
          <Layout style={{ minHeight: '100vh', minWidth :'99vw' }}>
            <MainHeader/>
            <Content 
              style={{ 
                flex: 1, 
                width: '100%', 
              }}
            >
                <Outlet /> 
            </Content>
          </Layout>
)};