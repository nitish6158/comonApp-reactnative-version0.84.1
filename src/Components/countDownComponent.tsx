import { Button, View } from "react-native";
import React, { useEffect, useState } from "react";

import Colors from "@/Constants/Colors";
import Text from "./Text";

const Countdown = ({ initialTime, interval, onFinish }: any) => {
  const [time, setTime] = useState(initialTime);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    let timerId: string | number | NodeJS.Timer | undefined;

    if (time > 0) {
      setRunning(true);
    }

    if (running && time > 0) {
      timerId = setInterval(() => {
        setTime((prevTime: number) => prevTime - interval);
      }, interval);
    }

    return () => {
      clearInterval(timerId);
    };
  }, [running, time]);

  useEffect(() => {
    if (time === 0 && onFinish) {
      onFinish();
    }
  }, [time, onFinish]);

  const formatTime = (time: number) => {
    const seconds = Math.floor(time / 1000);
    const milliseconds = time % 1000;
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    const remainingSeconds = seconds % 60;
    return `${days}d ${hours}h ${minutes}m ${remainingSeconds}s ${milliseconds}ms`;
  };

  const restartCountdown = () => {
    setRunning(true);
    setTime(initialTime);
  };

  return (
    <View style={{ backgroundColor: Colors.light.White, padding: 10, borderRadius: 5, elevation: 2 }}>
      <Text size="lg">{formatTime(time)}</Text>
    </View>
  );
};

export default Countdown;
