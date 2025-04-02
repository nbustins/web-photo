import { ConfigProvider, Layout, Menu } from 'antd';
import { JSX, useState } from 'react';


const { Header, Content } = Layout;

const getHeaderStyle = () => ({
  display: 'flex',
  alignItems: 'center',
  background: '#fff',
  padding: '0 20px',
  boxShadow: '0 2px 8px #f0f1f2',
  width: '100%',
  height: 'auto'
});

const getImageLogoStyle = () => ({
  maxHeight: '120px', 
  width: 'auto', 
  margin: 10 
})

export default function App(): JSX.Element {
  const [selectedKey, setSelectedKey] = useState<string>('home');

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#7C7458', // Primary blue color
          colorLink: '#1890ff',    // Link color
          colorText: '#333',       // Text color
        },
      }}
    >
      <Layout style={{ minHeight: '100vh', minWidth :'100vw' }}>
        <Header style={getHeaderStyle()}>
          <img src="/Logo.png" alt="Logo" style={getImageLogoStyle()} />
          <Menu
            theme="light"
            mode="horizontal"
            selectedKeys={[selectedKey]}
            onClick={(e) => setSelectedKey(e.key)}
            style={{
              flex: 1,
              minWidth: 0,
              fontSize: '22px',      // Make text bigger
              color: '#333',         // Change text color
              fontFamily: 'Borel', // Change font family
            }}
          >
            <Menu.Item key="home">Inici</Menu.Item>
            <Menu.Item key="prices">Preus</Menu.Item>
            <Menu.Item key="store">Botiga</Menu.Item>
            <Menu.Item key="book">Reserves</Menu.Item>
          </Menu>
        </Header>
        <Content 
          style={{ 
            flex: 1, 
            width: '100%', 
            backgroundImage: 'url(photos/beb.png)', 
            backgroundSize: 'cover', 
            backgroundPosition: 'center', 
          }}
        />
      </Layout>
    </ConfigProvider>
  );
}
