import { extensions } from '../components/editor/EditorExtensions';
import { EditorContent, useEditor } from '@tiptap/react';
import { ChannelPageProps } from '../type/interface';
import MenuBar from '../components/editor/MenuBar';
import { useState, useEffect, useCallback } from 'react';
import { socket } from './socket';
import debounce from 'lodash.debounce'; // Import debounce function from lodash

const Editor: React.FC<ChannelPageProps> = ({ channelId }) => {
  const [content, setContent] = useState('');
  const editor = useEditor({
    extensions,
    content: content,
    onUpdate: ({ editor }) => {
      const currentContent = editor.getHTML();
      setContent(currentContent); // Update content state with the current editor content
      console.log('Editor content:', currentContent); // Debug log to check content
    },
  });

  // Debounced version of socket emission
  const emitContent = useCallback(
    debounce((content) => {
      socket.emit('send-content', { channelId, content });
    }, 500), // Adjust debounce time (500ms delay)
    [channelId]
  );

  useEffect(() => {
    if (!channelId) return;

    socket.emit('join-channel', channelId); // Join the specific channel using channelId

    socket.once('load-content', (loadedContent) => {
      if (editor) {
        editor.commands.setContent(loadedContent); // Load the initial content
        setContent(loadedContent); // Update state
      }
    });

    socket.emit('get-content', channelId); // Request initial content for the channel

    return () => {
      socket.emit('leave-channel', channelId); // Leave the channel when the component unmounts
    };
  }, [editor, channelId]);

  // Emit content changes to the socket
  useEffect(() => {
    if (content) {
      emitContent(content); // Debounced emission
    }
  }, [content, emitContent]);

  // Listen for incoming content updates
  useEffect(() => {
    socket.on('receive-content', ({ channelId: incomingChannelId, content: newContent }) => {
      if (incomingChannelId === channelId && editor) {
        console.log('Received content:', newContent); // Log the received content
        editor.commands.setContent(newContent); // Set new content directly in the editor
        setContent(newContent); // Update the state with the received content
      }
    });

    return () => {
      socket.off('receive-content'); // Clean up event listener
    };
  }, [editor, channelId]);


  return <>
    <MenuBar editor={editor} />
  <EditorContent editor={editor} />
  </>
};

export default Editor;
