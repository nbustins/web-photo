import { Typography } from "antd";

const { Title } = Typography;

export function CustomTitle({ label, title }: { label: string; title: string }) {
  return (
    <div style={{ textAlign: "center", marginBottom: "0px" }}>
      <div
        style={{
          fontSize: "3rem",
          letterSpacing: "0.2rem",
          marginBottom: "-1rem",
          fontFamily: "Italiana",
        }}
      >
        {label}
      </div>

      <Title
        level={1}
        style={{
          fontSize: "6rem",
          fontWeight: 700,
          lineHeight: "1.1",
          margin: 0,
          fontFamily: "Italiana",
          letterSpacing: "0.3rem",
        }}
      >
        {title}
      </Title>
    </div>
  );
}
