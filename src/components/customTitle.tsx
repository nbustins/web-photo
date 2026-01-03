import { Typography } from "antd";

const { Title } = Typography;

export function CustomTitle({ label, title }: { label: string; title: string }) {
  return (
    <div style={{ textAlign: "center", marginBottom: "0px" }}>
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
    </div>
  );
}
