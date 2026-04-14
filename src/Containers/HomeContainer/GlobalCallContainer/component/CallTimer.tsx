import React, { useEffect } from "react";
import { Text, View } from "react-native";
import { atom, useAtomValue, useSetAtom } from "jotai";

import useBackgroundStopWatch from "@/hooks/useBackgroundStopwatch";

type callTimerType = { type: "STOP" | "START" | "SPECIFIC" | null; duration: number };

export const callTimeDurationAtom = atom<string>("");
export const callTimerTypeAtom = atom<callTimerType>({ type: null, duration: 0 });

export default function CallTimerStarter() {
  const { formattedSeconds, start, stop, startFromSpecificTime } = useBackgroundStopWatch();
  const callTimerType = useAtomValue(callTimerTypeAtom);
  const setTime = useSetAtom(callTimeDurationAtom);

  useEffect(() => {
    setTime(formattedSeconds);
  }, [formattedSeconds]);

  useEffect(() => {
    if (callTimerType.type != null) {
      switch (callTimerType.type) {
        case "START":
          start();
          break;
        case "STOP":
          stop();
          break;
        case "SPECIFIC":
          startFromSpecificTime(callTimerType.duration);
          break;
        default:
          break;
      }
    }
  }, [callTimerType]);

  return <></>;
}

type callTimerUIProps = {
  color: string;
};

export function ShowCallTimeUI({ color }: callTimerUIProps) {
  const formattedSeconds = useAtomValue(callTimeDurationAtom);
  return (
    <View style={{}}>
      <Text style={{ color: color ?? "black", fontSize: 16, fontWeight: "500", marginLeft: 8, textAlign: "center" }}>
        {formattedSeconds}
      </Text>
    </View>
  );
}
