import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Italic, Strikethrough, List, ListOrdered } from 'lucide-react';
import { cn } from '../../utils/utils';
import { Button } from './button';

interface RichTextEditorProps {
    content: string;
    onChange: (html: string) => void;
    placeholder?: string;
    className?: string;
}

export function RichTextEditor({ content, onChange, placeholder = "Digite aqui...", className }: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder,
            }),
        ],
        content: content,
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose-base dark:prose-invert focus:outline-none min-h-[150px] max-w-none px-3 py-2',
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        immediatelyRender: false // Fixes some hydration issues in newer React versions
    });

    if (!editor) {
        return null;
    }

    return (
        <div className={cn("border border-input rounded-md overflow-hidden bg-background focus-within:ring-2 focus-within:ring-primary", className)}>
            {/* Toolbar */}
            <div className="flex items-center gap-1 p-1 border-b border-border bg-muted/20">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={cn("h-8 w-8 p-0", editor.isActive('bold') ? "bg-muted text-primary" : "text-muted-foreground")}
                    title="Negrito"
                >
                    <Bold className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={cn("h-8 w-8 p-0", editor.isActive('italic') ? "bg-muted text-primary" : "text-muted-foreground")}
                    title="Itálico"
                >
                    <Italic className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    className={cn("h-8 w-8 p-0", editor.isActive('strike') ? "bg-muted text-primary" : "text-muted-foreground")}
                    title="Tachado"
                >
                    <Strikethrough className="h-4 w-4" />
                </Button>
                <div className="w-px h-4 bg-border mx-1" />
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={cn("h-8 w-8 p-0", editor.isActive('bulletList') ? "bg-muted text-primary" : "text-muted-foreground")}
                    title="Lista com marcadores"
                >
                    <List className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={cn("h-8 w-8 p-0", editor.isActive('orderedList') ? "bg-muted text-primary" : "text-muted-foreground")}
                    title="Lista numerada"
                >
                    <ListOrdered className="h-4 w-4" />
                </Button>
            </div>

            {/* Editor Area */}
            <div className="cursor-text" onClick={() => editor.chain().focus().run()}>
                <EditorContent editor={editor} />
            </div>
        </div>
    );
}
