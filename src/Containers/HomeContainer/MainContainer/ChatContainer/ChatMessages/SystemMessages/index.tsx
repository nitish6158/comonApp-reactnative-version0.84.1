import React, { useEffect } from "react";

import { Conversation } from "@/models/chatmessage";
import {View} from 'react-native'
import DoubleActionText from "./DoubleActionText";
import SingleActionText from "./SingleActionText";


type SingleChatEventMessageProps = {
  type: "DOUBLE_ACTION" | "SINGLE_ACTION" | "MESSAGE";
  message: Conversation;
  OrganisationInvites: any;
};

export default function SystemMessage({
  type,
  message,
  OrganisationInvites,
}: SingleChatEventMessageProps) {

  if (type == "DOUBLE_ACTION") {
    return <DoubleActionText message={message} OrganisationInvites={OrganisationInvites} />;
  } else if (type == "SINGLE_ACTION") {
    return <SingleActionText message={message} />;
  } else {
    return <View></View>;
  }
}



