import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/common/context/Auth.context';
import { socket } from '@/common/lib/socket';

interface ReactionsProps {
  roomId: string;
}

const REACTION_EMOJIS = [
  { emoji: '❤️', label: 'Love' },
  { emoji: '😂', label: 'Laugh' },
  { emoji: '👍', label: 'Like' },
  { emoji: '👏', label: 'Clap' },
  { emoji: '🎉', label: 'Celebrate' },
  { emoji: '🔥', label: 'Fire' },
  { emoji: '😮', label: 'Wow' },
  { emoji: '😍', label: 'Heart Eyes' }
];

const Reactions = ({ roomId }: ReactionsProps) => {
  const { user } = useAuth();
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [pickerPosition, setPickerPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Listen for reactions from other users
    socket.on('reaction_received', (reaction: Reaction) => {
      setReactions(prev => [...prev, reaction]);
      
      // Remove reaction after animation completes
      setTimeout(() => {
        setReactions(prev => prev.filter(r => r.id !== reaction.id));
      }, 3000);
    });

    return () => {
      socket.off('reaction_received');
    };
  }, []);

  const sendReaction = (emoji: string, event: React.MouseEvent) => {
    if (!user) return;

    // Position reactions to float from middle bottom of the page
    const reaction: Reaction = {
      id: `${Date.now()}-${Math.random()}`,
      emoji,
      user: {
        name: user.name,
        image: user.image
      },
      x: window.innerWidth / 2,
      y: window.innerHeight - 120, // Bottom of the page
      timestamp: Date.now()
    };

    // Add to local state immediately
    setReactions(prev => [...prev, reaction]);
    
    // Send to other users
    socket.emit('send_reaction', reaction);
    
    // Remove after animation
    setTimeout(() => {
      setReactions(prev => prev.filter(r => r.id !== reaction.id));
    }, 3000);

    setShowReactionPicker(false);
  };

  const handleReactionButtonClick = (event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const isMobile = window.innerWidth < 640; // sm breakpoint
    
    setPickerPosition({
      x: isMobile ? Math.max(10, Math.min(rect.left - 100, window.innerWidth - 220)) : rect.left - 150,
      y: isMobile ? rect.bottom + 10 : rect.top + 50
    });
    setShowReactionPicker(!showReactionPicker);
  };

  return (
    <>
      {/* Reaction Button - For use in header */}
      <button
        onClick={handleReactionButtonClick}
        className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 bg-yellow-500 hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700 text-white rounded-full shadow-lg transition-all duration-200 transform hover:scale-110"
        title="React"
      >
        <span className="text-xs sm:text-sm">😊</span>
      </button>

      {/* Reaction Picker */}
      <AnimatePresence>
        {showReactionPicker && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowReactionPicker(false)}
            />
            
            {/* Picker */}
            <motion.div
              className="fixed z-50 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-2 sm:p-3"
              style={{
                left: `${pickerPosition.x}px`,
                top: `${pickerPosition.y}px`,
              }}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="grid grid-cols-4 gap-1 sm:gap-2">
                {REACTION_EMOJIS.map(({ emoji, label }) => (
                  <button
                    key={emoji}
                    onClick={(e) => sendReaction(emoji, e)}
                    className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 text-xl sm:text-2xl"
                    title={label}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Floating Reactions - Fixed to page, not relative to component */}
      <div className="fixed inset-0 pointer-events-none z-30">
        <AnimatePresence>
          {reactions.map((reaction) => (
            <motion.div
              key={reaction.id}
              className="absolute flex flex-col items-center"
              style={{
                left: reaction.x,
                top: reaction.y,
              }}
              initial={{ opacity: 0, y: 0, scale: 0.5 }}
              animate={{ 
                opacity: [0, 1, 1, 0],
                y: -150, // Float higher for better visibility
                scale: [0.5, 1.2, 1, 0.8],
              }}
              exit={{ opacity: 0 }}
              transition={{ 
                duration: 3,
                times: [0, 0.1, 0.8, 1],
                ease: "easeOut"
              }}
            >
              {/* Emoji */}
              <div className="text-3xl sm:text-4xl mb-1 drop-shadow-lg">
                {reaction.emoji}
              </div>
              
              {/* User Info */}
              <div className="flex items-center bg-black/70 text-white px-2 py-1 rounded-full text-xs whitespace-nowrap">
                {reaction.user.image && (
                  <img
                    src={reaction.user.image}
                    alt={reaction.user.name}
                    className="w-3 h-3 sm:w-4 sm:h-4 rounded-full mr-1"
                  />
                )}
                <span className="text-xs">{reaction.user.name}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
};

export default Reactions;
