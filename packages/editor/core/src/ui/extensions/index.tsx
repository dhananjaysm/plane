import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import TextStyle from "@tiptap/extension-text-style";
import TiptapUnderline from "@tiptap/extension-underline";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "tiptap-markdown";

import { Table } from "src/ui/extensions/table/table";
import { TableCell } from "src/ui/extensions/table/table-cell/table-cell";
import { TableHeader } from "src/ui/extensions/table/table-header/table-header";
import { TableRow } from "src/ui/extensions/table/table-row/table-row";

import { ImageExtension } from "src/ui/extensions/image";

import { isValidHttpUrl } from "src/lib/utils";
import { Mentions } from "src/ui/mentions";

import { CustomCodeBlockExtension } from "src/ui/extensions/code";
import { ListKeymap } from "src/ui/extensions/custom-list-keymap";
import { CustomKeymap } from "src/ui/extensions/keymap";
import { CustomQuoteExtension } from "src/ui/extensions/quote";

import { DeleteImage } from "src/types/delete-image";
import { IMentionHighlight, IMentionSuggestion } from "src/types/mention-suggestion";
import { RestoreImage } from "src/types/restore-image";
import { CustomLinkExtension } from "src/ui/extensions/custom-link";
import { CustomCodeInlineExtension } from "src/ui/extensions/code-inline";
import { CustomTypographyExtension } from "src/ui/extensions/typography";
import { CustomHorizontalRule } from "src/ui/extensions/horizontal-rule/horizontal-rule";
import { CustomCodeMarkPlugin } from "./custom-code-inline/inline-code-plugin";

export const CoreEditorExtensions = (
  mentionConfig: {
    mentionSuggestions?: () => Promise<IMentionSuggestion[]>;
    mentionHighlights?: () => Promise<IMentionHighlight[]>;
  },
  deleteFile: DeleteImage,
  restoreFile: RestoreImage,
  cancelUploadImage?: () => any
) => [
  StarterKit.configure({
    bulletList: {
      HTMLAttributes: {
        class: "list-disc pl-7 space-y-2",
      },
    },
    orderedList: {
      HTMLAttributes: {
        class: "list-decimal pl-7 space-y-2",
      },
    },
    listItem: {
      HTMLAttributes: {
        class: "not-prose space-y-2",
      },
    },
    code: false,
    codeBlock: false,
    horizontalRule: false,
    blockquote: false,
    dropcursor: {
      color: "rgba(var(--color-text-100))",
      width: 1,
    },
  }),
  // BulletList,
  // OrderedList,
  // ListItem,
  CustomQuoteExtension,
  CustomHorizontalRule.configure({
    HTMLAttributes: {
      class: "my-4",
    },
  }),
  CustomKeymap,
  ListKeymap,
  CustomLinkExtension.configure({
    openOnClick: true,
    autolink: true,
    linkOnPaste: true,
    protocols: ["http", "https"],
    validate: (url: string) => isValidHttpUrl(url),
    HTMLAttributes: {
      class:
        "text-custom-primary-300 underline underline-offset-[3px] hover:text-custom-primary-500 transition-colors cursor-pointer",
    },
  }),
  CustomTypographyExtension,
  ImageExtension(deleteFile, restoreFile, cancelUploadImage).configure({
    HTMLAttributes: {
      class: "rounded-md",
    },
  }),
  TiptapUnderline,
  TextStyle,
  TaskList.configure({
    HTMLAttributes: {
      class: "not-prose pl-2 space-y-2",
    },
  }),
  TaskItem.configure({
    HTMLAttributes: {
      class: "flex",
    },
    nested: true,
  }),
  CustomCodeBlockExtension.configure({
    HTMLAttributes: {
      class: "",
    },
  }),
  CustomCodeMarkPlugin,
  CustomCodeInlineExtension,
  Markdown.configure({
    html: true,
    transformPastedText: true,
  }),
  Table,
  TableHeader,
  TableCell,
  TableRow,
  Mentions({
    mentionSuggestions: mentionConfig.mentionSuggestions,
    mentionHighlights: mentionConfig.mentionHighlights,
    readonly: false,
  }),
];
