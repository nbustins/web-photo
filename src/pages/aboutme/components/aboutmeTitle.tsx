import { Typography } from "antd";
import styles from "./aboutmeTitle.module.css";

const { Title } = Typography;

export function AboutMeTitle({ label, title }: { label: string; title: string }) {
  return (
    <div className={styles.block}>
      <div className={styles.label}>{label}</div>

      <Title level={1} className={styles.title}>
        {title}
      </Title>
    </div>
  );
}
