import { FC, ReactNode } from "react";
import styles from "./blocks.module.css";

export const AdviceText: FC<{ children: ReactNode }> = ({ children }) => (
  <span className={styles.advice}>{children}</span>
);

export default AdviceText;
