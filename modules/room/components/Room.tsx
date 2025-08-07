import { useRoom } from "@/common/recoil/room";

import RoomContextProvider from "../context/Room.context";
import Canvas from "./board/Canvas";
import MousePosition from "./board/MousePosition";
import MousesRenderer from "./board/MousesRenderer";
import MoveImage from "./board/MoveImage";
import SelectionBtns from "./board/SelectionBtns";
import Chat from "./chat/Chat";
import NameInput from "./NameInput";
import ToolBar from "./toolbar/ToolBar";
import UserList from "./UserList";
import NotesPanel from "../../notes/components/NotesPanel";
import BoardHeader from "./board/BoardHeader";
import Reactions from "./board/Reactions";

const Room = () => {
  const room = useRoom();

  if (!room.id) return <NameInput />;

  return (
    <RoomContextProvider>
      <div className="relative h-full w-full overflow-hidden bg-white dark:bg-gray-900">
        <BoardHeader roomId={room.id} />
        <div className="pt-16 h-full">
          <UserList />
          <ToolBar />
          <SelectionBtns />
          <MoveImage />
          <Canvas />
          <MousePosition />
          <MousesRenderer />
          <Chat />
          
          
          <NotesPanel roomId={room.id} />
        </div>
      </div>
    </RoomContextProvider>
  );
};

export default Room;
