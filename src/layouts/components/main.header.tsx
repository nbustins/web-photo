import { Button, Drawer, Grid, Menu, MenuProps } from "antd";
import { Header } from "antd/es/layout/layout";
import { AppRoutes } from "../../model/routes.model";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getPublicPath } from "../../utils/pathUtils";
import { MenuOutlined } from "@ant-design/icons";

const headerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  background: "#fff",
  padding: "0 20px",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
  width: "100%",
  position: "sticky",
  top: 0,
  zIndex: 1000,
  height: 80,
};

const sideMenuStyle: React.CSSProperties = {
  borderBottom: "none",
  fontSize: "18px",
  color: "#333",
  background: "transparent",
  minWidth: '400px',
  flexDirection: 'row-reverse'
};

const logoStyle: React.CSSProperties = {
  maxHeight: 64,
  width: "auto",
  objectFit: "contain",
  cursor: "pointer",
  display: "block",
};

type MenuItem = Required<MenuProps>["items"][number];

const items: MenuItem[] = [
  {
    label: "SESSIONS",
    key: "SESSIONS",
    children: [
      { label: "Embaràs", key: AppRoutes.pregnant },
      { label: "Recent Nascut", key: AppRoutes.newBorn },
      { label: "Familiar", key: AppRoutes.familiar },
      { label: "Smash Cake", key: AppRoutes.smashCake },
    ],
  },
  {
    label: "BOTIGA",
    key: "BOTIGA",
    children: [
      { label: "Informació", key: AppRoutes.store },
      { label: "Sol·licitud", key: AppRoutes.bookStore },
    ],
  },
  {
    label: "RESERVA",
    key: AppRoutes.bookSession,
  },
  {
    label:"SOBRE MI",
    key: AppRoutes.aboutMe
  }
];

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

  const leftItems: MenuItem[] = items.slice(0, 2);
  const rightItems: MenuItem[] = items.slice(2, 4);

  // Forçar recarrega de menu al carregar el logo
  const [menuKeyRight, setMenuKeyRight] = useState(0);
  const [menuKeyLeft, setMenuKeyLeft] = useState(0);

  const forceMenuRecalc = () => {
    setMenuKeyRight((k) => k + 1);
    setMenuKeyLeft((k) => k + 2);
  }
  // Fallback recalcul de menu (proteccio per si de cas)
  useEffect(() => forceMenuRecalc(), []);

  return (
    <Header style={headerStyle}>
      {isMobile ? (
        <>
          {/* Mobile: logo esquerra + burger dreta (igual que abans) */}
          <img
            src={getPublicPath("Logo.png")}
            alt="Logo"
            style={logoStyle}
            onClick={() => navigate(AppRoutes.home)}
          />

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
            styles={{ body: { padding: 0 } }}
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
        // Desktop: 2 botons esquerra, logo centrat, 2 botons dreta
        <div
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 18, // separació entre logo i menus (ajusta al gust)
            height: "100%",
          }}
        >
          <Menu
            key={menuKeyLeft}
            theme="light"
            mode="horizontal"
            selectedKeys={[selectedKey]}
            onClick={handleMenuClick}
            style={{
              ...sideMenuStyle,
              flexDirection: 'row-reverse'

            }}
            items={[...leftItems].reverse()}
          />

          <img
            src={getPublicPath("Logo.png")}
            alt="Logo"
            style={logoStyle}
            onClick={() => navigate(AppRoutes.home)}
            onLoad={forceMenuRecalc}
          />

          <Menu
            key={menuKeyRight}
            theme="light"
            mode="horizontal"
            selectedKeys={[selectedKey]}
            onClick={handleMenuClick}
            style={{
              ...sideMenuStyle,
              flexDirection: 'row'

            }}
            items={rightItems}
          />
        </div>
      )}
    </Header>
  );
};
