import { useEffect, useRef } from "react";
import { DeviceEventEmitter } from "react-native";

function useEventEmitter(event: string, onEvent: (data: any) => void) {
  const eventRef = useRef(event);
  const onEventRef = useRef(onEvent);

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(eventRef.current, onEventRef.current);

    return () => {
      subscription.remove();
    };
  }, []);
}

export default useEventEmitter;

export const emitEvent = (event: string, data?: any) => {
  DeviceEventEmitter.emit(event, data);
};
