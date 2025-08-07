import { FormEvent, useState } from "react";
import { AiOutlineSend } from "react-icons/ai";
import { socket } from "@/common/lib/socket";

const ChatInput = () => {
  const [msg, setMsg] = useState("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Prevent sending empty messages
    if (!msg.trim()) return;

    socket.emit("send_msg", msg);
    setMsg("");
  };

  return (
    <form className="flex w-full items-center gap-2" onSubmit={handleSubmit}>
      <input
        value={msg}
        onChange={(e) => setMsg(e.target.value)}
        placeholder="Type your message..."
        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 px-4 py-2 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
      />
      <button
        type="submit"
        disabled={!msg.trim()}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <AiOutlineSend size={20} />
      </button>
    </form>
  );
};

export default ChatInput;