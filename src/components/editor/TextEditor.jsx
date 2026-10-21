import { Bold as BoldIcon, Italic as ItalicIcon, Underline as UnderlineIcon } from "lucide-react";
import { useEffect } from "react";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import Underline from "@tiptap/extension-underline";
import HardBreak from "@tiptap/extension-hard-break";
import { Placeholder, UndoRedo } from "@tiptap/extensions";
import { documentFromText, textFromDocument } from "../../utils/textFormatting.js";
import "./TextEditor.css";

// Tiptap owns editing/selection/undo; the parent owns the portable draft and saving.
export default function TextEditor({ value, onChange, disabled }) {
  const editor = useEditor({
    extensions: [Document, Paragraph, Text, Bold, Italic, Underline, HardBreak, UndoRedo, Placeholder.configure({ placeholder: "Whatever stayed with you." })],
    content: documentFromText(value),
    editorProps: { attributes: {
      role: "textbox", "aria-label": "Your words", "aria-multiline": "true",
      "aria-describedby": "text-help", spellcheck: "true", autocapitalize: "sentences",
      class: "rich-text-input",
    } },
    onUpdate: ({ editor }) => onChange(textFromDocument(editor.getJSON())),
  });
  const active = useEditorState({ editor, selector: ({ editor }) => ({
    bold: editor?.isActive("bold"), italic: editor?.isActive("italic"), underline: editor?.isActive("underline"),
  }) });

  useEffect(() => { editor?.setEditable(!disabled); }, [editor, disabled]);

  return (
    <div className="text-editor">
      <div className="text-toolbar" role="group" aria-label="Text formatting">
        <button type="button" aria-label="Bold" aria-pressed={Boolean(active?.bold)} disabled={disabled || !editor}
          onMouseDown={(event) => event.preventDefault()} onClick={() => editor.chain().focus().toggleBold().run()}><BoldIcon size={17} strokeWidth={2} /></button>
        <button type="button" aria-label="Italic" aria-pressed={Boolean(active?.italic)} disabled={disabled || !editor}
          onMouseDown={(event) => event.preventDefault()} onClick={() => editor.chain().focus().toggleItalic().run()}><ItalicIcon size={17} strokeWidth={2} /></button>
        <button type="button" aria-label="Underline" aria-pressed={Boolean(active?.underline)} disabled={disabled || !editor}
          onMouseDown={(event) => event.preventDefault()} onClick={() => editor.chain().focus().toggleUnderline().run()}><UnderlineIcon size={17} strokeWidth={2} /></button>
      </div>
      <EditorContent editor={editor} />
      <p className="sr-only" id="text-help">Select words to format them, or choose a style before typing. {value.text.length.toLocaleString()} / 20,000</p>
    </div>
  );
}
