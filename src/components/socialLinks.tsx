import { InstagramOutlined, MailOutlined, WhatsAppOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';

export const CONTACT_EMAIL = 'lauratfotografia@gmail.com';
const INSTAGRAM_URL = 'https://www.instagram.com/lauratfotografia';

const links = [
  // Número només WhatsApp (no trucades): wa.me obre la conversa directament.
  { href: 'https://wa.me/34623002792', label: 'WhatsApp', icon: <WhatsAppOutlined />, external: true },
  { href: `mailto:${CONTACT_EMAIL}`, label: "Envia'm un correu", icon: <MailOutlined />, external: false },
  { href: INSTAGRAM_URL, label: 'Instagram', icon: <InstagramOutlined />, external: true },
];

export const SocialLinks = () => (
  <div style={{ display: 'inline-flex', gap: 'var(--lt-space-4)', fontSize: '1.4em' }}>
    {links.map(({ href, label, icon, external }) => (
      <Tooltip key={label} title={label}>
        <a
          href={href}
          aria-label={label}
          style={{ color: 'var(--lt-color-accent)' }}
          {...(external && { target: '_blank', rel: 'noopener noreferrer' })}
        >
          {icon}
        </a>
      </Tooltip>
    ))}
  </div>
);
