import { ImageBackground, Platform, View, useWindowDimensions } from "react-native";
import React, { useMemo } from "react";
import { RtcSurfaceView, RtcTextureView } from "react-native-agora";

import { calculateHeightWidth } from "./VideoGrid";
import VideoDisableBlock from "./VideoDisableBlock";

type Props = {
  children: any;
  callType: string;
  bgImage?: {
    fileName: string;
    opacity: number;
  } | null;
  currentUserUid: number;
  participantsUid: number[];
  disabledRemoteVideo?: number[];
  mode?: "CLASSIC" | "SENIORCITIZEN";
};
function CallBackground({
  children,
  callType,
  bgImage,
  currentUserUid,
  participantsUid,
  disabledRemoteVideo = [],
  mode = "CLASSIC",
}: Props) {
  const { width, height } = useWindowDimensions();

  console.log("participantsUid", participantsUid);
  const participantsData = useMemo(() => {
    if (participantsUid && callType == "video") {
      const currentParticipants = [...new Set(participantsUid)];
      console.log("currentParticipants", currentParticipants);
      return calculateHeightWidth(currentParticipants, height, width);
    } else {
      return [];
    }
  }, [participantsUid, height, width, callType]);

  return callType == "audio" ? (
    bgImage?.fileName ? (
      <ImageBackground
        style={{ flex: 1 }}
        source={{
          uri: `https://storage.googleapis.com/comon-bucket/${bgImage?.fileName}`,
        }}
      >
        <View
          style={{
            zIndex: 1,
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: `rgba(0, 0, 0, ${bgImage?.opacity})`,
          }}
        />
        <View style={{ flex: 1, zIndex: 2 }}>{children}</View>
      </ImageBackground>
    ) : (
      <View style={{ flex: 1, backgroundColor: mode == "CLASSIC" ? "#b4e8ff" : "#2f3645" }}>{children}</View>
    )
  ) : participantsUid.length != 0 ? (
    <View style={{ flex: 1 }}>
      <View style={{ position: "absolute", zIndex: -1, top: 0, flex: 1, flexWrap: "wrap", flexDirection: "row" }}>
        {participantsData.map((item, index) => {
          const isVideoDisabled = disabledRemoteVideo.includes(item.uid);
          const renderKey = `${item.uid}-${isVideoDisabled ? "off" : "on"}-${index}`;

          return (
            <View key={renderKey} style={{ height: item.height, width: item.width }}>
              {isVideoDisabled ? (
                <VideoDisableBlock height={item.height} width={item.width} />
              ) : Platform.OS === "android" ? (
                <RtcTextureView
                  canvas={{
                    uid: item.uid,
                  }}
                  style={{ height: item.height, width: item.width }}
                />
              ) : (
                <RtcSurfaceView
                  canvas={{
                    uid: item.uid,
                  }}
                  style={{ height: item.height, width: item.width }}
                />
              )}
            </View>
          );
        })}
        {/* <FlatGrid
          spacing={2}
          style={{ width: width, height: boxHeight }}
          data={participantsUid}
          renderItem={({ item }) => {
            return (
            );
          }}
        /> */}
      </View>
      {children}
    </View>
  ) : (
    <View style={{ flex: 1, backgroundColor: mode == "CLASSIC" ? "#b4e8ff" : "#2f3645" }}>{children}</View>
  );
}

export default CallBackground;
