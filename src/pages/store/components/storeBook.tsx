import { Button, Typography } from "antd";
import { useNavigate } from "react-router";
import { AppRoutes } from "../../../model/routes.model";
import styles from "./storeBook.module.css";

const { Paragraph, Title } = Typography;

export interface StoreBookProps {
  title: string;
  text: string;
  buttonText: string;
}

export const StoreBook = (data: StoreBookProps) => {
  const navigate = useNavigate();

  return (
    <div className={styles.card}>
      {/* Detall decoratiu (paper) */}
      <div className={styles.paperEdge} />

      {/* Contingut */}
      <div className={styles.head}>
        <Title level={3} className={styles.title}>
          {data.title}
        </Title>

        {/* separador */}
        <div className={styles.separator} />
      </div>

      <Paragraph className={styles.text}>
        {data.text}
      </Paragraph>

      {/* Footer */}
      <div className={styles.footer}>
        <Button
          type="primary"
          className={styles.button}
          onClick={() => navigate(AppRoutes.bookStore)}
        >
          {data.buttonText}
        </Button>
      </div>
    </div>
  );
};
