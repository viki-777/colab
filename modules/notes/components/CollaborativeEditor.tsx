import { useState, useEffect, useRef, useCallback } from 'react';
import { socket } from '@/common/lib/socket';
import { useRoom } from '@/common/recoil/room';

interface TextOperation {
  type: 'insert' | 'delete' | 'retain';
  position: number;
  content?: string;
  length?: number;
  userId: string;
  timestamp: number;
  id: string;
}

interface CursorPosition {
  userId: string;
  position: number;
  color: string;
  username: string;
}

const CollaborativeEditor = ({ documentId }: { documentId: string }) => {
  const { users } = useRoom();
  const [content, setContent] = useState('');
  const [cursors, setCursors] = useState<CursorPosition[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lastOperationRef = useRef<number>(0);

  // Debounce for sending operations
  const sendOperationDebounced = useCallback(
    debounce((operation: Omit<TextOperation, 'userId' | 'timestamp' | 'id'>) => {
      const fullOperation: TextOperation = {
        ...operation,
        userId: socket.id || '',
        timestamp: Date.now(),
        id: Math.random().toString(36).substring(7),
      };
      
      socket.emit('text_operation', documentId, fullOperation);
    }, 100),
    [documentId]
  );

  const applyOperation = (operation: TextOperation, currentContent: string): string => {
    const { type, position, content: opContent, length } = operation;
    
    switch (type) {
      case 'insert':
        return currentContent.slice(0, position) + (opContent || '') + currentContent.slice(position);
      case 'delete':
        return currentContent.slice(0, position) + currentContent.slice(position + (length || 0));
      case 'retain':
        return currentContent;
      default:
        return currentContent;
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    const cursorPosition = e.target.selectionStart;
    
    // Calculate the operation
    const oldContent = content;
    const operation = calculateOperation(oldContent, newContent, cursorPosition);
    
    if (operation) {
      setContent(newContent);
      sendOperationDebounced(operation);
      
      // Send cursor position
      socket.emit('cursor_position', documentId, {
        userId: socket.id,
        position: cursorPosition,
        color: users.get(socket.id || '')?.color || '#000',
        username: users.get(socket.id || '')?.name || 'Anonymous',
      });
    }
  };

  const calculateOperation = (
    oldText: string, 
    newText: string, 
    cursorPos: number
  ): Omit<TextOperation, 'userId' | 'timestamp' | 'id'> | null => {
    // Simple diff algorithm
    if (newText.length > oldText.length) {
      // Text was inserted
      const insertPos = findInsertPosition(oldText, newText);
      const insertedText = newText.slice(insertPos, insertPos + (newText.length - oldText.length));
      
      return {
        type: 'insert',
        position: insertPos,
        content: insertedText,
      };
    } else if (newText.length < oldText.length) {
      // Text was deleted
      const deletePos = findDeletePosition(oldText, newText);
      const deleteLength = oldText.length - newText.length;
      
      return {
        type: 'delete',
        position: deletePos,
        length: deleteLength,
      };
    }
    
    return null;
  };

  const findInsertPosition = (oldText: string, newText: string): number => {
    for (let i = 0; i < Math.min(oldText.length, newText.length); i++) {
      if (oldText[i] !== newText[i]) {
        return i;
      }
    }
    return oldText.length;
  };

  const findDeletePosition = (oldText: string, newText: string): number => {
    for (let i = 0; i < Math.min(oldText.length, newText.length); i++) {
      if (oldText[i] !== newText[i]) {
        return i;
      }
    }
    return newText.length;
  };

  useEffect(() => {
    // Join document room
    socket.emit('join_document', documentId);

    // Listen for text operations from other users
    const handleTextOperation = (documentId: string, operation: TextOperation) => {
      if (operation.userId !== socket.id && documentId === documentId) {
        setContent(currentContent => applyOperation(operation, currentContent));
      }
    };

    // Listen for cursor positions
    const handleCursorPosition = (docId: string, cursor: CursorPosition) => {
      if (cursor.userId !== socket.id && docId === documentId) {
        setCursors(prevCursors => {
          const filtered = prevCursors.filter(c => c.userId !== cursor.userId);
          return [...filtered, cursor];
        });
        
        // Remove cursor after 3 seconds of inactivity
        setTimeout(() => {
          setCursors(prevCursors => 
            prevCursors.filter(c => c.userId !== cursor.userId)
          );
        }, 3000);
      }
    };

    // Listen for document content
    const handleDocumentContent = (docId: string, documentContent: string) => {
      if (docId === documentId) {
        setContent(documentContent);
      }
    };

    socket.on('text_operation', handleTextOperation);
    socket.on('cursor_position', handleCursorPosition);
    socket.on('document_content', handleDocumentContent);

    return () => {
      socket.off('text_operation', handleTextOperation);
      socket.off('cursor_position', handleCursorPosition);
      socket.off('document_content', handleDocumentContent);
      socket.emit('leave_document', documentId);
    };
  }, [documentId]);

  return (
    <div className="relative h-full w-full">
      <div className="mb-2 flex items-center gap-2">
        <h4 className="text-sm font-medium">Live Editing</h4>
        <div className="flex gap-1">
          {cursors.map(cursor => (
            <div
              key={cursor.userId}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs text-white"
              style={{ backgroundColor: cursor.color }}
            >
              {cursor.username.charAt(0)}
            </div>
          ))}
        </div>
        {users.size > 1 && (
          <span className="text-xs text-gray-500">
            👥 {users.size} editing
          </span>
        )}
      </div>
      
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleTextChange}
          className="w-full h-64 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          placeholder="Start typing your collaborative notes here..."
          style={{ fontFamily: 'system-ui, sans-serif', lineHeight: '1.4' }}
        />
        
        {/* Render cursor indicators */}
        {cursors.map(cursor => (
          <div
            key={cursor.userId}
            className="absolute pointer-events-none"
            style={{
              left: `${Math.min(calculateCursorPosition(cursor.position), 380)}px`,
              top: '20px',
              width: '2px',
              height: '20px',
              backgroundColor: cursor.color,
              zIndex: 10,
            }}
          >
            <div
              className="absolute -top-6 left-0 px-1 py-0.5 rounded text-xs text-white whitespace-nowrap"
              style={{ backgroundColor: cursor.color }}
            >
              {cursor.username}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Simple cursor position calculation (approximate)
const calculateCursorPosition = (position: number): number => {
  return position * 8; // Approximate character width
};

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export default CollaborativeEditor;
