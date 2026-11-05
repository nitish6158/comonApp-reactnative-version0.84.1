import dayjs from "dayjs";
import { atom } from "jotai";
import { AppStateStatus } from "react-native";

export const appStateAtom = atom<AppStateStatus>("active");

export function UpdateTimeManager() {
  let lastTime: string | null = null;
  let popUpCount = 0
  return {
    getLastTime: () => lastTime,
    updateLastTime: (value: string | null) => (lastTime = value),
    canShowModalNow: () => {
      if (lastTime == null) {
        return true;
      } else {
        return dayjs().isAfter(dayjs(lastTime).add(300,'seconds'), "seconds");
      }
    },
    getPopUpCount:()=> popUpCount,
    setPopUpCount:(value:number)=> {
      popUpCount = value
      return value
    }
  };
}
