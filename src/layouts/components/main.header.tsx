import { Button, Drawer, Grid, Menu, MenuProps } from "antd";
import { Header } from "antd/es/layout/layout";
import { AppRoutes} from "../../model/routes.model";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { getPublicPath } from "../../utils/pathUtils";
import { MenuOutlined } from "@ant-design/icons";


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
  maxHeight: 50,
  width: 'auto',
  margin: '7px',
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
            {label : 'Familiar', key : AppRoutes.familiar},
            {label : 'Smash Cake', key : AppRoutes.smashCake}
          ,
        ]
    },
    {
      label: 'BOTIGA',
      key: 'BOTIGA',
      children: [
          {label : 'DNI', key : AppRoutes.store},
          {label : 'Materials', key : AppRoutes.materials},
      ]
    },
    {
      label: 'RESERVA',
      key : AppRoutes.bookSession
    }
]

export const MainHeader = () => {
    const { useBreakpoint } = Grid;
    const screens = useBreakpoint();
    const isMobile = !screens.md;

    const [drawerOpen, setDrawerOpen] = useState(false);
    const navigate = useNavigate();
    const [selectedKey, setSelectedKey] = useState<string>(AppRoutes.home);

    const handleMenuClick = (e: { key: string }) => {
      setSelectedKey(e.key);
      navigate(e.key);
      if (isMobile) setDrawerOpen(false);
    };


   return (
    <Header style={headerStyle}>
      <img
        src={getPublicPath("/Logo.png")}
        alt="Logo"
        style={logoStyle}
        onClick={() => navigate(AppRoutes.home)}
      />

      {isMobile ? (
        <>
          <Button
            type="text"
            icon={<MenuOutlined style={{ fontSize: 26 }} />}
            onClick={() => setDrawerOpen(true)}
            style={{ marginLeft: "auto" }}
          />

          <Drawer
            placement="right"
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            styles={{
              body: { padding: 0 },
            }}
          >
            <Menu
              theme="light"
              mode="inline"
              selectedKeys={[selectedKey]}
              onClick={handleMenuClick}
              items={items}
            />
          </Drawer>
          
        </>
      ) : (
        <Menu
          theme="light"
          mode="horizontal"
          selectedKeys={[selectedKey]}
          onClick={handleMenuClick}
          style={{
            flex: 1,
            minWidth: 0,
            fontSize: "18px",
            color: "#333",
          }}
          items={items}
        />
      )}
    </Header>
);

}