import { Menu, MenuProps } from "antd";
import { Header } from "antd/es/layout/layout";
import { AppRoutes} from "../../model/routes.model";
import { useNavigate } from "react-router-dom";
import { FC, useState } from "react";
import { getPublicPath } from "../../utils/pathUtils";


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


// const parentKeyMap = generateParentKeyMap(items);

export const MainHeader : FC = () => {

    const navigate = useNavigate();
    const [selectedKey, setSelectedKey] = useState<string>(AppRoutes.home);

    const handleMenuClick = (e: { key: string }) => {
      setSelectedKey(e.key);
      navigate(e.key);
    };

    return (
        <Header style={getHeaderStyle()}>
        <img src={getPublicPath("/Logo.png")} alt="Logo" style={getImageLogoStyle()} onClick={() => navigate(AppRoutes.home)} />
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