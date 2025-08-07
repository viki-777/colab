import { socket } from "@/common/lib/socket";
import { useRoom } from "@/common/recoil/room";

const Message = ({ userId, msg, username, color }: Message) => {
  const me = socket.id === userId;
  const { users } = useRoom();
  const user = users.get(userId);

  return (
    <div
      className={`my-3 flex gap-3 text-clip ${me ? "justify-end flex-row-reverse" : ""}`}
    >
      <div className="flex-shrink-0">
        {user?.image ? (
          <img
            src={user.image}
            alt={user.name}
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <div 
            className="h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-semibold"
            style={{ backgroundColor: color }}
          >
            {username?.split("")[0]?.toUpperCase() || "A"}
          </div>
        )}
      </div>
      
      <div className={`flex flex-col ${me ? "items-end" : "items-start"}`}>
        <div className="flex items-center gap-2 mb-1">
          <h5 style={{ color }} className="font-bold text-sm">
            {me ? "You" : username}
          </h5>
        </div>
        <div 
          className={`px-3 py-2 rounded-lg max-w-xs break-words ${
            me 
              ? "bg-blue-500 text-white rounded-br-sm" 
              : "bg-gray-200 text-gray-900 rounded-bl-sm"
          }`}
        >
          <p>{msg}</p>
        </div>
      </div>
    </div>
  );
};

export default Message;
