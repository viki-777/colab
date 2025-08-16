import { useState } from "react";

import { DEFAULT_MOVE } from "@/common/constants/defaultMove";
import { getPosWithOffset } from "@/common/lib/getPos";
import { getStringFromRgba } from "@/common/lib/rgba";
import { socket } from "@/common/lib/socket";
import { useOptionsValue } from "@/common/recoil/options";
import { useSetSelection } from "@/common/recoil/options/options.hooks";
import { useMyMoves } from "@/common/recoil/room";
import { useSetSavedMoves, useSavedMoves } from "@/common/recoil/savedMoves";

import { drawRect, drawCircle, drawLine, drawLineSegment, drawArrow, drawStar } from "../helpers/Canvas.helpers";
import { useBoardPosition } from "./useBoardPosition";
import { useCtx } from "./useCtx";
import { useRefs } from "./useRefs";

let tempMoves: [number, number][] = [];
let tempCircle = { cX: 0, cY: 0, radiusX: 0, radiusY: 0 };
let tempSize = { width: 0, height: 0 };
let tempImageData: ImageData | undefined;

export const useDraw = (blocked: boolean) => {
  const options = useOptionsValue();
  const boardPosition = useBoardPosition();
  const { clearSavedMoves } = useSetSavedMoves();
  const { handleAddMyMove } = useMyMoves();
  const { setSelection, clearSelection } = useSetSelection();
  const { canvasRef } = useRefs();
  const savedMoves = useSavedMoves();

  const movedX = boardPosition.x;
  const movedY = boardPosition.y;

  const [drawing, setDrawing] = useState(false);
  const ctx = useCtx();

  const setupCtxOptions = () => {
    if (ctx) {
      ctx.lineWidth = options.lineWidth;
      ctx.strokeStyle = getStringFromRgba(options.lineColor);
      ctx.fillStyle = getStringFromRgba(options.fillColor);
      if (options.mode === "eraser")
        ctx.globalCompositeOperation = "destination-out";
      else ctx.globalCompositeOperation = "source-over";
    }
  };

  const drawAndSet = () => {
    if (!tempImageData)
      tempImageData = ctx?.getImageData(
        0,
        0,
        ctx.canvas.width,
        ctx.canvas.height
      );

    if (tempImageData) ctx?.putImageData(tempImageData, 0, 0);
  };

  // Function to check if a point intersects with a stroke
  const isPointInStroke = (x: number, y: number, move: Move): boolean => {
    if (!move.path?.length) {
      console.log("Move has no path");
      return false;
    }

    const tolerance = Math.max(move.options.lineWidth * 2, 15); // Increased tolerance
    console.log("Checking intersection with tolerance:", tolerance);
    console.log("Path points:", move.path.slice(0, 3), "... (showing first 3)");

    // Simple bounding box check first
    const allX = move.path.map(p => p[0]);
    const allY = move.path.map(p => p[1]);
    const minX = Math.min(...allX) - tolerance;
    const maxX = Math.max(...allX) + tolerance;
    const minY = Math.min(...allY) - tolerance;
    const maxY = Math.max(...allY) + tolerance;
    
    console.log(`Bounding box: (${minX},${minY}) to (${maxX},${maxY}), click: (${x},${y})`);
    
    if (x < minX || x > maxX || y < minY || y > maxY) {
      console.log("Click outside bounding box");
      return false;
    }

    for (let i = 0; i < move.path.length - 1; i++) {
      const [x1, y1] = move.path[i];
      const [x2, y2] = move.path[i + 1];

      // Calculate distance from point to line segment
      const A = x - x1;
      const B = y - y1;
      const C = x2 - x1;
      const D = y2 - y1;

      const dot = A * C + B * D;
      const lenSq = C * C + D * D;
      
      if (lenSq === 0) continue; // Points are the same

      let param = dot / lenSq;
      param = Math.max(0, Math.min(1, param)); // Clamp to line segment

      const xx = x1 + param * C;
      const yy = y1 + param * D;

      const dx = x - xx;
      const dy = y - yy;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (i < 3) { // Log first few segments for debugging
        console.log(`Segment ${i}: (${x1},${y1}) to (${x2},${y2}), distance: ${distance.toFixed(2)}`);
      }

      if (distance <= tolerance) {
        console.log("Intersection found! Distance:", distance);
        return true;
      }
    }

    console.log("No intersection found for this stroke");
    return false;
  };

  // Function to find and delete stroke at click position
  const handleStrokeDelete = (x: number, y: number) => {
    if (!canvasRef.current) return;

    console.log("handleStrokeDelete called with:", x, y);

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const [finalX, finalY] = [
      getPosWithOffset(x, movedX, canvasRect, true), 
      getPosWithOffset(y, movedY, canvasRect, false)
    ];

    console.log("Converted coordinates:", finalX, finalY);
    console.log("Saved moves count:", savedMoves.length);

    // Check all saved moves to find which one was clicked
    const allMoves = savedMoves;
    
    console.log("All saved moves:", allMoves.map(m => ({ id: m.id, mode: m.options.mode, pathLength: m.path?.length })));
    
    // Find the topmost (last drawn) stroke that intersects with the click point
    for (let i = allMoves.length - 1; i >= 0; i--) {
      const move = allMoves[i];
      
      console.log(`Checking move ${i}:`, move.id, move.path?.length, "mode:", move.options.mode);
      
      if (move.options.mode === "select" || move.options.mode === "stroke_delete") {
        console.log("Skipping move due to mode:", move.options.mode);
        continue;
      }
      
      if (isPointInStroke(finalX, finalY, move)) {
        console.log("Found intersecting stroke:", move.id);
        // Emit delete stroke event to server
        socket.emit("delete_stroke", move.id);
        return; // Exit function after deleting stroke
      }
    }
    
    console.log("No stroke found at click position");
  };

  const handleStartDrawing = (x: number, y: number) => {
    if (!ctx || blocked || !canvasRef.current) return;

    console.log("handleStartDrawing called with mode:", options.mode);

    // Handle stroke deletion mode
    if (options.mode === "stroke_delete") {
      console.log("Stroke delete mode triggered at:", x, y);
      handleStrokeDelete(x, y);
      return;
    }

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const [finalX, finalY] = [
      getPosWithOffset(x, movedX, canvasRect, true), 
      getPosWithOffset(y, movedY, canvasRect, false)
    ];

    console.log("Starting to draw at:", finalX, finalY);
    setDrawing(true);
    setupCtxOptions();
    drawAndSet();

    if (options.shape === "line" && options.mode !== "select") {
      ctx.beginPath();
      ctx.lineTo(finalX, finalY);
      ctx.stroke();
    }

    tempMoves.push([finalX, finalY]);
  };

  const handleDraw = (x: number, y: number, shift?: boolean) => {
    if (!ctx || !drawing || blocked || !canvasRef.current) return;

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const [finalX, finalY] = [
      getPosWithOffset(x, movedX, canvasRect, true), 
      getPosWithOffset(y, movedY, canvasRect, false)
    ];

    drawAndSet();

    if (options.mode === "select") {
      ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
      drawRect(ctx, tempMoves[0], finalX, finalY, false, true, false);
      tempMoves.push([finalX, finalY]);

      setupCtxOptions();

      return;
    }

    switch (options.shape) {
      case "line":
        if (shift) tempMoves = tempMoves.slice(0, 1);

        drawLine(ctx, tempMoves[0], finalX, finalY, shift);

        tempMoves.push([finalX, finalY]);
        break;

      case "line-segment":
        drawLineSegment(ctx, tempMoves[0], finalX, finalY, shift);
        break;

      case "arrow":
        drawArrow(ctx, tempMoves[0], finalX, finalY, shift);
        break;

      case "circle":
        tempCircle = drawCircle(ctx, tempMoves[0], finalX, finalY, shift, options.fillEnabled);
        break;

      case "rect":
        tempSize = drawRect(ctx, tempMoves[0], finalX, finalY, shift, false, options.fillEnabled);
        break;

      case "star":
        drawStar(ctx, tempMoves[0], finalX, finalY, shift, options.fillEnabled);
        break;

      default:
        break;
    }
  };

  const clearOnYourMove = () => {
    drawAndSet();
    tempImageData = undefined;
  };

  const handleEndDrawing = () => {
    if (!ctx || blocked) return;

    setDrawing(false);

    ctx.closePath();

    let addMove = true;
    if (options.mode === "select" && tempMoves.length) {
      clearOnYourMove();
      let x = tempMoves[0][0];
      let y = tempMoves[0][1];
      let width = tempMoves[tempMoves.length - 1][0] - x;
      let height = tempMoves[tempMoves.length - 1][1] - y;

      if (width < 0) {
        width -= 4;
        x += 2;
      } else {
        width += 4;
        x -= 2;
      }
      if (height < 0) {
        height -= 4;
        y += 2;
      } else {
        height += 4;
        y -= 2;
      }

      if (Math.abs(width) > 4 && Math.abs(height) > 4)
        setSelection({ x, y, width, height });
      else {
        clearSelection();
        addMove = false;
      }
    }

    const move: Move = {
      ...DEFAULT_MOVE,
      rect: {
        ...tempSize,
      },
      circle: {
        ...tempCircle,
      },
      path: tempMoves,
      options,
    };

    tempMoves = [];
    tempCircle = { cX: 0, cY: 0, radiusX: 0, radiusY: 0 };
    tempSize = { width: 0, height: 0 };

    if (options.mode !== "select") {
      socket.emit("draw", move);
      clearSavedMoves();
    } else if (addMove) handleAddMyMove(move);
  };

  return {
    handleEndDrawing,
    handleDraw,
    handleStartDrawing,
    drawing,
    clearOnYourMove,
  };
};
