import { useRecoilValue, useSetRecoilState } from "recoil";

import { savedMovesAtom } from "./savedMoves.atom";

export const useSetSavedMoves = () => {
  const setSavedMoves = useSetRecoilState(savedMovesAtom);

  const addSavedMove = (move: Move) => {
    if (move.options.mode === "select") return;

    setSavedMoves((prevMoves) => [move, ...prevMoves]);
  };

  const removeSavedMove = () => {
    let move: Move | undefined;

    setSavedMoves((prevMoves) => {
      move = prevMoves.at(0);

      return prevMoves.slice(1);
    });

    return move;
  };

  const removeSavedMoveById = (moveId: string) => {
    setSavedMoves((prevMoves) => {
      return prevMoves.filter(move => move.id !== moveId);
    });
  };

  const clearSavedMoves = () => {
    setSavedMoves([]);
  };

  return { addSavedMove, removeSavedMove, removeSavedMoveById, clearSavedMoves };
};

export const useSavedMoves = () => {
  const savedMoves = useRecoilValue(savedMovesAtom);

  return savedMoves;
};
