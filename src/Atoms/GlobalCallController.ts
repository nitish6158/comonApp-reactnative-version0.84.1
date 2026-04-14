import { atom } from "jotai";

type controller = {
  isFullScreenModel: boolean;
  isMiniScreenModel: boolean;
};

export const callFullScreenState = atom<controller["isFullScreenModel"]>(false);
export const callMiniScreenState = atom<controller["isMiniScreenModel"]>(false);
