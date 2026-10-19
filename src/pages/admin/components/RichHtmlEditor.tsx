import { FC, ReactNode, useEffect, useMemo, useRef } from 'react';
import { Button, Tooltip } from 'antd';
import { EditorContent, useEditor, useEditorState } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Icons } from '@ui/icons';
import { toContentFieldValue } from '@utils/richHtml.utils';
import styles from './RichHtmlEditor.module.css';

interface RichHtmlEditorProps {
  /** Controlled value owned by antd Form.Item. */
  value?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  /** Maximum length of the stored HTML; the counter turns red above it. */
  maxLength?: number;
  disabled?: boolean;
  'aria-label'?: string;
  /** Renders a read-only preview of the sanitized HTML. */
  previewLabel?: string;
}

interface ToolButtonProps {
  active?: boolean;
  disabled?: boolean;
  label: ReactNode;
  title: string;
  onClick: () => void;
}

const ToolButton: FC<ToolButtonProps> = ({ active, disabled, label, title, onClick }) => (
  <Tooltip title={title}>
    <Button
      size="small"
      type={active ? 'primary' : 'default'}
      disabled={disabled}
      aria-label={title}
      aria-pressed={active ?? false}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
    >
      {label}
    </Button>
  </Tooltip>
);

/**
 * Rich-text editor for the wedding content fields. Produces the same HTML the
 * guest page sanitizes and renders (`GuestRichHtmlSection`), so the couple can
 * author headings, marks, lists, quotes, code and links.
 *
 * Shaped as an antd custom form control: `value` / `onChange` come from Form.Item.
 */
export const RichHtmlEditor: FC<RichHtmlEditorProps> = ({
  value = '',
  onChange,
  maxLength,
  disabled,
  previewLabel,
  'aria-label': ariaLabel = 'Editor de text enriquit',
}) => {
  const onChangeRef = useRef(onChange);
  /** Last value this editor emitted, so the rehydration effect ignores our own updates. */
  const lastEmittedRef = useRef<string | null>(null);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Code formatting makes no sense in this invitation copy: drop it from the schema too,
        // so pasted pages cannot reintroduce it.
        code: false,
        codeBlock: false,
        link: {
          openOnClick: false,
          autolink: true,
          HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
        },
      }),
    ],
    content: value,
    editable: !disabled,
    editorProps: {
      attributes: { class: styles.content, 'aria-label': ariaLabel, role: 'textbox' },
    },
    onUpdate: ({ editor: current }) => {
      const next = toContentFieldValue(current.getHTML());
      lastEmittedRef.current = next;
      onChangeRef.current?.(next);
    },
  });

  // Re-hydrate when the form value changes from the outside (async drawer load, form.reset).
  useEffect(() => {
    if (!editor) return;
    if (value === lastEmittedRef.current) return;
    if (toContentFieldValue(editor.getHTML()) === value) return;
    lastEmittedRef.current = null;
    editor.commands.setContent(value, { emitUpdate: false });
  }, [editor, value]);

  useEffect(() => {
    editor?.setEditable(!disabled);
  }, [editor, disabled]);

  const state = useEditorState({
    editor,
    selector: ({ editor: current }) =>
      current
        ? {
            bold: current.isActive('bold'),
            italic: current.isActive('italic'),
            underline: current.isActive('underline'),
            strike: current.isActive('strike'),
            paragraph: current.isActive('paragraph'),
            blockquote: current.isActive('blockquote'),
            bulletList: current.isActive('bulletList'),
            orderedList: current.isActive('orderedList'),
            link: current.isActive('link'),
            heading:
              ([1, 2, 3, 4, 5, 6] as const).find((level) =>
                current.isActive('heading', { level }),
              ) ?? null,
            canUndo: current.can().undo(),
            canRedo: current.can().redo(),
          }
        : null,
  });

  // The persisted value: what the counter, the length rule and the guest preview all use.
  const wire = useMemo(() => toContentFieldValue(value), [value]);
  const overLimit = maxLength !== undefined && wire.length > maxLength;

  return (
    <div className={styles.editor}>
      <div className={styles.toolbar} role="toolbar" aria-label="Format de text">
        <ToolButton
          title="Desfer"
          disabled={!state?.canUndo}
          label="↺"
          onClick={() => editor?.chain().focus().undo().run()}
        />
        <ToolButton
          title="Refer"
          disabled={!state?.canRedo}
          label="↻"
          onClick={() => editor?.chain().focus().redo().run()}
        />
        <ToolButton
          title="Paràgraf"
          active={state?.paragraph}
          onClick={() => editor?.chain().focus().setParagraph().run()}
          label="¶"
        />
        {([1, 2, 3, 4, 5, 6] as const).map((level) => (
          <ToolButton
            key={level}
            title={`Títol ${level}`}
            active={state?.heading === level}
            onClick={() => editor?.chain().focus().toggleHeading({ level }).run()}
            label={`H${level}`}
          />
        ))}
        <ToolButton
          title="Negreta"
          active={state?.bold}
          onClick={() => editor?.chain().focus().toggleBold().run()}
          label="B"
        />
        <ToolButton
          title="Cursiva"
          active={state?.italic}
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          label="I"
        />
        <ToolButton
          title="Subratllat"
          active={state?.underline}
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
          label="U"
        />
        <ToolButton
          title="Tatxat"
          active={state?.strike}
          onClick={() => editor?.chain().focus().toggleStrike().run()}
          label="S"
        />
        <ToolButton
          title="Llista amb pics"
          active={state?.bulletList}
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          label="• Llista"
        />
        <ToolButton
          title="Llista numerada"
          active={state?.orderedList}
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          label="1. Llista"
        />
        <ToolButton
          title="Cita"
          active={state?.blockquote}
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
          label="Cita"
        />
        <ToolButton
          title="Línia separadora"
          onClick={() => editor?.chain().focus().setHorizontalRule().run()}
          label="—"
        />
        <ToolButton
          title={state?.link ? 'Edita l’enllaç' : 'Afegeix un enllaç'}
          active={state?.link}
          label={<Icons.link />}
          onClick={() => {
            if (!editor) return;
            const previous = (editor.getAttributes('link').href as string | undefined) ?? '';
            const url = window.prompt('Adreça de l’enllaç', previous || 'https://');
            if (url === null) return;
            if (url.trim() === '') {
              editor.chain().focus().extendMarkRange('link').unsetLink().run();
              return;
            }
            editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run();
          }}
        />
        <ToolButton
          title="Treu l’enllaç"
          disabled={!state?.link}
          label="Sense enllaç"
          onClick={() => editor?.chain().focus().extendMarkRange('link').unsetLink().run()}
        />
        <ToolButton
          title="Neteja el format"
          label="Neteja"
          onClick={() => editor?.chain().focus().unsetAllMarks().clearNodes().run()}
        />
      </div>

      <div className={disabled ? styles.surfaceDisabled : styles.surface}>
        <EditorContent editor={editor} />
      </div>

      {maxLength !== undefined && (
        <div className={overLimit ? styles.counterOver : styles.counter}>
          {wire.length.toLocaleString('ca-ES')} / {maxLength.toLocaleString('ca-ES')}
        </div>
      )}

      {previewLabel && wire.trim() !== '' && (
        <div className={styles.previewBlock}>
          <p className={styles.previewLabel}>{previewLabel}</p>
          <div className={styles.preview} dangerouslySetInnerHTML={{ __html: wire }} />
        </div>
      )}
    </div>
  );
};

export default RichHtmlEditor;
