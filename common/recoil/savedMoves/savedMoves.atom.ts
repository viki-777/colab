import { atom } from "recoil";

export const savedMovesAtom = atom<Move[]>({
  key: "Colabio_saved_moves",
  default: [],
});
