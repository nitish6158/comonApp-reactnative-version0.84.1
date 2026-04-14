import React, { useEffect, useState } from "react";
import { Share, StyleSheet, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";

import Colors from "@/Constants/Colors";
import DeleteForwardModal from "../../ChatMessages/DeleteMessageModal";
import FavDelete from "@Images/Favorite/FavDelete.svg";
import FavStar from "@Images/Favorite/FavStar.svg";
import ForwardFav from "@Images/Favorite/ForwardFav.svg";
import { ReduxChat } from "@Types/types";
import Text from "@Components/Text";
import { navigate } from "@Navigation/utility";
import { socket } from "@/redux/Reducer/SocketSlice";
import { socketManager } from "@/utils/socket/SocketManager";
import { socketConnect } from "@/utils/socket/SocketConnection";

// create a component
const BottomView = ({
  Cid,
  RoomId,
  navigation,
  resetSelection,
  allMessages,
  SelectedOption,
  refreshFavouriteMessages
}: any) => {

  const [deleteModalVisible, setdeleteModalVisible] = useState(false);

  return (
    <View style={styles.container}>
      <View
        style={{
          backgroundColor: "white",
          marginBottom: 10,
          paddingVertical: 8,
        }}
      >
        <Text style={{ textAlign: "center" }}>{Cid.length} Selected</Text>
      </View>
      {Cid.length > 0 && (
        <View>
          <View
            style={{ flexDirection: "row", justifyContent: "space-around" }}
          >
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              <ForwardFav
                onPress={() => {
                  navigate("ForwardMessageScreen", { Cidlist: SelectedOption });
                }}
              />
              <Text
                style={{
                  color: "rgba(51,51,51,.8)",
                  fontSize: 12,
                  marginTop: 4,
                }}
              >
                Forward
              </Text>
            </View>
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              <FavStar
                onPress={() => {
                  refreshFavouriteMessages(true)
                  socketConnect.emit("removeChatsFromFavourite", { cid: Cid });
                  resetSelection();
                }}
              />
              <Text
                style={{
                  color: "rgba(51,51,51,.8)",
                  fontSize: 12,
                  marginTop: 4,
                }}
              >
                Unfavorite
              </Text>
            </View>
          </View>
          <DeleteForwardModal
            selectedItem={SelectedOption}
            removefromFav={true}
            Cidlist={Cid}
            visible={deleteModalVisible}
            setVisible={() => {
              setdeleteModalVisible(!deleteModalVisible);
            }}
            onDelete={() => {
              resetSelection();
            }}
          />
        </View>
      )}
    </View>
  );
};

// define your styles
const styles = StyleSheet.create({
  container: {
    // height: 100,
    width: "100%",
    paddingBottom: 10,
    backgroundColor: Colors.light.LightBlue,
    position: "absolute",
    bottom: 0,
    //   alignItems:'center',
    justifyContent: "center",
    borderTopColor: "rgba(51,51,51,.5)",
    borderTopWidth: 0.5,
  },
});

//make this component available to the app
export default BottomView;
