import { FC } from "react";
import { Button } from "antd";
import { Link } from "react-router-dom";
import { SessionStrip } from "@components";
import { AppRoutes } from "../model/routes.model";
import { getPublicPath } from "../utils/pathUtils";
import styles from "./home.module.css";

// TODO: main.jpg és apaïsada (1200x800) i a mòbil es retalla molt.
// Quan hi hagi una foto vertical, servir-la per sota de 768px.
const HERO_IMAGE = "main/main.jpg";

export const HomePage: FC = () => (
  <section
    className={styles.hero}
    style={{ backgroundImage: `url(${getPublicPath(HERO_IMAGE)})` }}
  >
    <div className={styles.scrim} />

    <div className={styles.content}>
      <div className={styles.copy}>
        <h1 className={styles.title}>Fotografio els dies que no tornen</h1>
        <p className={styles.subtitle}>
          Embaràs, nadons i família — a l'estudi, a casa teva o a l'exterior
        </p>
        <Link to={AppRoutes.bookSession}>
          <Button type="primary" size="large">
            Reserva una sessió
          </Button>
        </Link>
      </div>

      <div className={styles.sessions}>
        <span className={styles.sessionsLabel}>Les sessions</span>
        <SessionStrip />
      </div>
    </div>
  </section>
);
