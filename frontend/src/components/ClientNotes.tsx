import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import CharacterCount from '@tiptap/extension-character-count';
import Color from '@tiptap/extension-color';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toggle } from "@/components/ui/toggle";
import { toast } from "sonner";
import * as ds from "utils/design-system";
import { format } from 'date-fns';
import { saveAs } from 'file-saver';
import { createDefaultFilename } from "utils/export-utils";
import { ExportOptions } from "./ExportOptions";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon,
  Code,
  Heading1,
  Heading2,
  Quote,
  Undo,
  Redo,
  Strikethrough,
  Pilcrow,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Highlighter,
  Palette,
  History,
  Save,
  Download,
  Type
} from 'lucide-react';

interface RichTextEditorProps {
  initialContent?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  className?: string;
  programType?: "PRIME" | "LONGEVITY";
  autoFocus?: boolean;
  characterLimit?: number;
}

export function RichTextEditor({
  initialContent = '',
  onChange,
  placeholder = 'Enter your content here...',
  className = '',
  programType = "PRIME",
  autoFocus = false,
  characterLimit = 10000
}: RichTextEditorProps) {
  const [linkUrl, setLinkUrl] = useState<string>('');
  const [isAddingLink, setIsAddingLink] = useState<boolean>(false);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isAddingImage, setIsAddingImage] = useState<boolean>(false);
  const [textColor, setTextColor] = useState<string>('#ffffff');
  const [isSelectingColor, setIsSelectingColor] = useState<boolean>(false);
  const [charactersCount, setCharactersCount] = useState<number>(0);
  
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Highlight.configure({
        HTMLAttributes: {
          class: 'bg-yellow-200 text-black px-1 rounded',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 underline cursor-pointer',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-md max-w-full',
        },
      }),
      CharacterCount.configure({
        limit: characterLimit,
      }),
      Color,
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'prose prose-invert focus:outline-none min-h-[150px] max-w-none px-3 py-2',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setCharactersCount(editor.storage.characterCount.characters());
      if (onChange) {
        onChange(html);
      }
    },
    autofocus: autoFocus,
  });
  
  if (!editor) {
    return null;
  }
  
  const addLink = () => {
    if (linkUrl) {
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: linkUrl })
        .run();
      setLinkUrl('');
      setIsAddingLink(false);
    }
  };
  
  const addImage = () => {
    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
      setImageUrl('');
      setIsAddingImage(false);
    }
  };
  
  const setColor = () => {
    if (textColor) {
      editor.chain().focus().setColor(textColor).run();
      setIsSelectingColor(false);
    }
  };
  
  const exportToMarkdown = () => {
    // Simple HTML to Markdown conversion (basic)
    if (!editor) return;
    
    const html = editor.getHTML();
    let markdown = html
      .replace(/<h1>(.*?)<\/h1>/g, '# $1\n')
      .replace(/<h2>(.*?)<\/h2>/g, '## $1\n')
      .replace(/<p>(.*?)<\/p>/g, '$1\n')
      .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
      .replace(/<em>(.*?)<\/em>/g, '*$1*')
      .replace(/<u>(.*?)<\/u>/g, '_$1_')
      .replace(/<s>(.*?)<\/s>/g, '~~$1~~')
      .replace(/<a href="(.*?)">(.*?)<\/a>/g, '[$2]($1)')
      .replace(/<img src="(.*?)".*?\/>/g, '![]($1)')
      .replace(/<ul>(.*?)<\/ul>/gs, (match, p1) => {
        return p1.replace(/<li>(.*?)<\/li>/g, '- $1\n');
      })
      .replace(/<ol>(.*?)<\/ol>/gs, (match, p1) => {
        return p1.replace(/<li>(.*?)<\/li>/g, '1. $1\n');
      })
      .replace(/<blockquote>(.*?)<\/blockquote>/gs, '> $1\n')
      .replace(/<code>(.*?)<\/code>/g, '`$1`')
      .replace(/<pre><code>(.*?)<\/code><\/pre>/gs, '```\n$1\n```\n')
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&');
      
    // Save as markdown file
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    saveAs(blob, `${createDefaultFilename('notes')}.md`);
    toast.success("Notes exported as Markdown");
  };
  
  // Export to plain text
  const exportToText = () => {
    if (!editor) return;
    const plainText = editor.getText();
    const blob = new Blob([plainText], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, `${createDefaultFilename('notes')}.txt`);
    toast.success("Notes exported as Text");
  };

  return (
    <div className={`rich-text-editor ${className}`}>
      <Card className={`${ds.borders.card} overflow-hidden`}>
        <CardHeader className="p-3 border-b border-border">
          <div className="flex flex-wrap gap-1">
            <Toggle
              size="sm"
              pressed={editor.isActive('bold')}
              onPressedChange={() => editor.chain().focus().toggleBold().run()}
              aria-label="Bold"
              title="Bold"
            >
              <Bold className="h-4 w-4" />
            </Toggle>
            
            <Toggle
              size="sm"
              pressed={editor.isActive('italic')}
              onPressedChange={() => editor.chain().focus().toggleItalic().run()}
              aria-label="Italic"
              title="Italic"
            >
              <Italic className="h-4 w-4" />
            </Toggle>
            
            <Toggle
              size="sm"
              pressed={editor.isActive('underline')}
              onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
              aria-label="Underline"
              title="Underline"
            >
              <UnderlineIcon className="h-4 w-4" />
            </Toggle>
            
            <Toggle
              size="sm"
              pressed={editor.isActive('strike')}
              onPressedChange={() => editor.chain().focus().toggleStrike().run()}
              aria-label="Strikethrough"
              title="Strikethrough"
            >
              <Strikethrough className="h-4 w-4" />
            </Toggle>
            
            <Toggle
              size="sm"
              pressed={editor.isActive('highlight')}
              onPressedChange={() => editor.chain().focus().toggleHighlight().run()}
              aria-label="Highlight"
              title="Highlight"
            >
              <Highlighter className="h-4 w-4" />
            </Toggle>
            
            <div className="w-px h-6 bg-border mx-1" />
            
            <Toggle
              size="sm"
              pressed={editor.isActive('heading', { level: 1 })}
              onPressedChange={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              aria-label="Heading 1"
              title="Heading 1"
            >
              <Heading1 className="h-4 w-4" />
            </Toggle>
            
            <Toggle
              size="sm"
              pressed={editor.isActive('heading', { level: 2 })}
              onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              aria-label="Heading 2"
              title="Heading 2"
            >
              <Heading2 className="h-4 w-4" />
            </Toggle>
            
            <Toggle
              size="sm"
              pressed={editor.isActive('paragraph')}
              onPressedChange={() => editor.chain().focus().setParagraph().run()}
              aria-label="Paragraph"
              title="Paragraph"
            >
              <Pilcrow className="h-4 w-4" />
            </Toggle>
            
            <div className="w-px h-6 bg-border mx-1" />
            
            <Toggle
              size="sm"
              pressed={editor.isActive({ textAlign: 'left' })}
              onPressedChange={() => editor.chain().focus().setTextAlign('left').run()}
              aria-label="Align Left"
              title="Align Left"
            >
              <AlignLeft className="h-4 w-4" />
            </Toggle>
            
            <Toggle
              size="sm"
              pressed={editor.isActive({ textAlign: 'center' })}
              onPressedChange={() => editor.chain().focus().setTextAlign('center').run()}
              aria-label="Align Center"
              title="Align Center"
            >
              <AlignCenter className="h-4 w-4" />
            </Toggle>
            
            <Toggle
              size="sm"
              pressed={editor.isActive({ textAlign: 'right' })}
              onPressedChange={() => editor.chain().focus().setTextAlign('right').run()}
              aria-label="Align Right"
              title="Align Right"
            >
              <AlignRight className="h-4 w-4" />
            </Toggle>
            
            <div className="w-px h-6 bg-border mx-1" />
            
            <Toggle
              size="sm"
              pressed={editor.isActive('bulletList')}
              onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
              aria-label="Bullet List"
              title="Bullet List"
            >
              <List className="h-4 w-4" />
            </Toggle>
            
            <Toggle
              size="sm"
              pressed={editor.isActive('orderedList')}
              onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
              aria-label="Ordered List"
              title="Ordered List"
            >
              <ListOrdered className="h-4 w-4" />
            </Toggle>
            
            <Toggle
              size="sm"
              pressed={editor.isActive('blockquote')}
              onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}
              aria-label="Quote"
              title="Quote"
            >
              <Quote className="h-4 w-4" />
            </Toggle>
            
            <Toggle
              size="sm"
              pressed={editor.isActive('codeBlock')}
              onPressedChange={() => editor.chain().focus().toggleCodeBlock().run()}
              aria-label="Code Block"
              title="Code Block"
            >
              <Code className="h-4 w-4" />
            </Toggle>
            
            <div className="w-px h-6 bg-border mx-1" />
            
            <Toggle
              size="sm"
              pressed={isSelectingColor}
              onPressedChange={() => setIsSelectingColor(!isSelectingColor)}
              aria-label="Text Color"
              title="Text Color"
            >
              <Palette className="h-4 w-4" />
            </Toggle>
            
            <Toggle
              size="sm"
              pressed={editor.isActive('link')}
              onPressedChange={() => setIsAddingLink(!isAddingLink)}
              aria-label="Add Link"
              title="Add Link"
            >
              <LinkIcon className="h-4 w-4" />
            </Toggle>
            
            <Toggle
              size="sm"
              onPressedChange={() => setIsAddingImage(!isAddingImage)}
              aria-label="Add Image"
              title="Add Image"
            >
              <ImageIcon className="h-4 w-4" />
            </Toggle>
            
            <div className="w-px h-6 bg-border mx-1" />
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              title="Undo"
            >
              <Undo className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              title="Redo"
            >
              <Redo className="h-4 w-4" />
            </Button>
            
            <div className="w-px h-6 bg-border mx-1" />
            
            <Button
              variant="ghost"
              size="icon"
              onClick={exportToMarkdown}
              title="Export to Markdown"
            >
              <Download className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={exportToText}
              title="Export to Plain Text"
            >
              <Type className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Character count */}
          <div className="mt-1 flex justify-end">
            <span className={`text-xs ${charactersCount > characterLimit ? 'text-red-500' : 'text-muted-foreground'}`}>
              {charactersCount}/{characterLimit} characters
            </span>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {/* Link Input */}
          {isAddingLink && (
            <div className="p-3 bg-accent/20 border-b border-border">
              <div className="flex items-center gap-2">
                <Input
                  type="url"
                  placeholder="Enter URL"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="flex-grow h-8"
                />
                <Button 
                  size="sm" 
                  onClick={addLink}
                  className={programType === "PRIME" ? ds.colors.prime.bg : ds.colors.longevity.bg}
                >
                  Add Link
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setIsAddingLink(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
          
          {/* Image Input */}
          {isAddingImage && (
            <div className="p-3 bg-accent/20 border-b border-border">
              <div className="flex items-center gap-2">
                <Input
                  type="url"
                  placeholder="Enter image URL"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="flex-grow h-8"
                />
                <Button 
                  size="sm" 
                  onClick={addImage}
                  className={programType === "PRIME" ? ds.colors.prime.bg : ds.colors.longevity.bg}
                >
                  Add Image
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setIsAddingImage(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
          
          {/* Color Picker */}
          {isSelectingColor && (
            <div className="p-3 bg-accent/20 border-b border-border">
              <div className="flex items-center gap-2">
                <Input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-12 h-8"
                />
                <Button 
                  size="sm" 
                  onClick={setColor}
                  className={programType === "PRIME" ? ds.colors.prime.bg : ds.colors.longevity.bg}
                >
                  Set Color
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setIsSelectingColor(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
          
          <div className="p-2">
            <div className="prose prose-invert prose-headings:my-2 prose-p:my-2 prose-ul:my-2 prose-ol:my-2 max-w-none">
              <EditorContent editor={editor} className="min-h-[200px]" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface ClientNotesProps {
  clientId: string;
  initialNotes?: string;
  onSave?: (notes: string) => void;
  programType?: "PRIME" | "LONGEVITY";
  className?: string;
  autoSaveInterval?: number;
  notesHistory?: Array<{ content: string, timestamp: string }>;
}

export function ClientNotes({
  clientId,
  initialNotes = '',
  onSave,
  programType = "PRIME",
  className = '',
  autoSaveInterval = 3000,
  notesHistory = []
}: ClientNotesProps) {
  const [notes, setNotes] = useState<string>(initialNotes);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isChanged, setIsChanged] = useState<boolean>(false);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [history, setHistory] = useState<Array<{ content: string, timestamp: string }>>(notesHistory);
  
  // Debounced save function
  const debouncedSave = useCallback(
    async (content: string) => {
      if (!clientId || !content) return;
      
      setIsSaving(true);
      try {
        // Make API call to save notes
        if (onSave) {
          await onSave(content);
          const timestamp = new Date().toISOString();
          setHistory(prev => [
            { content, timestamp },
            ...prev.slice(0, 19) // Keep last 20 entries
          ]);
          setLastSaved(new Date());
          toast.success("Notes saved automatically", { 
            position: "bottom-right",
            duration: 2000
          });
        }
      } catch (error) {
        console.error('Failed to auto-save notes:', error);
        toast.error("Failed to auto-save notes");
      } finally {
        setIsSaving(false);
        setIsChanged(false);
      }
    },
    [clientId, onSave]
  );
  
  // Set up autosave
  useEffect(() => {
    if (isChanged && clientId) {
      // Clear any existing timer
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
      
      // Set new timer
      autoSaveTimerRef.current = setTimeout(() => {
        debouncedSave(notes);
      }, autoSaveInterval);
    }
    
    // Clean up timer on unmount
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [notes, isChanged, clientId, debouncedSave, autoSaveInterval]);
  
  const handleContentChange = (content: string) => {
    setNotes(content);
    setIsChanged(true);
  };
  
  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (onSave) {
        await onSave(notes);
        const timestamp = new Date().toISOString();
        setHistory(prev => [
          { content: notes, timestamp },
          ...prev.slice(0, 19) // Keep last 20 entries
        ]);
        setLastSaved(new Date());
        setIsChanged(false);
        toast.success("Notes saved successfully");
      }
    } catch (error) {
      console.error('Failed to save notes:', error);
      toast.error("Failed to save notes");
    } finally {
      setIsSaving(false);
    }
  };
  
  const restoreFromHistory = (content: string) => {
    if (isChanged && window.confirm("You have unsaved changes that will be lost. Continue?")) {
      setNotes(content);
      setIsChanged(false);
      setShowHistory(false);
    } else if (!isChanged) {
      setNotes(content);
      setShowHistory(false);
    }
  };
  
  const formatHistoryDate = (timestamp: string) => {
    try {
      return format(new Date(timestamp), 'MMM d, yyyy HH:mm:ss');
    } catch {
      return timestamp;
    }
  };
  
  return (
    <div className={className}>
      <Card className={`${ds.borders.card} overflow-hidden`}>
        <CardHeader className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <CardTitle className={`${ds.typography.cardTitle} ${programType === "PRIME" ? ds.colors.prime.text : ds.colors.longevity.text}`}>
              Client Notes
            </CardTitle>
            <div className="flex items-center gap-2">
              {isChanged && (
                <span className="text-xs text-amber-500 animate-pulse">
                  Unsaved changes
                </span>
              )}
              {lastSaved && (
                <span className="text-xs text-muted-foreground">
                  Last saved: {lastSaved.toLocaleTimeString()}
                </span>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowHistory(!showHistory)}
                className="gap-1"
              >
                <History className="h-4 w-4" />
                {history.length > 0 ? `History (${history.length})` : "History"}
              </Button>
              
              <ExportOptions
                data={[{ content: notes, timestamp: new Date().toISOString() }]}
                filename={`client-notes-${clientId.substring(0, 8)}`}
                size="sm"
                showLabel={false}
                variant={programType === "PRIME" ? "prime" : "longevity"}
              />
            </div>
          </div>
          <CardDescription>
            Add detailed notes about this client. Use formatting to organize important information.
            <span className="text-xs ml-2 text-muted-foreground">(Notes auto-save after {autoSaveInterval/1000} seconds of inactivity)</span>
          </CardDescription>
        </CardHeader>
        
        {showHistory && history.length > 0 && (
          <div className="p-3 border-b border-border bg-accent/10">
            <div className="text-sm font-medium mb-2">Version History</div>
            <div className="max-h-40 overflow-y-auto">
              {history.map((entry, index) => (
                <div 
                  key={index} 
                  className="flex justify-between items-center p-2 rounded hover:bg-accent/20 cursor-pointer"
                  onClick={() => restoreFromHistory(entry.content)}
                >
                  <div className="text-xs text-muted-foreground">{formatHistoryDate(entry.timestamp)}</div>
                  <Button variant="ghost" size="sm">Restore</Button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <CardContent className="p-4">
          <RichTextEditor
            initialContent={initialNotes}
            onChange={handleContentChange}
            programType={programType}
            placeholder="Enter detailed notes about this client..."
            autoFocus={false}
            characterLimit={50000}
          />
        </CardContent>
        
        <CardFooter className="p-4 border-t border-border flex justify-between items-center">
          <div className="flex items-center gap-2">
            {isSaving && (
              <span className="text-xs text-muted-foreground flex items-center">
                <span className="inline-block w-3 h-3 rounded-full border-2 border-t-transparent border-blue-500 animate-spin mr-2"></span>
                Saving...
              </span>
            )}
          </div>
          <Button
            onClick={handleSave}
            disabled={isSaving || !isChanged}
            className={`${programType === "PRIME" ? ds.colors.prime.bg : ds.colors.longevity.bg}`}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Notes
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
