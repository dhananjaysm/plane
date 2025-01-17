import { useEditor as useCustomEditor, Editor } from "@tiptap/react";
import { useImperativeHandle, useRef, MutableRefObject, useState, useEffect } from "react";
import { CoreEditorProps } from "src/ui/props";
import { CoreEditorExtensions } from "src/ui/extensions";
import { EditorProps } from "@tiptap/pm/view";
import { getTrimmedHTML } from "src/lib/utils";
import { DeleteImage } from "src/types/delete-image";
import { IMentionHighlight, IMentionSuggestion } from "src/types/mention-suggestion";
import { RestoreImage } from "src/types/restore-image";
import { UploadImage } from "src/types/upload-image";
import { Selection } from "@tiptap/pm/state";
import { insertContentAtSavedSelection } from "src/helpers/insert-content-at-cursor-position";
import { EditorMenuItemNames, getEditorMenuItems } from "src/ui/menus/menu-items";
import { EditorRefApi } from "src/types/editor-ref-api";
import { IMarking, scrollSummary } from "src/helpers/scroll-to-node";

interface CustomEditorProps {
  id?: string;
  uploadFile: UploadImage;
  restoreFile: RestoreImage;
  deleteFile: DeleteImage;
  cancelUploadImage?: () => any;
  initialValue: string;
  editorClassName: string;
  // undefined when prop is not passed, null if intentionally passed to stop
  // swr syncing
  value: string | null | undefined;
  onChange?: (json: object, html: string) => void;
  extensions?: any;
  editorProps?: EditorProps;
  forwardedRef?: MutableRefObject<EditorRefApi | null>;
  mentionHandler: {
    highlights: () => Promise<IMentionHighlight[]>;
    suggestions?: () => Promise<IMentionSuggestion[]>;
  };
  handleEditorReady?: (value: boolean) => void;
}

export const useEditor = ({
  uploadFile,
  id = "",
  deleteFile,
  cancelUploadImage,
  editorProps = {},
  initialValue,
  editorClassName,
  value,
  extensions = [],
  onChange,
  forwardedRef,
  restoreFile,
  handleEditorReady,
  mentionHandler,
}: CustomEditorProps) => {
  const editor = useCustomEditor({
    editorProps: {
      ...CoreEditorProps(uploadFile, editorClassName),
      ...editorProps,
    },
    extensions: [
      ...CoreEditorExtensions(
        {
          mentionSuggestions: mentionHandler.suggestions ?? (() => Promise.resolve<IMentionSuggestion[]>([])),
          mentionHighlights: mentionHandler.highlights ?? [],
        },
        deleteFile,
        restoreFile,
        cancelUploadImage
      ),
      ...extensions,
    ],
    content: typeof initialValue === "string" && initialValue.trim() !== "" ? initialValue : "<p></p>",
    onCreate: async () => {
      handleEditorReady?.(true);
    },
    onTransaction: async ({ editor }) => {
      setSavedSelection(editor.state.selection);
    },
    onUpdate: async ({ editor }) => {
      onChange?.(editor.getJSON(), getTrimmedHTML(editor.getHTML()));
    },
    onDestroy: async () => {
      handleEditorReady?.(false);
    },
  });

  // for syncing swr data on tab refocus etc, can remove it once this is merged
  // https://github.com/ueberdosis/tiptap/pull/4453
  useEffect(() => {
    // value is null when intentionally passed where syncing is not yet
    // supported and value is undefined when the data from swr is not populated
    if (value === null || value === undefined) return;
    if (editor && !editor.isDestroyed) editor?.commands.setContent(value);
  }, [editor, value, id]);

  const editorRef: MutableRefObject<Editor | null> = useRef(null);

  const [savedSelection, setSavedSelection] = useState<Selection | null>(null);

  useImperativeHandle(
    forwardedRef,
    () => ({
      clearEditor: () => {
        editorRef.current?.commands.clearContent();
      },
      setEditorValue: (content: string) => {
        editorRef.current?.commands.setContent(content);
      },
      setEditorValueAtCursorPosition: (content: string) => {
        if (savedSelection) {
          insertContentAtSavedSelection(editorRef, content, savedSelection);
        }
      },
      executeMenuItemCommand: (itemName: EditorMenuItemNames) => {
        const editorItems = getEditorMenuItems(editorRef.current, uploadFile);

        const getEditorMenuItem = (itemName: EditorMenuItemNames) => editorItems.find((item) => item.name === itemName);

        const item = getEditorMenuItem(itemName);
        if (item) {
          if (item.name === "image") {
            item.command(savedSelection);
          } else {
            item.command();
          }
        } else {
          console.warn(`No command found for item: ${itemName}`);
        }
      },
      isMenuItemActive: (itemName: EditorMenuItemNames): boolean => {
        const editorItems = getEditorMenuItems(editorRef.current, uploadFile);

        const getEditorMenuItem = (itemName: EditorMenuItemNames) => editorItems.find((item) => item.name === itemName);
        const item = getEditorMenuItem(itemName);
        return item ? item.isActive() : false;
      },
      onStateChange: (callback: () => void) => {
        // Subscribe to editor state changes
        editorRef.current?.on("transaction", () => {
          callback();
        });
        // Return a function to unsubscribe to the continuous transactions of
        // the editor on unmounting the component that has subscribed to this
        // method
        return () => {
          editorRef.current?.off("transaction");
        };
      },
      getMarkDown: (): string => {
        const markdownOutput = editorRef.current?.storage.markdown.getMarkdown();
        return markdownOutput;
      },
      scrollSummary: (marking: IMarking): void => {
        if (!editorRef.current) return;
        scrollSummary(editorRef.current, marking);
      },
      setFocusAtPosition: (position: number) => {
        if (!editorRef.current) return;
        editorRef.current
          .chain()
          .insertContentAt(position, [{ type: "paragraph" }])
          .focus()
          .run();
      },
    }),
    [editorRef, savedSelection, uploadFile]
  );

  if (!editor) {
    return null;
  }

  // the editorRef is used to access the editor instance from outside the hook
  // and should only be used after editor is initialized
  editorRef.current = editor;

  return editor;
};
