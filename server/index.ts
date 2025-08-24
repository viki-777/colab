import { createServer } from "http";
import path from "path";

import {} from "@/common/types/global";

import express from "express";
import next, { NextApiHandler } from "next";
import { Server } from "socket.io";
import { v4 } from "uuid";

// TODO: Re-enable when Prisma types are fixed
// import { PrismaClient } from "@prisma/client";
// const prisma = new PrismaClient();

const port = parseInt(process.env.PORT || "3000", 10);
const dev = process.env.NODE_ENV !== "production";
const nextApp = next({ dev });
const nextHandler: NextApiHandler = nextApp.getRequestHandler();

nextApp.prepare().then(async () => {
  const app = express();
  const server = createServer(app);

  const io = new Server<ClientToServerEvents, ServerToClientEvents>(server);

  app.get("/health", async (_, res) => {
    res.send("Healthy");
  });

  const rooms = new Map<string, Room>();

  // Track user sockets per room to handle multiple tabs
  const userSocketsInRoom = new Map<string, Map<string, Set<string>>>();

  // Helper to get unique users in a room
  const getUniqueUsersInRoom = (roomId: string) => {
    const room = rooms.get(roomId);
    if (!room) return new Map();

    const uniqueUsers = new Map<string, AuthenticatedUser>();
    room.users.forEach((user) => {
      uniqueUsers.set(user.id, user);
    });
    return uniqueUsers;
  };

  // Helper to check if user has other tabs open in the room
  const userHasOtherTabsInRoom = (roomId: string, userId: string, currentSocketId: string): boolean => {
    const roomUserSockets = userSocketsInRoom.get(roomId);
    if (!roomUserSockets) return false;
    
    const userSockets = roomUserSockets.get(userId);
    if (!userSockets) return false;
    
    // Check if user has other sockets besides the current one
    const otherSockets = new Set(userSockets);
    otherSockets.delete(currentSocketId);
    return otherSockets.size > 0;
  };

  // Helper to add user socket tracking
  const addUserSocketToRoom = (roomId: string, userId: string, socketId: string) => {
    if (!userSocketsInRoom.has(roomId)) {
      userSocketsInRoom.set(roomId, new Map());
    }
    const roomUserSockets = userSocketsInRoom.get(roomId)!;
    
    if (!roomUserSockets.has(userId)) {
      roomUserSockets.set(userId, new Set());
    }
    roomUserSockets.get(userId)!.add(socketId);
  };

  // Helper to remove user socket tracking
  const removeUserSocketFromRoom = (roomId: string, userId: string, socketId: string) => {
    const roomUserSockets = userSocketsInRoom.get(roomId);
    if (!roomUserSockets) return false;
    
    const userSockets = roomUserSockets.get(userId);
    if (!userSockets) return false;
    
    userSockets.delete(socketId);
    
    // If no more sockets for this user, remove user entry
    if (userSockets.size === 0) {
      roomUserSockets.delete(userId);
      return true; // User completely left
    }
    
    // If no more users in room, remove room entry
    if (roomUserSockets.size === 0) {
      userSocketsInRoom.delete(roomId);
    }
    
    return false; // User still has other tabs open
  };

  // TODO: Add persistence back once Prisma types are resolved
  // Save room data to database
  const saveRoomData = async (roomId: string) => {
    // Temporarily disabled due to Prisma types issue
  };

  // Load room data from database
  const loadRoomData = async (roomId: string): Promise<Move[]> => {
    // Temporarily disabled due to Prisma types issue
    return [];
  };

  // Auto-save room data every 30 seconds (disabled for now)
  // const autoSaveInterval = setInterval(() => {
  //   rooms.forEach((_, roomId) => {
  //     saveRoomData(roomId);
  //   });
  // }, 30000);

  const addMove = (roomId: string, socketId: string, move: Move) => {
    const room = rooms.get(roomId);
    if (!room) return;

    if (!room.users.has(socketId)) {
      room.usersMoves.set(socketId, [move]);
    }

    room.usersMoves.get(socketId)!.push(move);
  };

  const undoMove = (roomId: string, socketId: string) => {
    const room = rooms.get(roomId);
    if (!room) return;

    room.usersMoves.get(socketId)!.pop();
  };

  io.on("connection", (socket) => {
    const getRoomId = () => {
      const joinedRoom = [...socket.rooms].find((room) => room !== socket.id);

      if (!joinedRoom) return socket.id;

      return joinedRoom;
    };

    const leaveRoom = async (roomId: string, socketId: string) => {
      const room = rooms.get(roomId);
      if (!room) return;

      const user = room.users.get(socketId);
      if (!user) return;

      const userMoves = room.usersMoves.get(socketId);
      if (userMoves) room.drawed.push(...userMoves);
      
      // Remove this socket's moves and user entry
      room.usersMoves.delete(socketId);
      room.users.delete(socketId);

      // Check if user completely left the room (no other tabs)
      const userCompletelyLeft = removeUserSocketFromRoom(roomId, user.id, socketId);
      
      if (userCompletelyLeft) {
        // Only notify other users when the user completely leaves (all tabs closed)
        socket.broadcast.to(roomId).emit("user_disconnected", user.id);
      } else {
      }

      // TODO: Save room data when user leaves (disabled due to Prisma types issue)
      // await saveRoomData(roomId);

      socket.leave(roomId);
    };

    socket.on("create_room", async (user: AuthenticatedUser) => {
      let roomId: string;
      do {
        roomId = Math.random().toString(36).substring(2, 6);
      } while (rooms.has(roomId));

      socket.join(roomId);

      // Create room in memory
      rooms.set(roomId, {
        usersMoves: new Map([[socket.id, []]]),
        drawed: [],
        users: new Map([[socket.id, user]]),
      });

      // Track user socket for deduplication
      addUserSocketToRoom(roomId, user.id, socket.id);

      // TODO: Create board in database for persistence (disabled due to Prisma types issue)

      io.to(socket.id).emit("created", roomId);
    });

    socket.on("check_room", (roomId) => {
      // Always return true for now - room will be created if it doesn't exist
      // This allows database-created rooms to be accessible
      socket.emit("room_exists", true);
    });

    socket.on("join_room", async (roomId, user: AuthenticatedUser) => {
      let room = rooms.get(roomId);

      // If room doesn't exist, create it (for database-created boards)
      if (!room) {
        // TODO: Load saved room data from database (disabled due to Prisma types issue)
        const savedMoves: Move[] = []; // await loadRoomData(roomId);
        
        room = {
          usersMoves: new Map(),
          drawed: savedMoves, // Load previously saved moves (empty for now)
          users: new Map(),
        };
        rooms.set(roomId, room);
      }

      if (room.users.size < 12) {
        socket.join(roomId);

        // Check if this user is already in the room (from another tab)
        const isUserAlreadyInRoom = Array.from(room.users.values()).some(u => u.id === user.id);

        room.users.set(socket.id, user);
        room.usersMoves.set(socket.id, []);

        // Track user socket for deduplication
        addUserSocketToRoom(roomId, user.id, socket.id);

        if (isUserAlreadyInRoom) {
        } else {
        }

        io.to(socket.id).emit("joined", roomId);
      } else io.to(socket.id).emit("joined", "", true);
    });

    socket.on("joined_room", () => {
      const roomId = getRoomId();

      const room = rooms.get(roomId);
      if (!room) return;

      // Get unique users instead of all socket connections
      const uniqueUsers = getUniqueUsersInRoom(roomId);
      const currentUser = room.users.get(socket.id);

      io.to(socket.id).emit(
        "room",
        room,
        JSON.stringify([...room.usersMoves]),
        JSON.stringify([...uniqueUsers]) // Send unique users only
      );

      // Only notify others if this is the user's first tab in the room
      if (currentUser) {
        const isFirstTab = !userHasOtherTabsInRoom(roomId, currentUser.id, socket.id);
        if (isFirstTab) {
          socket.broadcast
            .to(roomId)
            .emit("new_user", currentUser.id, currentUser);
        }
      }
    });

    socket.on("leave_room", async () => {
      const roomId = getRoomId();
      await leaveRoom(roomId, socket.id);
      // Note: user_disconnected event is now emitted from within leaveRoom when user completely leaves
    });

    socket.on("draw", async (move) => {
      const roomId = getRoomId();

      const timestamp = Date.now();

      // eslint-disable-next-line no-param-reassign
      move.id = v4();

      addMove(roomId, socket.id, { ...move, timestamp });

      io.to(socket.id).emit("your_move", { ...move, timestamp });

      socket.broadcast
        .to(roomId)
        .emit("user_draw", { ...move, timestamp }, socket.id);

      // TODO: Auto-save after every 10 moves (disabled due to Prisma types issue)
      // const room = rooms.get(roomId);
      // if (room) {
      //   const totalMoves = room.drawed.length + 
      //     Array.from(room.usersMoves.values()).reduce((sum, moves) => sum + moves.length, 0);
      //   
      //   if (totalMoves % 10 === 0) {
      //     await saveRoomData(roomId);
      //   }
      // }
    });

    socket.on("delete_stroke", (moveId) => {
      const roomId = getRoomId();
      const room = rooms.get(roomId);
      if (!room) {
        return;
      }

      // Remove the move from drawed moves
      const moveIndex = room.drawed.findIndex(move => move.id === moveId);
      if (moveIndex !== -1) {
        room.drawed.splice(moveIndex, 1);
      } else {
        // Check in users' current moves
        let found = false;
        room.usersMoves.forEach((moves, socketId) => {
          const userMoveIndex = moves.findIndex(move => move.id === moveId);
          if (userMoveIndex !== -1) {
            moves.splice(userMoveIndex, 1);
            found = true;
          }
        });
        if (!found) {
        }
      }

      // Broadcast stroke deletion to all clients in the room
      io.to(roomId).emit("stroke_deleted", moveId);
    });

    socket.on("undo", () => {
      const roomId = getRoomId();

      undoMove(roomId, socket.id);

      socket.broadcast.to(roomId).emit("user_undo", socket.id);
    });

    socket.on("mouse_move", (x, y) => {
      socket.broadcast.to(getRoomId()).emit("mouse_moved", x, y, socket.id);
    });

    socket.on("send_msg", (msg) => {
      const roomId = getRoomId();
      const room = rooms.get(roomId);
      const currentUser = room?.users.get(socket.id);
      
      if (currentUser) {
        // Send message with user ID instead of socket ID to prevent duplicate messages
        io.to(roomId).emit("new_msg", currentUser.id, msg);
      }
    });

    socket.on("send_reaction", (reaction) => {
      const roomId = getRoomId();
      // Broadcast reaction to all other users in the room
      socket.broadcast.to(roomId).emit("reaction_received", reaction);
    });

    socket.on("disconnecting", async () => {
      const roomId = getRoomId();
      await leaveRoom(roomId, socket.id);
      // Note: user_disconnected event is now emitted from within leaveRoom when user completely leaves
    });
  });

  app.all("*", (req: any, res: any) => nextHandler(req, res));

  server.listen(port, () => {
    // eslint-disable-next-line no-console
  });
});
