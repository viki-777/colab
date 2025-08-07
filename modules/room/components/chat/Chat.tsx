import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { BsFillChatFill } from "react-icons/bs";
import { FaChevronDown } from "react-icons/fa";
import { useList } from "react-use";
import { DEFAULT_EASE } from "@/common/constants/easings";
import { socket } from "@/common/lib/socket";
import { useRoom } from "@/common/recoil/room";
import ChatInput from "./ChatInput";
import Message from "./Message";

// Define the Message type if it's not already
type Message = {
  id: number;
  userId: string;
  username: string;
  msg: string;
  color: string;
};

const Chat = () => {
  const room = useRoom();
  const msgList = useRef<HTMLDivElement>(null);
  const [newMsg, setNewMsg] = useState(false);
  const [opened, setOpened] = useState(false);
  const [msgs, handleMsgs] = useList<Message>([]);

  useEffect(() => {
    const handleNewMsg = (userId: string, msg: string) => {
      const user = room.users.get(userId);
      handleMsgs.push({
        userId,
        msg,
        id: msgs.length + 1,
        username: user?.name || "Anonymous",
        color: user?.color || "#9CA3AF", // Default to a neutral gray
      });
      msgList.current?.scroll({ top: msgList.current?.scrollHeight });
      if (!opened) setNewMsg(true);
    };

    socket.on("new_msg", handleNewMsg);
    return () => {
      socket.off("new_msg", handleNewMsg);
    };
  }, [handleMsgs, msgs, opened, room.users]);

  return (
    <motion.div
      className="absolute bottom-0 z-50 flex h-[280px] sm:h-[300px] w-full sm:w-[28rem] flex-col overflow-hidden rounded-t-lg sm:left-4 lg:left-36 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-2xl border border-gray-200/50 dark:border-gray-700/50"
      animate={{ y: opened ? 0 : 240 }}
      transition={{ ease: DEFAULT_EASE, duration: 0.3 }}
    >
      <button
        className="flex w-full cursor-pointer items-center justify-between bg-gray-100/80 dark:bg-gray-900/80 py-3 px-4 sm:px-6 font-semibold text-gray-800 dark:text-gray-200 text-sm sm:text-base focus:outline-none"
        onClick={() => {
          setOpened((prev) => !prev);
          setNewMsg(false);
        }}
      >
        <div className="flex items-center gap-3">
          <BsFillChatFill className="mt-[-2px] text-gray-600 dark:text-gray-400" />
          <span>Chat</span>
          {newMsg && (
            <span className="rounded-md bg-green-200 text-green-800 dark:bg-green-800/50 dark:text-green-200 px-2 py-0.5 text-xs font-bold">
              New
            </span>
          )}
        </div>
        <motion.div
          animate={{ rotate: opened ? 0 : 180 }}
          transition={{ ease: DEFAULT_EASE, duration: 0.2 }}
        >
          <FaChevronDown />
        </motion.div>
      </button>
      <div className="flex flex-1 flex-col justify-between p-3">
        <div className="h-[165px] sm:h-[185px] overflow-y-scroll pr-1 sm:pr-2" ref={msgList}>
          {msgs.map((msg) => (
            <Message key={msg.id} {...msg} />
          ))}
        </div>
        <ChatInput />
      </div>
    </motion.div>
  );
};

export default Chat;