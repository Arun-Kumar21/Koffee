import { useCallback, useState } from "react";
import * as Y from "yjs";
import { Editor as TipTapEditor } from "@tiptap/core";
import { useEditor } from "@tiptap/react";
import Collaboration from "@tiptap/extension-collaboration";
import StarterKit from "@tiptap/starter-kit";
import { Socket } from "socket.io-client";
import { decodeUpdate, encodeUpdate } from "../../../lib/editor-helper";
import { Heading } from '@tiptap/extension-heading';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import CodeBlock from '@tiptap/extension-code-block'
import Highlight from '@tiptap/extension-highlight'
import Underline from "@tiptap/extension-underline";
import Link from '@tiptap/extension-link'

export const useCollaborativeEditor = (
  socket: Socket | null,
) => {
  const [ydoc] = useState(() => new Y.Doc());
  const [isInitialized, setIsInitialized] = useState(false);
  const [showSelection, setShowSelection] = useState(false);
  const handleEditorCreate = useCallback(
    ({ editor }: { editor: TipTapEditor }) => {
      if (!isInitialized) {
        editor.commands.setContent("");
        setIsInitialized(true);
      }
    },
    [isInitialized]
  );

  const handleDocUpdate = useCallback(() => {
    if (!socket) return;
    const update = Y.encodeStateAsUpdate(ydoc);
    const encodedUpdate = encodeUpdate(update);
    socket.emit("update-canvas", encodedUpdate);
  }, [socket, ydoc]);

  const handleUpdate = useCallback(
    (update: string) => {
      try {
        const updateArray = decodeUpdate(update);
        Y.applyUpdate(ydoc, updateArray);
      } catch (error) {
        console.error("Error applying update:", error);
      }
    },
    [ydoc]
  );

  const handleInitialState = useCallback(
    (initialState: string) => {
      try {
        const stateArray = decodeUpdate(initialState);
        Y.applyUpdate(ydoc, stateArray);
      } catch (error) {
        console.error("Error applying initial state:", error);
      }
    },
    [ydoc]
  );

  const updateHandler = useCallback(
    (update: Uint8Array) => {
      if (!socket || update.byteLength === 0) return;
      const encodedUpdate = encodeUpdate(update);
      socket.emit("update-canvas", encodedUpdate);
    },
    [socket]
  );

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: false,
      }),
      Collaboration.configure({
        document: ydoc,
        field: "content",
      }),
      CodeBlock,
      Document,
      Paragraph,
      Underline,
      Text,
      Heading.configure({
        levels: [1, 2, 3],
      }),
      Highlight.configure({ multicolor: true }),
      Link.configure({
        openOnClick: true,
        autolink: true,
        defaultProtocol: 'https',
        protocols: ['http', 'https'],
        isAllowedUri: (url, ctx) => {
          try {
            // construct URL
            const parsedUrl = url.includes(':') ? new URL(url) : new URL(`${ctx.defaultProtocol}://${url}`)

            // use default validation
            if (!ctx.defaultValidate(parsedUrl.href)) {
              return false
            }

            // disallowed protocols
            const disallowedProtocols = ['ftp', 'file', 'mailto']
            const protocol = parsedUrl.protocol.replace(':', '')

            if (disallowedProtocols.includes(protocol)) {
              return false
            }

            // only allow protocols specified in ctx.protocols
            const allowedProtocols = ctx.protocols.map(p => (typeof p === 'string' ? p : p.scheme))

            if (!allowedProtocols.includes(protocol)) {
              return false
            }

            // disallowed domains
            const disallowedDomains = ['example-phishing.com', 'malicious-site.net']
            const domain = parsedUrl.hostname

            if (disallowedDomains.includes(domain)) {
              return false
            }

            // all checks have passed
            return true
          } catch (error) {
            return false
          }
        },
        shouldAutoLink: url => {
          try {
            // construct URL
            const parsedUrl = url.includes(':') ? new URL(url) : new URL(`https://${url}`)

            // only auto-link if the domain is not in the disallowed list
            const disallowedDomains = ['example-no-autolink.com', 'another-no-autolink.com']
            const domain = parsedUrl.hostname

            return !disallowedDomains.includes(domain)
          } catch (error) {
            return false
          }
        },

      }),
    ],
    onCreate: handleEditorCreate,
    onUpdate: handleDocUpdate,
    onSelectionUpdate: ({ editor }) => {
      const selection = editor.state.selection;
      const isTextSelected = !selection.empty; // Check if text is selected
      setShowSelection(isTextSelected);
    },
    editorProps: {
      attributes: {
        class:
          "h-full mx-auto focus:outline-none prose prose-sm sm:prose lg:prose-lg whitespace-pre-wrap break-words overflow-auto",
      },
    },
  });

  return {
    editor,
    ydoc,
    handleUpdate,
    handleInitialState,
    updateHandler,
    showSelection,
  };
};
