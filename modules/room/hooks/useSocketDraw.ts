import { useEffect } from "react";

import { socket } from "@/common/lib/socket";
import { useSetUsers, useMyMoves } from "@/common/recoil/room";
import { useSetSavedMoves } from "@/common/recoil/savedMoves";

export const useSocketDraw = (drawing: boolean, drawAllMoves: () => Promise<void>) => {
  const { handleAddMoveToUser, handleRemoveMoveFromUser, handleRemoveMoveById } = useSetUsers();
  const { handleRemoveMyMoveById } = useMyMoves();
  const { removeSavedMoveById, addSavedMove } = useSetSavedMoves();

  // Handle your own moves coming back from server
  useEffect(() => {
    socket.on("your_move", (move) => {
      console.log("Received your_move:", move.id);
      addSavedMove(move);
    });

    return () => {
      socket.off("your_move");
    };
  }, [addSavedMove]);

  useEffect(() => {
    let moveToDrawLater: Move | undefined;
    let userIdLater = "";

    socket.on("user_draw", (move, userId) => {
      console.log("Received user_draw:", move.id, "from user:", userId);
      addSavedMove(move); // Also add other users' moves to savedMoves for deletion
      
      if (!drawing) {
        handleAddMoveToUser(userId, move);
      } else {
        moveToDrawLater = move;
        userIdLater = userId;
      }
    });

    return () => {
      socket.off("user_draw");

      if (moveToDrawLater && userIdLater) {
        handleAddMoveToUser(userIdLater, moveToDrawLater);
      }
    };
  }, [drawing, handleAddMoveToUser, addSavedMove]);

  useEffect(() => {
    socket.on("user_undo", (userId) => {
      handleRemoveMoveFromUser(userId);
    });

    return () => {
      socket.off("user_undo");
    };
  }, [handleRemoveMoveFromUser]);

  useEffect(() => {
    socket.on("stroke_deleted", (moveId) => {
      console.log("🗑️ Received stroke_deleted event for move:", moveId);
      // Remove move from all state locations
      removeSavedMoveById(moveId);
      handleRemoveMoveById(moveId);
      handleRemoveMyMoveById(moveId);
      console.log("✅ Move removed from all state locations");
      
      // Redraw the canvas to visually remove the stroke
      drawAllMoves().then(() => {
        console.log("🎨 Canvas redrawn after stroke deletion");
      });
    });

    return () => {
      socket.off("stroke_deleted");
    };
  }, [removeSavedMoveById, handleRemoveMoveById, handleRemoveMyMoveById, drawAllMoves]);
};
