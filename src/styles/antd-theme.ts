import type { ThemeConfig } from 'antd';
import { breakpoint, semantic, font } from './tokens';

/**
 * ThemeConfig d'antd amb cssVar:true — antd genera les seves pròpies --ant-*
 * a partir d'aquests valors reals. NO passar var(--lt-*) aquí: l'algorisme
 * de color d'antd (hover/active/disabled) necessita un color parsejable,
 * no una referència CSS — amb var() com a valor, els càlculs de color fallen
 * i es trenquen botons i textos.
 *
 * Només es fixen els tokens que ja existien al ConfigProvider original
 * (colorPrimary, colorText, fontFamily) + els breakpoints (mateixos valors
 * que per defecte a antd, cap canvi visual). colorTextSecondary/colorBgLayout/
 * colorBorder/colorError/colorSuccess/borderRadius es van provar i van tenyir
 * de marró coses que abans eren blanques/grises (fons de pàgina, vores) —
 * calen colors nous pensats expressament abans de fixar-los globalment,
 * no reutilitzar-hi semantics pensats per a altres contextos (F4, no aquí).
 */
export const antdTheme: ThemeConfig = {
  cssVar: true,
  hashed: false,
  token: {
    colorPrimary: semantic.colorBrand,
    colorText: '#333333',
    fontFamily: font.body,
    screenXS: breakpoint.xs,
    screenSM: breakpoint.sm,
    screenMD: breakpoint.md,
    screenLG: breakpoint.lg,
    screenXL: breakpoint.xl,
    screenXXL: breakpoint.xxl,
  },
  components: {
    Button: {
      paddingInline: 22,
      controlHeight: 40,
      borderRadius: 999,
      fontSize: 15,
      fontWeight: 600,
      primaryShadow: '0 10px 22px rgba(0,0,0,0.12)',
      // antd aplica els tokens de botó per mida: `size="large"` llegeix
      // borderRadiusLG/contentFontSizeLG/paddingInlineLG i `size="small"`
      // llegeix borderRadiusSM — no els de dalt. Sense aquests, els botons
      // large sortien amb radi 8px (quadrats) al costat dels default pill.
      borderRadiusLG: 999,
      borderRadiusSM: 999,
      contentFontSizeLG: 15,
      paddingInlineLG: 22,
    },
  },
};
