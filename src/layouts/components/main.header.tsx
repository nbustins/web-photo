import { Menu, MenuProps } from "antd";
import { Header } from "antd/es/layout/layout";
import { AppRoutes} from "../../model/routes.model";
import { useNavigate } from "react-router-dom";
import { FC, useState } from "react";
import { getPublicPath } from "../../utils/pathUtils";


const headerStyle : React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  background: '#fff',
  padding: '0 20px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
  width: '100%',
  position: 'sticky',
  top: 0,
  zIndex: 1000,
  height: 64,
};

const logoStyle: React.CSSProperties = {
  height: '100%',
  maxHeight: 55,
  width: 'auto',
  margin: '0 10px',
  objectFit: 'contain',
};

type MenuItem = Required<MenuProps>['items'][number];

const items : MenuItem[] = [
    {
        label: 'SESSIONS',
        key: 'SESSIONS',
        children: [
            {label : 'Embaras', key : AppRoutes.pregnant},
            {label : 'Recent Nascut', key : AppRoutes.newBorn},
            {label : 'Familiar', key : AppRoutes.familiar}
          ,
        ]
    },
    {
      label: 'BOTIGA',
      key: 'BOTIGA',
      children: [
          {label : 'DNI', key : AppRoutes.dni},
          {label : 'Materials', key : AppRoutes.materials}
      ]
  }
]


export const MainHeader : FC = () => {

    const navigate = useNavigate();
    const [selectedKey, setSelectedKey] = useState<string>(AppRoutes.home);

    const handleMenuClick = (e: { key: string }) => {
      setSelectedKey(e.key);
      navigate(e.key);
    };

    return (
        <Header style={headerStyle}>
        <img src={getPublicPath("/Logo.png")} alt="Logo" style={logoStyle} onClick={() => navigate(AppRoutes.home)} />
        <Menu
          theme="light"
          mode="horizontal"
          selectedKeys={[selectedKey]}
          onClick={handleMenuClick}
          style={{
            flex: 1,
            minWidth: 0,
            fontSize: '25px',      // Make text bigger
            color: '#333',         // Change text color
          }}
          items = {items}
        />
       
      </Header>
    )
}