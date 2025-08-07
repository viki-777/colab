import { atom } from "recoil";

export const modalAtom = atom<{
  modal: JSX.Element | JSX.Element[];
  opened: boolean;
}>({
  key: "Colabio_modal_state_v2",
  default: {
    modal: <></>,
    opened: false,
  },
});
