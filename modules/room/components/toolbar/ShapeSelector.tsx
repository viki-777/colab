import { useRef, useState } from "react";

import { motion, AnimatePresence } from "framer-motion";
import { BiRectangle } from "react-icons/bi";
import { BsCircle, BsArrowUp, BsStar } from "react-icons/bs";
import { CgShapeCircle, CgShapeZigzag } from "react-icons/cg";
import { AiOutlineLine } from "react-icons/ai";
import { useClickAway } from "react-use";

import { useOptions } from "@/common/recoil/options";

import { EntryAnimation } from "../../animations/Entry.animations";

const ShapeSelector = () => {
  const [options, setOptions] = useOptions();

  const ref = useRef<HTMLDivElement>(null);

  const [opened, setOpened] = useState(false);

  useClickAway(ref, () => setOpened(false));

  const handleShapeChange = (shape: Shape) => {
    setOptions((prev) => ({
      ...prev,
      shape,
    }));

    setOpened(false);
  };

  return (
    <div className="relative flex items-center" ref={ref}>
      <button
        className="btn-icon text-2xl"
        disabled={options.mode === "select" || options.mode === "stroke_delete"}
        onClick={() => setOpened((prev) => !prev)}
      >
        {options.shape === "circle" && <BsCircle />}
        {options.shape === "rect" && <BiRectangle />}
        {options.shape === "line" && <CgShapeCircle />}
        {options.shape === "line-segment" && <AiOutlineLine />}
        {options.shape === "arrow" && <BsArrowUp />}
        {options.shape === "star" && <BsStar />}
      </button>
      

      <AnimatePresence>
        {opened && (
          <motion.div
            className="absolute left-14 z-10 flex flex-wrap gap-1 rounded-lg border bg-zinc-900 p-2 md:border-0 max-w-xs"
            variants={EntryAnimation}
            initial="from"
            animate="to"
            exit="from"
          >
            <button
              className="btn-icon text-2xl"
              onClick={() => handleShapeChange("line")}
              title="Free Line"
            >
              <CgShapeZigzag />
            </button>

            <button
              className="btn-icon text-2xl"
              onClick={() => handleShapeChange("line-segment")}
              title="Line Segment"
            >
              <AiOutlineLine />
            </button>

            <button
              className="btn-icon text-2xl"
              onClick={() => handleShapeChange("arrow")}
              title="Arrow"
            >
              <BsArrowUp />
            </button>

            <button
              className="btn-icon text-2xl"
              onClick={() => handleShapeChange("rect")}
              title="Rectangle"
            >
              <BiRectangle />
            </button>

            <button
              className="btn-icon text-2xl"
              onClick={() => handleShapeChange("circle")}
              title="Circle/Ellipse"
            >
              <BsCircle />
            </button>

            <button
              className="btn-icon text-2xl"
              onClick={() => handleShapeChange("star")}
              title="Star"
            >
              <BsStar />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ShapeSelector;
