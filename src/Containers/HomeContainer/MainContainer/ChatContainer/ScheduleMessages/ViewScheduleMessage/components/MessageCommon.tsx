import { Dimensions, StyleSheet, View } from "react-native";
import React, { useCallback, useMemo } from "react";

import FormatTextRender from "@Components/formatTextRender";
import { singleRoom } from "@Atoms/singleRoom";
import { useAtom } from "jotai";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/Reducer";

type props = {
  message: string;
  children: JSX.Element;
};

export default function MessageCommon({ message, children }: props) {
  const [display] = useAtom(singleRoom);
  const { comonContact } = useSelector((state: RootState) => state.Contact);

  const FormattedMessage = useMemo(() => {
    const regex = /@\[([^\]]+)\]\(([a-zA-Z0-9]{24})\)/g;
    let resultMessage = message;
    const matches = resultMessage.match(regex) ?? [];

    // console.log(message, matches);
    if (matches.length > 0) {
      const ids = [];
      for (let i = 0; i < matches?.length; i++) {
        const start = matches[i].indexOf("(");
        const end = matches[i].indexOf(")");
        const userID = matches[i].slice(start + 1, end);

        display.participants.forEach((it) => {
          if (display.currentUserUtility.user_id == userID) {
            ids?.push("You");
          } else {
            const isExist = comonContact.filter((contact) => contact.userId?._id == userID);

            if (isExist.length > 0) {
              ids?.push(`${isExist[0].firstName} ${isExist[0].lastName}`);
            } else {
              return ids?.push(it.phone);
            }
          }
        });
      }

      for (let i = 0; i < matches.length; i++) {
        resultMessage = resultMessage?.replace(matches[i], ` @${ids[i]} @`);
      }
    }

    return resultMessage;
  }, [display?.roomType, message, display?.participants, comonContact]);

  return (
    <View>
      {children}

      {FormattedMessage.length > 0 && (
        <View style={{ marginBottom: 3 }}>
          <FormatTextRender searchText={""} message={FormattedMessage} />
        </View>
      )}
    </View>
  );
}

