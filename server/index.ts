import { createServer } from "http";

import {} from "@/common/types/global";

import express from "express";
import next, { NextApiHandler } from "next";
import { Server } from "socket.io";
import { v4 } from "uuid";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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

  // Save room data to database
  const saveRoomData = async (roomId: string) => {
    try {
      const room = rooms.get(roomId);
      if (!room) return;

      // Combine all moves into a single array
      const allMoves = [...room.drawed];
      room.usersMoves.forEach((moves) => {
        allMoves.push(...moves);
      });

      // Find board by roomId and update it
      await prisma.board.updateMany({
        where: { roomId },
        data: {
          data: {
            moves: allMoves,
            lastSaved: new Date().toISOString(),
          } as any,
          updatedAt: new Date(),
        },
      });

      console.log(`💾 Saved room data for ${roomId}`);
    } catch (error) {
      console.error(`❌ Failed to save room data for ${roomId}:`, error);
    }
  };

  // Load room data from database
  const loadRoomData = async (roomId: string): Promise<Move[]> => {
    try {
      const board = await prisma.board.findFirst({
        where: { roomId },
      });

      if (board?.data && typeof board.data === 'object' && 'moves' in board.data) {
        const moves = (board.data as any).moves as Move[];
        console.log(`📂 Loaded ${moves.length} moves for room ${roomId}`);
        return moves || [];
      }

      return [];
    } catch (error) {
      console.error(`❌ Failed to load room data for ${roomId}:`, error);
      return [];
    }
  };

  // Auto-save room data every 30 seconds
  const autoSaveInterval = setInterval(() => {
    rooms.forEach((_, roomId) => {
      saveRoomData(roomId);
    });
  }, 30000); // 30 seconds

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

      const userMoves = room.usersMoves.get(socketId);

      if (userMoves) room.drawed.push(...userMoves);
      room.users.delete(socketId);

      // Save room data when user leaves
      await saveRoomData(roomId);

      socket.leave(roomId);
    };

    socket.on("create_room", (user: AuthenticatedUser) => {
      let roomId: string;
      do {
        roomId = Math.random().toString(36).substring(2, 6);
      } while (rooms.has(roomId));

      socket.join(roomId);

      rooms.set(roomId, {
        usersMoves: new Map([[socket.id, []]]),
        drawed: [],
        users: new Map([[socket.id, user]]),
      });

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
        // Load saved room data from database
        const savedMoves = await loadRoomData(roomId);
        
        room = {
          usersMoves: new Map(),
          drawed: savedMoves, // Load previously saved moves
          users: new Map(),
        };
        rooms.set(roomId, room);
      }

      if (room.users.size < 12) {
        socket.join(roomId);

        room.users.set(socket.id, user);
        room.usersMoves.set(socket.id, []);

        io.to(socket.id).emit("joined", roomId);
      } else io.to(socket.id).emit("joined", "", true);
    });

    socket.on("joined_room", () => {
      const roomId = getRoomId();

      const room = rooms.get(roomId);
      if (!room) return;

      io.to(socket.id).emit(
        "room",
        room,
        JSON.stringify([...room.usersMoves]),
        JSON.stringify([...room.users])
      );

      socket.broadcast
        .to(roomId)
        .emit("new_user", socket.id, room.users.get(socket.id)!);
    });

    socket.on("leave_room", () => {
      const roomId = getRoomId();
      leaveRoom(roomId, socket.id);

      io.to(roomId).emit("user_disconnected", socket.id);
    });

    socket.on("draw", (move) => {
      const roomId = getRoomId();

      const timestamp = Date.now();

      // eslint-disable-next-line no-param-reassign
      move.id = v4();

      addMove(roomId, socket.id, { ...move, timestamp });

      io.to(socket.id).emit("your_move", { ...move, timestamp });

      socket.broadcast
        .to(roomId)
        .emit("user_draw", { ...move, timestamp }, socket.id);
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
      io.to(getRoomId()).emit("new_msg", socket.id, msg);
    });

    socket.on("send_reaction", (reaction) => {
      const roomId = getRoomId();
      // Broadcast reaction to all other users in the room
      socket.broadcast.to(roomId).emit("reaction_received", reaction);
    });

    socket.on("disconnecting", () => {
      const roomId = getRoomId();
      leaveRoom(roomId, socket.id);

      io.to(roomId).emit("user_disconnected", socket.id);
    });
  });

  app.all("*", (req: any, res: any) => nextHandler(req, res));

  server.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`> Ready on http://localhost:${port}`);
  });
});
