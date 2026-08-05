import { Layout } from "antd";
import styles from "../layout.module.css";

type FooterProps = {
  author: string;
  year?: number;
};

export function Footer({ author, year = new Date().getFullYear() }: FooterProps) {
  return (
    <Layout.Footer className={styles.footer}>
      © {year} {author} — All rights reserved.
    </Layout.Footer>
  );
}
