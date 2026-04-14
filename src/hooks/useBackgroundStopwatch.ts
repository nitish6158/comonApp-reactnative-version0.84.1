import { useEffect, useMemo, useRef, useState } from "react";
import BackgroundTimer from "react-native-background-timer";

export const addZero = (num: number) => {
  return num > 9 ? `${num}` : `0${num}`;
};

function useBackgroundStopWatch() {
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef<number | undefined>();

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        BackgroundTimer.clearInterval(intervalRef.current);
        intervalRef.current = undefined;
      }
    };
  }, []);

  let formatted = useMemo(() => {
    return `${addZero(Math.floor(seconds / 60))}:${addZero(seconds % 60)}`;
  }, [seconds]);

  return {
    seconds,
    formattedSeconds: formatted,
    start: () => {
      if (intervalRef.current) return;
      setSeconds(0);
      intervalRef.current = BackgroundTimer.setInterval(() => {
        setSeconds((_seconds) => _seconds + 1);
      }, 1000);
    },
    stop: () => {
      if (intervalRef.current) {
        setSeconds(0);
        BackgroundTimer.clearInterval(intervalRef.current);
        intervalRef.current = undefined;
        // console.log("timerStopped");
      }
    },
    startFromSpecificTime: (time: number) => {
      const times = Date.now() - time;
      const timeToStart = Math.round(times / 1000);
      setSeconds(timeToStart);
      intervalRef.current = BackgroundTimer.setInterval(() => {
        setSeconds((_seconds) => _seconds + 1);
      }, 1000);
    },
  };
}

export default useBackgroundStopWatch;
