import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

interface RichTextEditorProps {
    value: string;
    onChange: (content: string) => void;
}

const RichTextEditor = ({ value, onChange }: RichTextEditorProps) => {
    const editor = useEditor({
        extensions: [StarterKit],
        content: value,
        // Tailwind classes for the editor area
        editorProps: {
            attributes: {
                class: 'prose prose-sm focus:outline-none min-h-[150px] p-3 max-w-none',
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML())
        },
    })

    if (!editor) return null

    return (
        <div className="w-full border border-gray-300 rounded-md overflow-hidden bg-white focus-within:ring-2 focus-within:ring-blue-500">
            {/* Toolbar Area */}
            <div className="bg-gray-50 border-b border-gray-300 p-2 flex flex-wrap gap-1">
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`px-3 py-1 rounded text-sm font-bold ${editor.isActive('bold') ? 'bg-blue-600 text-white' : 'hover:bg-gray-200 text-gray-700'}`}
                >
                    B
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`px-3 py-1 rounded text-sm italic ${editor.isActive('italic') ? 'bg-blue-600 text-white' : 'hover:bg-gray-200 text-gray-700'}`}
                >
                    I
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={`px-3 py-1 rounded text-sm ${editor.isActive('bulletList') ? 'bg-blue-600 text-white' : 'hover:bg-gray-200 text-gray-700'}`}
                >
                    • List
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={`px-3 py-1 rounded text-sm ${editor.isActive('orderedList') ? 'bg-blue-600 text-white' : 'hover:bg-gray-200 text-gray-700'}`}
                >
                    1. List
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().undo().run()}
                    className="px-3 py-1 rounded text-sm hover:bg-gray-200 text-gray-700"
                >
                    Undo
                </button>
            </div>

            {/* Editor Input Area */}
            <EditorContent editor={editor} />
        </div>
    )
}

export default RichTextEditor