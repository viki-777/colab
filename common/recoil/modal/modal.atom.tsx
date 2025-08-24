import { atom } from "recoil";
import React from "react";

export const modalAtom = atom<{
  modal: JSX.Element | JSX.Element[];
  opened: boolean;
}>({
  key: "Colabio_modal_state_v2",
  default: {
    modal: React.createElement(React.Fragment),
    opened: false,
  },
});
