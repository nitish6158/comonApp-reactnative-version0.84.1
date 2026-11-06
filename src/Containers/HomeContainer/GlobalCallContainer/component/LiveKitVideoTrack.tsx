import React, { useEffect, useState } from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import { VideoTrack } from "@livekit/react-native";
import { liveKitCallService } from "@/services/livekit/LiveKitCallService";
import VideoDisableBlock from "./VideoDisableBlock";

type LiveKitVideoTrackProps = {
  isLocal?: boolean;
  uid?: number;
  style?: StyleProp<ViewStyle>;
  height?: number;
  width?: number;
  borderRadius?: number;
  disabled?: boolean;
};

export default function LiveKitVideoTrack({
  isLocal = false,
  uid = 0,
  style,
  height,
  width,
  borderRadius,
  disabled = false,
}: LiveKitVideoTrackProps) {
  const [, setTick] = useState(0);

  useEffect(() => {
    // Re-render when tracks update
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const effectiveHeight = height || (typeof (style as any)?.height === "number" ? (style as any).height : 140);
  const effectiveWidth = width || (typeof (style as any)?.width === "number" ? (style as any).width : 100);

  if (disabled) {
    return (
      <VideoDisableBlock
        height={effectiveHeight}
        width={effectiveWidth}
        borderRadius={borderRadius}
        style={style}
      />
    );
  }

  const trackRef = isLocal
    ? liveKitCallService.getLocalTrackRef()
    : liveKitCallService.getRemoteTrackRef(uid);

  if (!trackRef || !trackRef.publication?.track) {
    return (
      <VideoDisableBlock
        height={effectiveHeight}
        width={effectiveWidth}
        borderRadius={borderRadius}
        style={style}
      />
    );
  }

  return (
    <View style={[{ height: effectiveHeight, width: effectiveWidth, overflow: "hidden", borderRadius: borderRadius || 0 }, style]}>
      <VideoTrack
        trackRef={trackRef}
        style={{ width: "100%", height: "100%" }}
        mirror={isLocal}
        objectFit="cover"
      />
    </View>
  );
}

