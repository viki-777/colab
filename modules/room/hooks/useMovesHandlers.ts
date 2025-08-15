import { useEffect, useMemo } from "react";

import { getStringFromRgba } from "@/common/lib/rgba";
import { socket } from "@/common/lib/socket";
import { useBackground } from "@/common/recoil/background";
import { useSetSelection } from "@/common/recoil/options";
import { useMyMoves, useRoom } from "@/common/recoil/room";
import { useSetSavedMoves } from "@/common/recoil/savedMoves";

import { useCtx } from "./useCtx";
import { useRefs } from "./useRefs";
import { useSelection } from "./useSelection";

let prevMovesLength = 0;

export const useMovesHandlers = (clearOnYourMove: () => void) => {
  const { canvasRef, minimapRef, bgRef } = useRefs();
  const room = useRoom();
  const { handleAddMyMove, handleRemoveMyMove } = useMyMoves();
  const { addSavedMove, removeSavedMove } = useSetSavedMoves();
  const ctx = useCtx();
  const bg = useBackground();
  const { clearSelection } = useSetSelection();

  const sortedMoves = useMemo(() => {
    const { usersMoves, movesWithoutUser, myMoves } = room;

    const moves = [...movesWithoutUser, ...myMoves];

    usersMoves.forEach((userMoves) => moves.push(...userMoves));

    moves.sort((a, b) => a.timestamp - b.timestamp);

    return moves;
  }, [room]);

  const copyCanvasToSmall = () => {
    if (canvasRef.current && minimapRef.current && bgRef.current) {
      const smallCtx = minimapRef.current.getContext("2d");
      if (smallCtx) {
        smallCtx.clearRect(0, 0, smallCtx.canvas.width, smallCtx.canvas.height);
        smallCtx.drawImage(
          bgRef.current,
          0,
          0,
          smallCtx.canvas.width,
          smallCtx.canvas.height
        );
        smallCtx.drawImage(
          canvasRef.current,
          0,
          0,
          smallCtx.canvas.width,
          smallCtx.canvas.height
        );
      }
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => copyCanvasToSmall(), [bg]);

  const drawMove = (move: Move, image?: HTMLImageElement) => {
    const { path } = move;

    if (!ctx || !path.length) return;

    const moveOptions = move.options;

    if (moveOptions.mode === "select") return;

    ctx.lineWidth = moveOptions.lineWidth;
    ctx.strokeStyle = getStringFromRgba(moveOptions.lineColor);
    ctx.fillStyle = getStringFromRgba(moveOptions.fillColor);
    if (moveOptions.mode === "eraser")
      ctx.globalCompositeOperation = "destination-out";
    else ctx.globalCompositeOperation = "source-over";

    if (moveOptions.shape === "image" && image)
      ctx.drawImage(image, path[0][0], path[0][1]);

    switch (moveOptions.shape) {
      case "line": {
        ctx.beginPath();
        path.forEach(([x, y]) => {
          ctx.lineTo(x, y);
        });

        ctx.stroke();
        ctx.closePath();
        break;
      }

      case "line-segment": {
        if (path.length >= 2) {
          ctx.beginPath();
          ctx.moveTo(path[0][0], path[0][1]);
          ctx.lineTo(path[1][0], path[1][1]);
          ctx.stroke();
          ctx.closePath();
        }
        break;
      }

      case "arrow": {
        if (path.length >= 2) {
          const [startX, startY] = path[0];
          const [endX, endY] = path[1];
          
          ctx.beginPath();
          
          // Calculate angle and distance
          const dx = endX - startX;
          const dy = endY - startY;
          const angle = Math.atan2(dy, dx);
          const length = Math.sqrt(dx * dx + dy * dy);
          
          // Draw main line
          ctx.moveTo(startX, startY);
          ctx.lineTo(endX, endY);
          
          // Draw arrowhead
          const headlen = Math.min(20, length * 0.3);
          ctx.lineTo(
            endX - headlen * Math.cos(angle - Math.PI / 6),
            endY - headlen * Math.sin(angle - Math.PI / 6)
          );
          ctx.moveTo(endX, endY);
          ctx.lineTo(
            endX - headlen * Math.cos(angle + Math.PI / 6),
            endY - headlen * Math.sin(angle + Math.PI / 6)
          );
          
          ctx.stroke();
          ctx.closePath();
        }
        break;
      }

      case "circle": {
        const { cX, cY, radiusX, radiusY } = move.circle;

        ctx.beginPath();
        ctx.ellipse(cX, cY, radiusX, radiusY, 0, 0, 2 * Math.PI);
        ctx.stroke();
        if (moveOptions.fillEnabled) ctx.fill();
        ctx.closePath();
        break;
      }

      case "rect": {
        const { width, height } = move.rect;

        ctx.beginPath();
        ctx.rect(path[0][0], path[0][1], width, height);
        ctx.stroke();
        if (moveOptions.fillEnabled) ctx.fill();
        ctx.closePath();
        break;
      }

      case "star": {
        if (path.length >= 2) {
          const [startX, startY] = path[0];
          const [endX, endY] = path[1];
          
          const width = endX - startX;
          const height = endY - startY;
          const centerX = startX + width / 2;
          const centerY = startY + height / 2;
          const outerRadius = Math.min(Math.abs(width), Math.abs(height)) / 2;
          const innerRadius = outerRadius * 0.4;
          const points = 5;
          
          ctx.beginPath();
          
          for (let i = 0; i < points * 2; i++) {
            const angle = (i * Math.PI) / points;
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const pointX = centerX + Math.cos(angle - Math.PI / 2) * radius;
            const pointY = centerY + Math.sin(angle - Math.PI / 2) * radius;
            
            if (i === 0) {
              ctx.moveTo(pointX, pointY);
            } else {
              ctx.lineTo(pointX, pointY);
            }
          }
          
          ctx.closePath();
          ctx.stroke();
          if (moveOptions.fillEnabled) ctx.fill();
        }
        break;
      }

      default:
        break;
    }

    copyCanvasToSmall();
  };

  const drawAllMoves = async () => {
    if (!ctx) return;

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    const images = await Promise.all(
      sortedMoves
        .filter((move) => move.options.shape === "image")
        .map((move) => {
          return new Promise<HTMLImageElement>((resolve) => {
            const img = new Image();
            img.src = move.img.base64;
            img.id = move.id;
            img.addEventListener("load", () => resolve(img));
          });
        })
    );

    sortedMoves.forEach((move) => {
      if (move.options.shape === "image") {
        const img = images.find((image) => image.id === move.id);
        if (img) drawMove(move, img);
      } else drawMove(move);
    });

    copyCanvasToSmall();
  };

  useSelection(drawAllMoves);

  useEffect(() => {
    socket.on("your_move", (move) => {
      clearOnYourMove();
      handleAddMyMove(move);
      setTimeout(clearSelection, 100);
    });

    return () => {
      socket.off("your_move");
    };
  }, [clearOnYourMove, clearSelection, handleAddMyMove]);

  useEffect(() => {
    if (prevMovesLength >= sortedMoves.length || !prevMovesLength) {
      drawAllMoves();
    } else {
      const lastMove = sortedMoves[sortedMoves.length - 1];

      if (lastMove.options.shape === "image") {
        const img = new Image();
        img.src = lastMove.img.base64;
        img.addEventListener("load", () => drawMove(lastMove, img));
      } else drawMove(lastMove);
    }

    return () => {
      prevMovesLength = sortedMoves.length;
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortedMoves]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleUndo = () => {
    if (ctx) {
      const move = handleRemoveMyMove();

      if (move?.options.mode === "select") clearSelection();
      else if (move) {
        addSavedMove(move);
        socket.emit("undo");
      }
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleRedo = () => {
    if (ctx) {
      const move = removeSavedMove();

      if (move) {
        socket.emit("draw", move);
      }
    }
  };

  useEffect(() => {
    const handleUndoRedoKeyboard = (e: KeyboardEvent) => {
      if (e.key === "z" && e.ctrlKey) {
        handleUndo();
      } else if (e.key === "y" && e.ctrlKey) {
        handleRedo();
      }
    };

    document.addEventListener("keydown", handleUndoRedoKeyboard);

    return () => {
      document.removeEventListener("keydown", handleUndoRedoKeyboard);
    };
  }, [handleUndo, handleRedo]);

  return { handleUndo, handleRedo };
};
