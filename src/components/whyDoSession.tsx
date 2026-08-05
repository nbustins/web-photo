import { Col, Row } from "antd";
import { ReactNode } from "react";
import styles from "./blocks.module.css";

interface WhyDoSessionProps {
  /** ReactNode i no string: el titular sol portar un <br /> triat a mà. */
  heading: ReactNode;
  textWhyDoThisSession: ReactNode;
  /** Ruta ja resolta amb getPublicPath. */
  image: string;
  imageAlt: string;
}

export function WhyDoSession({
  heading,
  textWhyDoThisSession,
  image,
  imageAlt,
}: WhyDoSessionProps) {
  return (
    <div className={styles.whySection}>

      {/* Text */}
      <Row gutter={[48, 48]} justify="center" align="middle" className={styles.whyRow}>
        <Col xs={24} md={12}>
          <span className={styles.whyHeading}>{heading}</span>
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
              src={image}
              alt={imageAlt}
              className={styles.whyImage}
            />
          </div>
        </Col>
      </Row>
    </div>
  );
}
