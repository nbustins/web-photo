import { Layout } from "antd";
import { Link } from "react-router-dom";
import { SocialLinks } from "@components";
import { AppRoutes } from "../../model/routes.model";
import styles from "../layout.module.css";

type FooterProps = {
  author: string;
  year?: number;
};

export function Footer({ author, year = new Date().getFullYear() }: FooterProps) {
  return (
    <Layout.Footer className={styles.footer}>
      <span>
        © {year} {author}<span className={styles.footerRights}> — Tots els drets reservats</span>
      </span>
      <span>
        <Link to={AppRoutes.avisLegal} className={styles.footerLink}>Avís legal</Link>
        {' · '}
        <Link to={AppRoutes.privacitat} className={styles.footerLink}>Privacitat</Link>
      </span>
      <span className={styles.footerSocial}><SocialLinks /></span>
    </Layout.Footer>
  );
}
