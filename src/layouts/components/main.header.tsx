import { Button, Drawer, Grid, Menu, MenuProps } from "antd";
import { Header } from "antd/es/layout/layout";
import { AppRoutes } from "../../model/routes.model";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
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
};

const logoStyle :  React.CSSProperties = {
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
      { label: "Embaras", key: AppRoutes.pregnant },
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

  const leftItems: MenuItem[] = [
    items[0], // SESSIONS
    items[1], // BOTIGA
  ];

  const rightItems: MenuItem[] = [
    items[2],
    { label: "INICI", key: AppRoutes.home },
  ];

  // Forçar recarrega de menu al carregar el logo
  const [menuKey, setMenuKey] = useState(0);
  const forceMenuRecalc = () => setMenuKey(k => k + 1);


  return (
    <Header style={headerStyle}>
      {isMobile ? (
        <>
          {/* Mobile: logo esquerra + burger dreta (igual que abans) */}
          <img
            src={getPublicPath("/Logo.png")}
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
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            alignItems: "center",
            width: "100%",
            height: "100%",
          }}
        >
          {/* LEFT */}
          <div
            style={{
              justifySelf: "start",
              display: "flex",
              alignItems: "center",
              height: "100%",
            }}
          >
            <Menu
              key= {menuKey}
              theme="light"
              mode="horizontal"
              selectedKeys={[selectedKey]}
              onClick={handleMenuClick}
              style={sideMenuStyle}
              items={leftItems}
            />
          </div>

          {/* CENTER LOGO */}
          <div
            style={{
              justifySelf: "center",
              display: "flex",
              alignItems: "center",
              height: "100%",
            }}
          >
            <img
              src={getPublicPath("/Logo.png")}
              alt="Logo"
              style={logoStyle}
              onClick={() => navigate(AppRoutes.home)}
              onLoad={forceMenuRecalc}
            />
          </div>

          {/* RIGHT */}
          <div
            style={{
              justifySelf: "end",
              display: "flex",
              alignItems: "center",
              height: "100%",
            }}
          >
            <Menu
              theme="light"
              mode="horizontal"
              selectedKeys={[selectedKey]}
              onClick={handleMenuClick}
              style={sideMenuStyle}
              items={rightItems}
            />
          </div>
        </div>
      )}
    </Header>
  );
};
