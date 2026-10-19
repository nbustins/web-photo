import DOMPurify from 'dompurify';

/**
 * Allow-list shared by the guest renderer and the admin rich-text editor so
 * anything the editor can produce survives sanitization on the invitation.
 */
const ALLOWED_TAGS = [
  'p',
  'br',
  'strong',
  'em',
  'u',
  's',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'ul',
  'ol',
  'li',
  'a',
  'blockquote',
  'hr',
];
const ALLOWED_URI = /^(?:https?|mailto|tel):/i;

DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.tagName === 'A' && /^https?:/i.test(node.getAttribute('href') ?? '')) {
    node.setAttribute('target', '_blank');
    node.setAttribute('rel', 'noopener noreferrer');
  }
});

/** Sanitizes couple-configured guest content with the shared allow-list before rendering. */
export const sanitizeGuestHtml = (html: string): string =>
  DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR: ['href'],
    ALLOWED_URI_REGEXP: ALLOWED_URI,
  });

/** Collapses an HTML string into the single line the API stores for each content field. */
export const stripNewlines = (html: string): string => html.replace(/[\r\n]+/g, ' ').trim();

/** Sanitizes and normalizes a rich-HTML value into its persisted wire format. */
export const toWireHtml = (html: string): string => stripNewlines(sanitizeGuestHtml(html));

/**
 * True when the value has no visible content: an empty editor paragraph, tags only,
 * or whitespace/`&nbsp;`. A horizontal rule counts as content.
 */
export const isBlankRichHtml = (html: string): boolean => {
  if (!html.trim()) return true;
  if (/<hr\b/i.test(html)) return false;
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/gi, ' ').trim() === '';
};

/** Wire format of a content field: sanitized, single line, and blank values stored as `''`. */
export const toContentFieldValue = (html: string): string =>
  isBlankRichHtml(html) ? '' : toWireHtml(html);
