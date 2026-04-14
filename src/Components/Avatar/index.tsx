import { Avatar } from "react-native-elements";
import React from "react";
import { avatarStyle } from "./AvatarStyles";
import { useAppSelector } from "@/redux/Store";

const getFirstUpperLetter = (word: string) => word.substring(0, 1).toUpperCase();

export interface AvatarProps {
  size?: number;
  name?: string;
  lastName?: string;
}

export const AvatarComponent = ({ size, name, lastName }: AvatarProps) => {
  const me = useAppSelector(state=> state.Chat.MyProfile)
  const convertedFirstName = getFirstUpperLetter(name || me?.firstName || "");
  const convertedLastName = getFirstUpperLetter(lastName || me?.lastName || "");

  return (
    <Avatar
      size={size || 48}
      rounded
      title={`${convertedFirstName}${convertedLastName}`}
      containerStyle={avatarStyle.container}
      titleStyle={avatarStyle.title}
    />
  );
};
