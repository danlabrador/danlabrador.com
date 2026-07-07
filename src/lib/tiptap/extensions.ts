import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { createLowlight, common } from "lowlight";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Youtube from "@tiptap/extension-youtube";

const lowlight = createLowlight(common);

export const tiptapExtensions = [
  StarterKit.configure({
    codeBlock: false, // replaced by CodeBlockLowlight below
    heading: { levels: [2, 3, 4] },
  }),
  Link.configure({
    openOnClick: false,
    autolink: true,
    linkOnPaste: true,
    defaultProtocol: "https",
    HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
    // Only accept link marks with a real URL. Pastes from Notion /
    // Google Docs / some web pages sometimes preserve link styling but
    // drop the href — this rejects those so we don't store dead anchors.
    isAllowedUri: (url) =>
      typeof url === "string" &&
      url.trim().length > 0 &&
      url !== "https://" &&
      url !== "http://",
  }),
  Image,
  Placeholder.configure({ placeholder: "Write something..." }),
  CharacterCount,
  CodeBlockLowlight.configure({ lowlight }),
  Table.configure({ resizable: true }),
  TableRow,
  TableHeader,
  TableCell,
  TaskList,
  TaskItem.configure({ nested: true }),
  Youtube.configure({ nocookie: true, controls: true }),
];
