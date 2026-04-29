import { FC } from 'react';
import { radii } from '../../../styles/tokens/radii';

export const COLOR_BG = '#f5f0ea';
export const COLOR_HEADER = '#5C5440';
export const COLOR_TEXT_DARK = '#3d3228';
export const COLOR_OLIVE = '#7C7458';
export const COLOR_GREEN = '#5e8a4e';
export const COLOR_RUST = '#b06a3a';
export const COLOR_MUTED = '#9a9080';

export const FONT_TITLE = "'Italiana', Georgia, serif";
export const FONT_BODY = "'Raleway', sans-serif";

export const StatusPill: FC<{ attending: boolean | null }> = ({ attending }) => {
  const base: React.CSSProperties = {
    display: 'inline-block',
    fontFamily: FONT_BODY,
    fontSize: 13,
    fontWeight: 500,
    padding: '4px 14px',
    borderRadius: 999,
    border: '1px solid',
    whiteSpace: 'nowrap',
  };
  if (attending === true) {
    return <span style={{ ...base, color: COLOR_GREEN, borderColor: 'rgba(94,138,78,0.45)', background: 'rgba(94,138,78,0.08)' }}>Confirmat</span>;
  }
  if (attending === false) {
    return <span style={{ ...base, color: COLOR_RUST, borderColor: 'rgba(176,106,58,0.45)', background: 'rgba(176,106,58,0.08)' }}>Rebutjat</span>;
  }
  return <span style={{ ...base, color: COLOR_OLIVE, borderColor: 'rgba(124,116,88,0.45)', background: 'rgba(124,116,88,0.08)' }}>Pendent</span>;
};

export const LabelTag: FC<{ children: React.ReactNode; onClick?: () => void }> = ({ children, onClick }) => (
  <span
    onClick={onClick}
    style={{
      display: 'inline-block',
      fontFamily: FONT_BODY,
      fontSize: 13,
      color: COLOR_OLIVE,
      border: '1px solid rgba(124,116,88,0.35)',
      borderRadius: radii.md,
      padding: '3px 10px',
      background: 'rgba(124,116,88,0.04)',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'background 0.15s',
    }}
  >
    {children}
  </span>
);

export const StatCell: FC<{ value: number; label: string; color?: string }> = ({ value, label, color = COLOR_TEXT_DARK }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
    <span style={{ fontFamily: FONT_TITLE, fontSize: 30, fontWeight: 500, color, lineHeight: 1 }}>
      {value}
    </span>
    <span style={{
      fontFamily: FONT_BODY,
      fontSize: 11,
      fontWeight: 500,
      color: COLOR_MUTED,
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
    }}>
      {label}
    </span>
  </div>
);
