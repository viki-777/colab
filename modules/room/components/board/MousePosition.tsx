import { useRef } from "react";

import { motion } from "framer-motion";
import { useInterval, useMouse } from "react-use";

import { getPos, getPosWithOffset } from "@/common/lib/getPos";
import { socket } from "@/common/lib/socket";

import { useBoardPosition } from "../../hooks/useBoardPosition";
import { useRefs } from "../../hooks/useRefs";

const MousePosition = () => {
  const { x, y } = useBoardPosition();
  const { canvasRef } = useRefs();

  const prevPosition = useRef({ x: 0, y: 0 });

  const ref = useRef<HTMLDivElement>(null);

  const { docX, docY } = useMouse(ref);

  const touchDevice = window.matchMedia("(pointer: coarse)").matches;

  useInterval(() => {
    if (
      (prevPosition.current.x !== docX || prevPosition.current.y !== docY) &&
      !touchDevice &&
      canvasRef.current
    ) {
      const canvasRect = canvasRef.current.getBoundingClientRect();
      const mouseX = getPosWithOffset(docX, x, canvasRect, true);
      const mouseY = getPosWithOffset(docY, y, canvasRect, false);
      
      socket.emit("mouse_move", mouseX, mouseY);
      prevPosition.current = { x: docX, y: docY };
    }
  }, 150);

  if (touchDevice) return null;

  return (
    <motion.div
      ref={ref}
      className="pointer-events-none absolute top-0 left-0 z-50 select-none transition-colors dark:text-white"
      animate={{ x: docX + 15, y: docY + 15 }}
      transition={{ duration: 0.05, ease: "linear" }}
    >
      {canvasRef.current ? 
        `${getPosWithOffset(docX, x, canvasRef.current.getBoundingClientRect(), true).toFixed(0)} | ${getPosWithOffset(docY, y, canvasRef.current.getBoundingClientRect(), false).toFixed(0)}` :
        `${getPos(docX, x).toFixed(0)} | ${getPos(docY, y).toFixed(0)}`
      }
    </motion.div>
  );
};

export default MousePosition;
