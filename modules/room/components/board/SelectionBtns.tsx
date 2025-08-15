import { useEffect } from "react";
import { AiOutlineDelete } from "react-icons/ai";
import { BsArrowsMove } from "react-icons/bs";
import { FiCopy } from "react-icons/fi";
import { toast } from "react-toastify";

import { DEFAULT_MOVE } from "@/common/constants/defaultMove";
import { socket } from "@/common/lib/socket";
import { useOptionsValue, useSetSelection } from "@/common/recoil/options";

import { useBoardPosition } from "../../hooks/useBoardPosition";
import { useCtx } from "../../hooks/useCtx";
import { useMoveImage } from "../../hooks/useMoveImage";
import { useRefs } from "../../hooks/useRefs";

const SelectionBtns = () => {
  const { selection } = useOptionsValue();
  const { clearSelection } = useSetSelection();
  const { selectionRefs, bgRef } = useRefs();
  const { setMoveImage } = useMoveImage();
  const boardPosition = useBoardPosition();
  const ctx = useCtx();

  // Calculate adjusted dimensions - use RAW selection coordinates
  const getDimension = () => {
    if (!selection) return { x: 0, y: 0, width: 0, height: 0 };
    
    // Use raw selection coordinates without adjustment for eraser
    let { x, y, width, height } = selection;

    return { x, y, width, height };
  };

  // Calculate adjusted dimensions for image operations
  const getAdjustedDimension = () => {
    if (!selection) return { x: 0, y: 0, width: 0, height: 0 };
    
    let { x, y, width, height } = selection;

    if (width < 0) {
      width += 4;
      x -= 2;
    } else {
      width -= 4;
      x += 2;
    }
    if (height < 0) {
      height += 4;
      y -= 2;
    } else {
      height -= 4;
      y += 2;
    }

    return { x, y, width, height };
  };

  // Create blob from selection
  const makeBlob = async (withBg?: boolean) => {
    if (!selection || !ctx) return null;

    const { x, y, width, height } = getAdjustedDimension();

    const imageData = ctx.getImageData(x, y, width, height);

    if (imageData) {
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = width;
      tempCanvas.height = height;
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const tempCtx = canvas.getContext("2d");

      if (tempCtx && bgRef.current) {
        const bgImage = bgRef.current
          .getContext("2d")
          ?.getImageData(x, y, width, height);

        if (bgImage && withBg) tempCtx.putImageData(bgImage, 0, 0);

        const sTempCtx = tempCanvas.getContext("2d");
        sTempCtx?.putImageData(imageData, 0, 0);

        tempCtx.drawImage(tempCanvas, 0, 0);

        const blob: Blob = await new Promise((resolve) => {
          canvas.toBlob((blobGenerated) => {
            if (blobGenerated) resolve(blobGenerated);
          });
        });

        return blob;
      }
    }

    return null;
  };

  // Delete selection
  const handleDelete = () => {
    if (!selection) return;

    const { x, y, width, height } = getDimension(); // Use raw coordinates for erasing

    const move: Move = {
      ...DEFAULT_MOVE,
      rect: { width, height },
      path: [[x, y]],
      options: {
        ...DEFAULT_MOVE.options,
        shape: "rect",
        mode: "eraser",
        fillColor: { r: 0, g: 0, b: 0, a: 1 },
      },
    };

    socket.emit("draw", move);
    clearSelection();
  };

  // Copy selection
  const handleCopy = async () => {
    const blob = await makeBlob(true);

    if (blob) {
      navigator.clipboard
        .write([
          new ClipboardItem({
            "image/png": blob,
          }),
        ])
        .then(() => {
          toast("Copied to clipboard!", {
            position: "top-center",
            theme: "colored",
          });
        })
        .catch(() => {
          toast.error("Failed to copy to clipboard!");
        });
    }
  };

  // Move selection
  const handleMove = async () => {
    if (!selection) return;

    const blob = await makeBlob();
    if (!blob) return;

    const { x, y, width, height } = getDimension();

    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.addEventListener("loadend", () => {
      const base64 = reader.result?.toString();

      if (base64) {
        // Delete original selection
        handleDelete();
        
        // Set up for moving
        setMoveImage({
          base64,
          x: Math.min(x, x + width),
          y: Math.min(y, y + height),
        });
        
        clearSelection();
      }
    });
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selection) return;
      
      if (e.key === "Delete") {
        e.preventDefault();
        handleDelete();
      } else if (e.key === "c" && e.ctrlKey) {
        e.preventDefault();
        handleCopy();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [selection]);

  let top;
  let left;

  if (selection) {
    const { x, y, width, height } = selection;
    top = Math.min(y, y + height) - 40;
    left = Math.min(x, x + width);
  } else {
    left = -40;
    top = -40;
  }

  return (
    <div
      className="absolute top-0 left-0 z-50 flex items-center justify-center gap-2"
      style={{ top, left }}
    >
      <button
        className="rounded-full bg-gray-200 p-2 hover:bg-gray-300 transition-colors"
        onClick={handleMove}
        title="Move Selection"
        ref={(ref) => {
          if (ref && selectionRefs.current) selectionRefs.current[0] = ref;
        }}
      >
        <BsArrowsMove />
      </button>
      <button
        className="rounded-full bg-gray-200 p-2 hover:bg-gray-300 transition-colors"
        onClick={handleCopy}
        title="Copy Selection"
        ref={(ref) => {
          if (ref && selectionRefs.current) selectionRefs.current[1] = ref;
        }}
      >
        <FiCopy />
      </button>
      <button
        className="rounded-full bg-gray-200 p-2 hover:bg-gray-300 transition-colors"
        onClick={handleDelete}
        title="Delete Selection"
        ref={(ref) => {
          if (ref && selectionRefs.current) selectionRefs.current[2] = ref;
        }}
      >
        <AiOutlineDelete />
      </button>
    </div>
  );
};

export default SelectionBtns;
