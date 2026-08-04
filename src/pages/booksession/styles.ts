import { pageBodyPadding } from '../../styles/tokens/radii';

export const labelStyle: React.CSSProperties = {
  fontFamily: "'Raleway', sans-serif",
  fontSize: 'clamp(0.85rem, 1.3vw, 0.9rem)',
  fontWeight: 500,
  color: '#5a5a5a',
  letterSpacing: '0.02em',
};

export const inputStyle: React.CSSProperties = {
  fontFamily: "'Raleway', sans-serif",
  borderRadius: 8,
};

export const bodyTextStyle: React.CSSProperties = {
  fontFamily: "'Raleway', sans-serif",
  fontSize: 'clamp(0.9rem, 1.4vw, 1rem)',
  color: '#6a6a6a',
  lineHeight: 1.7,
};

// No minHeight: MainLayout's Content already has flex:1 inside a 100vh column, and a
// hardcoded calc() here ignored the footer, forcing a scrollbar on every page using it.
export const pageStyle: React.CSSProperties = {
  padding: pageBodyPadding,
  maxWidth: 820,
  margin: '0 auto',
};
