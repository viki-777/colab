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

import BoardHeader from "./board/BoardHeader";


const Room = () => {
  const room = useRoom();

  if (!room.id) return <NameInput />;

  return (
    <RoomContextProvider>
      <div className="relative h-full w-full overflow-hidden bg-white dark:bg-gray-900">
        <BoardHeader roomId={room.id} />
        <div className="pt-16 h-full">
          
          <ToolBar />
          <SelectionBtns />
          <MoveImage />
          <Canvas />
          <MousePosition />
          <MousesRenderer />
          <Chat />
          
          
          
        </div>
      </div>
    </RoomContextProvider>
  );
};

export default Room;
