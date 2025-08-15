import { BsFillCircleFill, BsCircle } from "react-icons/bs";

import { useOptions } from "@/common/recoil/options";

const FillToggle = () => {
  const [options, setOptions] = useOptions();

  const handleToggleFill = () => {
    setOptions((prev) => ({
      ...prev,
      fillEnabled: !prev.fillEnabled,
    }));
  };

  // Only show fill toggle for shapes that can be filled
  const showFillToggle = ["circle", "rect", "star"].includes(options.shape);

  if (!showFillToggle || options.mode === "select") return null;

  return (
    <button
      className={`btn-icon text-2xl ${
        options.fillEnabled 
          ? "bg-blue-600 text-white" 
          : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
      }`}
      onClick={handleToggleFill}
      title={options.fillEnabled ? "Disable Fill" : "Enable Fill"}
    >
      {options.fillEnabled ? <BsFillCircleFill /> : <BsCircle />}
    </button>
  );
};

export default FillToggle;
