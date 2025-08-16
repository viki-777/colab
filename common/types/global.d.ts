import { RgbaColor } from "react-colorful";

export declare global {
  type Shape = "line" | "circle" | "rect" | "image" | "arrow" | "line-segment" | "star";
  type CtxMode = "eraser" | "draw" | "select" | "stroke_delete";

  interface CtxOptions {
    lineWidth: number;
    lineColor: RgbaColor;
    fillColor: RgbaColor;
    fillEnabled: boolean;
    shape: Shape;
    mode: CtxMode;
    selection: {
      x: number;
      y: number;
      width: number;
      height: number;
    } | null;
  }

  interface Move {
    circle: {
      cX: number;
      cY: number;
      radiusX: number;
      radiusY: number;
    };
    rect: {
      width: number;
      height: number;
    };
    img: {
      base64: string;
    };
    path: [number, number][];
    options: CtxOptions;
    timestamp: number;
    id: string;
  }

  interface AuthenticatedUser {
    id: string;
    name: string;
    email: string;
    image?: string;
  }

  type Room = {
    usersMoves: Map<string, Move[]>;
    drawed: Move[];
    users: Map<string, AuthenticatedUser>;
  };

  interface User {
    name: string;
    color: string;
    id?: string;
    email?: string;
    image?: string;
  }

  interface ClientRoom {
    id: string;
    usersMoves: Map<string, Move[]>;
    movesWithoutUser: Move[];
    myMoves: Move[];
    users: Map<string, User>;
  }

  interface Message {
    userId: string;
    username: string;
    color: string;
    msg: string;
    id: number;
  }

  interface Reaction {
    id: string;
    emoji: string;
    user: {
      name: string;
      image?: string;
    };
    x: number;
    y: number;
    timestamp: number;
  }

  interface TextOperation {
    type: 'insert' | 'delete' | 'retain';
    position: number;
    content?: string;
    length?: number;
    userId: string;
    timestamp: number;
    id: string;
  }

  interface CursorPosition {
    userId: string;
    position: number;
    color: string;
    username: string;
  }

  interface CollaborativeDocument {
    id: string;
    content: string;
    title: string;
    boardId: string;
    createdAt: string;
    updatedAt: string;
  }

  interface ServerToClientEvents {
    room_exists: (exists: boolean) => void;
    joined: (roomId: string, failed?: boolean) => void;
    room: (room: Room, usersMovesToParse: string, usersToParse: string) => void;
    created: (roomId: string) => void;
    your_move: (move: Move) => void;
    user_draw: (move: Move, userId: string) => void;
    user_undo(userId: string): void;
    stroke_deleted: (moveId: string) => void;
    mouse_moved: (x: number, y: number, userId: string) => void;
    new_user: (userId: string, user: AuthenticatedUser) => void;
    user_disconnected: (userId: string) => void;
    new_msg: (userId: string, msg: string) => void;
    text_operation: (documentId: string, operation: TextOperation) => void;
    cursor_position: (documentId: string, cursor: CursorPosition) => void;
    document_content: (documentId: string, content: string) => void;
    document_joined: (documentId: string, users: string[]) => void;
    reaction_received: (reaction: Reaction) => void;
  }

  interface ClientToServerEvents {
    check_room: (roomId: string) => void;
    draw: (move: Move) => void;
    mouse_move: (x: number, y: number) => void;
    undo: () => void;
    delete_stroke: (moveId: string) => void;
    create_room: (user: AuthenticatedUser) => void;
    join_room: (room: string, user: AuthenticatedUser) => void;
    joined_room: () => void;
    leave_room: () => void;
    send_msg: (msg: string) => void;
    join_document: (documentId: string) => void;
    leave_document: (documentId: string) => void;
    text_operation: (documentId: string, operation: TextOperation) => void;
    cursor_position: (documentId: string, cursor: CursorPosition) => void;
    send_reaction: (reaction: Reaction) => void;
  }
}
