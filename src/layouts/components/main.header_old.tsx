import { Menu } from "antd";
import { Header } from "antd/es/layout/layout";
import { AppRoutes, appRoutesTitle } from "../../model/routes.model";
import { useNavigate } from "react-router-dom";
import { FC, useState } from "react";


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

export const MainHeaderOld : FC = () => {

    const navigate = useNavigate();
    const [selectedKey, setSelectedKey] = useState<string>('/');

    const handleMenuClick = (route: AppRoutes) => {
     navigate(route);
    };

    return (
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
        {Object.keys(AppRoutes).map((key) => {
          const route = AppRoutes[key as keyof typeof AppRoutes];  // Get the route from the enum
          const title = appRoutesTitle[route];  // Get the title from AppRoutesTitle enum

          return (
            <Menu.Item key={route} onClick={() => handleMenuClick(route)}>
              {title}
            </Menu.Item>
          );
        })}
      </Menu>
      </Header>
    )
}