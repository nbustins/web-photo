import { Button, Drawer, Grid, Layout, Menu, MenuProps } from "antd";
import { AppRoutes } from "../../model/routes.model";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { getPublicPath } from "../../utils/pathUtils";
import { MenuOutlined } from "@ant-design/icons";
import { SESSIONS } from "../../model/sessions";
import styles from "../layout.module.css";

const { Header } = Layout;

type MenuItem = Required<MenuProps>["items"][number];

const items: MenuItem[] = [
  // TODO: enable when final photos are ready
  {
    label: "NADAL",
    key: AppRoutes.christmas,
  },
  {
    label: "SESSIONS",
    key: "SESSIONS",
    children: SESSIONS.filter((session) => session.inMenu).map((session) => ({
      label: session.label,
      key: session.key,
    })),
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
  },
  {
    label:"TALLER",
    key: AppRoutes.workshop
  }
];

export const MainHeader = () => {
  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // Derivat de la URL: abans era estat local i quedava obsolet amb enllaços
  // directes o amb el botó enrere.
  const selectedKey = pathname;

  // A la home la foto ocupa tota la finestra, header inclòs.
  const transparent = pathname === AppRoutes.home;

  const handleMenuClick = (e: { key: string }) => {
    navigate(e.key);
    if (isMobile) setDrawerOpen(false);
  };

  // El logo va entre els dos menús: repartiment 3/3 perquè quedi centrat de debò.
  const leftItems: MenuItem[] = items.slice(0, 3);
  const rightItems: MenuItem[] = items.slice(3);

  return (
    <Header className={transparent ? styles.headerTransparent : styles.header}>
      {isMobile ? (
        <>
          {/* Mobile: logo esquerra + burger dreta (igual que abans) */}
          <img
            src={getPublicPath("Logo.png")}
            alt="Logo"
            className={transparent ? styles.logoOnPhoto : styles.logo}
            onClick={() => navigate(AppRoutes.home)}
          />

          <Button
            type="text"
            icon={<MenuOutlined className={styles.burgerIcon} />}
            onClick={() => setDrawerOpen(true)}
            className={styles.burger}
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
        <div className={styles.desktopBar}>
          <Menu
            theme="light"
            mode="horizontal"
            selectedKeys={[selectedKey]}
            onClick={handleMenuClick}
            className={styles.sideMenuLeft}
            items={[...leftItems].reverse()}
          />

          <img
            src={getPublicPath("Logo.png")}
            alt="Logo"
            className={transparent ? styles.logoOnPhoto : styles.logo}
            onClick={() => navigate(AppRoutes.home)}
          />

          <Menu
            theme="light"
            mode="horizontal"
            selectedKeys={[selectedKey]}
            onClick={handleMenuClick}
            className={styles.sideMenuRight}
            items={rightItems}
          />
        </div>
      )}
    </Header>
  );
};
