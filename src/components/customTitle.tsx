import { Typography } from "antd";
import { motion } from "framer-motion";
import styles from "./blocks.module.css";

const { Title } = Typography;

const titleFade = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut",
      delay: 0.15,
    },
  },
};

export function CustomTitle({ label, title }: { label: string; title: string }) {
  return (
    <div className={styles.titleBlock}>
      {/* Label apareix directament */}
      <div className={styles.titleLabel}>{label}</div>

      {/* Title amb fade in */}
      <motion.div
        variants={titleFade}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <Title level={1} className={styles.titleMain}>
          {title}
        </Title>
      </motion.div>
    </div>
  );
}
