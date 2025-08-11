import { FC, ReactNode } from "react";

export const AdviceText: FC<{ children: ReactNode }> = ({ children }) => (
  <span style={{ fontStyle: "italic", fontSize: "0.9rem", color: "#888" }}>
    {children}
  </span>
);