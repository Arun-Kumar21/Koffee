import {  useEffect, useRef, useState } from "react";
import { Editor } from "@tiptap/react";
import { Bold, Code, Heading1, Heading2, Highlighter, Italic, Link, List, ListCheck, ListOrdered, Strikethrough, Underline } from "lucide-react";
import { CommandType } from "../types";
import { BubbleMenu } from "@tiptap/react";

export const CommandMenu = ({
  editor,
  keyDown,
}: {
  editor: Editor;
  keyDown: string;
}) => {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [filteredCommands, setFilteredCommands] = useState<CommandType[]>([]);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  const commands = [
    {
      name: "Heading",
      icon: <Heading1 size={18} />,
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
    },
    {
      name: "Heading 2",
      icon: <Heading2 size={18} />,
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    // add bullet list number list task list toggle list block quote code blocl
      {
        name: "Bullet List",
        icon : <List size={18} />,
        action : () => editor.chain().focus().toggleBulletList().run()
      },
      {
        name: "Number List",
        icon : <ListOrdered size={18} />,
        action : () => editor.chain().focus().toggleOrderedList().run()
      },
      {
        name: "Code Block",
        icon : <Code size={18} />,
        action : () => editor.chain().focus().toggleCodeBlock().run()
      }   

    // Add more commands as needed
  ];
  
  const menuRef = useRef(null);

  useEffect(() => {
    if (keyDown === "/") {
      setMenuOpen(true);
      setQuery("/");
    } else if (isMenuOpen) {
      if (keyDown === "Escape") {
        setMenuOpen(false);
        setQuery("");
      } else if (keyDown.length === 1) {
        setQuery((prev) => prev + keyDown);
      }
    }
  }, [keyDown]);

  useEffect(() => {
    if (query.startsWith("/")) {
      const search = query.slice(1).toLowerCase();
      const matches = commands.filter((command) =>
        command.name.toLowerCase().includes(search)
      );
      setFilteredCommands(matches);

      // Calculate menu position
      const { from } = editor.state.selection;
      const coords = editor.view.coordsAtPos(from);

      setMenuPosition({
        top: coords.top + window.scrollY + 25,
        left: coords.left + window.scrollX,
      });
    } else {
      setFilteredCommands([]);
    }
  }, [query]);

  const handleCommandSelect = (command: CommandType) => {
    const transaction = editor.state.tr;

    const { from, to } = editor.state.selection;

    if (query.startsWith("/")) {
      const slashPosition = from - query.length;
      transaction.delete(slashPosition, from);
    }

    editor.view.dispatch(transaction);

    command.action();

    setMenuOpen(false);
    setQuery("");
  };

  return (
    <div>
      {isMenuOpen && (
        <div
          ref={menuRef}
          className="shadow-md min-h-8 rounded-md w-44 absolute bg-white z-10 border"
          style={{
            position: "absolute",
            top: `${menuPosition.top}px`,
            left: `${menuPosition.left}px`,
          }}
        >
          {filteredCommands.map((command, index) => (
            <div
              key={index}
              className={`command-item hover:bg-neutral-100 px-4 py-1 cursor-pointer flex items-center gap-x-4 border-b border-neutral-200`}
              onClick={() => handleCommandSelect(command)}
            >
              {command.icon}
              {command.name}
            </div>
          ))}

          {filteredCommands.length === 0 && (
            <div className="px-4 py-1 text-neutral-500">No commands found</div>
          )}
        </div>
      )}

    </div>
  );
};

export const SelectMenu = ({
  editor,
  keyDown,
  showSelection
}: {
  editor: Editor;
  keyDown: string;
  showSelection: boolean; 
})=> {
  console.log("showSelection", showSelection)
  const selectMenu = [
    {
      name: "Bold",
      icon: <Bold className="hover:p-0.5" size={18} />,
      action: () => editor.chain().focus().toggleBold().run(),
    },
    {
      name: "Italic",
      icon: <Italic className="hover:p-0.5" size={18} />,
      action: () => editor.chain().focus().toggleItalic().run(),
    },
    {
      name: "Strike",
      icon : <Strikethrough className="hover:p-0.5" size={18} />,
      action : () => editor.chain().focus().toggleStrike().run()
    }, 
    // add underline , link , highlight
    {
      name: "Underline",
      icon : <Underline className="hover:p-0.5" size={18} />,
      action : () => editor.chain().focus().toggleUnderline().run()
    },
    {
      name: "Link",
      icon : <Link className="hover:p-0.5" size={18} />,
      action : () => {
        const href = prompt("Enter the URL");
        console.log("href", href)
        if (href) {
          editor.chain().focus().extendMarkRange('link').setLink({ href, target: '_blank' }).run();
        }
      }
    },
    {
      name: "Highlight",
      icon : <Highlighter className="hover:p-0.5" size={18} />,
      action : () => editor.chain().focus().toggleHighlight({color : "yellow"}).run()
    }
  ]
  return (
    <div>
      <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }} >
        <div className="bg-white border border-gray-200 rounded-lg shadow-md flex gap-x-1 p-2">
        {showSelection && selectMenu.map((command, index) => (
          <div
          className="bg-transparent hover:bg-gray-300 cursor-pointer active:bg-purple-600  hover:active:bg-purple-700"
            key={index}
            onClick={() => command.action()}
          >
            {command.icon}
          </div>
        ))}
        </div>
        
        </BubbleMenu>

    </div>
  )

}