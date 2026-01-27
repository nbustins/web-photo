import { Typography } from "antd";
import { motion } from "framer-motion";

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
    <div style={{ textAlign: "center", marginBottom: "0px" }}>
      {/* Label apareix directament */}
      <div
        style={{
          fontSize: "clamp(1.6rem, 3vw, 3rem)",
          letterSpacing: "0.2rem",
          marginBottom: "clamp(-0.4rem, -3vw, -1rem)",
          fontFamily: "Italiana",
        }}
      >
        {label}
      </div>

      {/* Title amb fade in */}
      <motion.div
        variants={titleFade}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <Title
          level={1}
          style={{
            fontSize: "clamp(3rem,6vw,6rem)",
            fontWeight: 700,
            lineHeight: "1.1",
            margin: 0,
            fontFamily: "Italiana",
            letterSpacing: "0.3rem",
          }}
        >
          {title}
        </Title>
      </motion.div>
    </div>
  );
}
