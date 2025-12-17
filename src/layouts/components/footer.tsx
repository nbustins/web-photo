import { Layout } from "antd";

type FooterProps = {
  author: string;
  year?: number;
};

export function Footer({ author, year = new Date().getFullYear() }: FooterProps) {
  return (
    <Layout.Footer style={{ textAlign: 'center', padding: '12px 24px' }}>
      © {year} {author} — All rights reserved.
    </Layout.Footer>
  );
}
