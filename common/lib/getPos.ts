import { MotionValue } from "framer-motion";

export const getPos = (pos: number, motionValue: MotionValue) =>
  pos - motionValue.get();

// Fixed position calculation that accounts for canvas bounding rect
export const getPosWithOffset = (
  clientPos: number, 
  motionValue: MotionValue, 
  canvasRect: DOMRect,
  isX: boolean = true
) => {
  const canvasOffset = isX ? canvasRect.left : canvasRect.top;
  return clientPos - canvasOffset - motionValue.get();
};
