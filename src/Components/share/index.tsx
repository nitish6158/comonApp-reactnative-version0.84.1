import { Share as NativeShare, Pressable, ShareContent, ShareOptions } from "react-native";

import Colors from "@/Constants/Colors";
import { Icon } from "react-native-elements";
import React from "react";

interface ShareProps {
  content: ShareContent;
  options?: ShareOptions;
}

const Share = ({ content, options }: ShareProps) => {
  const onShare = async () => {
    try {
      await NativeShare.share(content, options);
    } catch (error: any) {
      if (error?.message) {
        alert(error.message);
      }
    }
  };
  return (
    <Pressable onPress={onShare}>
      <Icon name="share" tvParallaxProperties={undefined} color={Colors.light.background} />
    </Pressable>
  );
};

export default Share;
