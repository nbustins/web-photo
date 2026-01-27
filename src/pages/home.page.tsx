import { FC, useEffect, useState } from "react";
import "../index.css";
import { getPublicPath } from "../utils/pathUtils";
import { motion } from "framer-motion";

export const HomePage: FC = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 600px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const bgImage = isMobile
    ? `url(${getPublicPath("main/main.jpg")})`
    : `url(${getPublicPath("main/main.jpg")})`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 1.03 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, ease: "easeOut" }}
      style={{
        minHeight: "calc(100vh - 140px)",
        overflow: "hidden",
        backgroundImage: bgImage,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        margin: 0,
        padding: 0,
        boxSizing: "border-box",
      }}
    />
  );
};
