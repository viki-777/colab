import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";

import { getNextColor } from "@/common/lib/getNextColor";

import { DEFAULT_ROOM, roomAtom } from "./room.atom";

export const useRoom = () => {
  const room = useRecoilValue(roomAtom);

  return room;
};

export const useSetRoom = () => {
  const setRoom = useSetRecoilState(roomAtom);

  return setRoom;
};

export const useSetRoomId = () => {
  const setRoomId = useSetRecoilState(roomAtom);

  const handleSetRoomId = (id: string) => {
    setRoomId({ ...DEFAULT_ROOM, id });
  };

  return handleSetRoomId;
};

export const useSetUsers = () => {
  const setRoom = useSetRecoilState(roomAtom);

  const handleAddUser = (userId: string, user: AuthenticatedUser | string) => {
    setRoom((prev) => {
      const newUsers = prev.users;
      const newUsersMoves = prev.usersMoves;

      const color = getNextColor([...newUsers.values()].pop()?.color);

      // Handle both string (legacy) and AuthenticatedUser object
      const userName = typeof user === 'string' ? user : user.name;
      const userEmail = typeof user === 'string' ? undefined : user.email;
      const userImage = typeof user === 'string' ? undefined : user.image;
      const userIdValue = typeof user === 'string' ? userId : user.id;

      newUsers.set(userId, {
        name: userName,
        color,
        id: userIdValue,
        email: userEmail,
        image: userImage,
      });
      newUsersMoves.set(userId, []);

      return { ...prev, users: newUsers, usersMoves: newUsersMoves };
    });
  };

  const handleRemoveUser = (userId: string) => {
    setRoom((prev) => {
      const newUsers = prev.users;
      const newUsersMoves = prev.usersMoves;

      const userMoves = newUsersMoves.get(userId);

      newUsers.delete(userId);
      newUsersMoves.delete(userId);
      return {
        ...prev,
        users: newUsers,
        usersMoves: newUsersMoves,
        movesWithoutUser: [...prev.movesWithoutUser, ...(userMoves || [])],
      };
    });
  };

  const handleAddMoveToUser = (userId: string, moves: Move) => {
    setRoom((prev) => {
      const newUsersMoves = prev.usersMoves;
      const oldMoves = prev.usersMoves.get(userId);

      newUsersMoves.set(userId, [...(oldMoves || []), moves]);
      return { ...prev, usersMoves: newUsersMoves };
    });
  };

  const handleRemoveMoveFromUser = (userId: string) => {
    setRoom((prev) => {
      const newUsersMoves = prev.usersMoves;
      const oldMoves = prev.usersMoves.get(userId);
      oldMoves?.pop();

      newUsersMoves.set(userId, oldMoves || []);
      return { ...prev, usersMoves: newUsersMoves };
    });
  };

  const handleRemoveMoveById = (moveId: string) => {
    setRoom((prev) => {
      const newUsersMoves = new Map(prev.usersMoves);
      
      // Remove from all users' moves
      newUsersMoves.forEach((moves, userId) => {
        const filteredMoves = moves.filter(move => move.id !== moveId);
        newUsersMoves.set(userId, filteredMoves);
      });

      // Remove from movesWithoutUser
      const filteredMovesWithoutUser = prev.movesWithoutUser.filter(move => move.id !== moveId);

      return { 
        ...prev, 
        usersMoves: newUsersMoves,
        movesWithoutUser: filteredMovesWithoutUser
      };
    });
  };

  return {
    handleAddUser,
    handleRemoveUser,
    handleAddMoveToUser,
    handleRemoveMoveFromUser,
    handleRemoveMoveById,
  };
};

export const useMyMoves = () => {
  const [room, setRoom] = useRecoilState(roomAtom);

  const handleAddMyMove = (move: Move) => {
    setRoom((prev) => {
      if (prev.myMoves[prev.myMoves.length - 1]?.options.mode === "select")
        return {
          ...prev,
          myMoves: [...prev.myMoves.slice(0, prev.myMoves.length - 1), move],
        };

      return { ...prev, myMoves: [...prev.myMoves, move] };
    });
  };

  const handleRemoveMyMove = () => {
    const newMoves = [...room.myMoves];
    const move = newMoves.pop();

    setRoom((prev) => ({ ...prev, myMoves: newMoves }));

    return move;
  };

  const handleRemoveMyMoveById = (moveId: string) => {
    setRoom((prev) => ({ 
      ...prev, 
      myMoves: prev.myMoves.filter(move => move.id !== moveId)
    }));
  };

  return { handleAddMyMove, handleRemoveMyMove, handleRemoveMyMoveById, myMoves: room.myMoves };
};
