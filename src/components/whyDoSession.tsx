import { Col, Row } from "antd";
import { ReactNode } from "react";
import { getPublicPath } from "../utils/pathUtils";
import styles from "./blocks.module.css";

interface PregnancyWhySectionProps {
  textWhyDoThisSession: ReactNode;
}

export function WhyDoSession({
  textWhyDoThisSession,
}: PregnancyWhySectionProps) {
  return (
    <div className={styles.whySection}>

      {/* Text */}
      <Row gutter={[48, 48]} justify="center" align="middle" className={styles.whyRow}>
        <Col xs={24} md={12}>
          <span className={styles.whyHeading}>
            Per què recomano fer
            <br />
            la sessió d’embaràs?
          </span>
        </Col>

        <Col xs={24} md={12}>
          <div className={styles.whyText}>
            {textWhyDoThisSession}
          </div>
        </Col>
      </Row>

      {/* Imatge */}
      <Row justify="center">
        <Col xs={24}>
          <div className={styles.whyImageWrap}>
            <img
              src={getPublicPath("pregnancy/4.jpg")}
              alt="Imatge de la mare embarassada"
              className={styles.whyImage}
            />
          </div>
        </Col>
      </Row>
    </div>
  );
}
