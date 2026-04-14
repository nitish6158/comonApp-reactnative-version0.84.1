import * as React from "react";

import { Dimensions, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { useAtom, useAtomValue } from "jotai";

import { AllChatRooms } from "@Atoms/allRoomsAtom";
import Colors from "@/Constants/Colors";
import CommonLoader from "@Components/CommonLoader";
import Contactlist from "./contactList";
import Ionicons from "react-native-vector-icons/Ionicons";
import { RootState } from "@Store/Reducer";
import SearchInput from "@Components/SearchInput";
import { filterInObject } from "../../ProfileContainer/contacts/FilterContact";
import { useEffect } from "react";
import { useGetByIdsLazyQuery } from "@Service/generated/user.generated";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import getAlphabatic from "@Util/alphabeticOrder";

function GlobalSearch({ navigation }: any) {
  const { comonContact } = useSelector((state: RootState) => state.Contact);

  const chatRooms = useAtomValue(AllChatRooms);
  const [allIdQuery] = useGetByIdsLazyQuery();

  const [SearchValue, SetSearchValue] = React.useState("");
  const [refreshing, setRefreshing] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const [otherUsersProfileData, setOtherUsersProfileData] = React.useState([]);

  const nav = useNavigation();

  const screenFocus = nav.isFocused();

  const filterChat = React.useMemo(() => {
    if (SearchValue.length > 0) {
      const lowerFilter = SearchValue.toLowerCase();
      return chatRooms.filter((item) => {
        const roomLower = item.display?.UserName.toLowerCase();
        const phoneLower = item.display?.PhoneNo.toLowerCase();
        return roomLower.split(" ").find((v) => v.startsWith(lowerFilter)) || phoneLower.includes(lowerFilter);
      });
    } else {
      return chatRooms;
    }
  }, [SearchValue, screenFocus, comonContact.length, chatRooms]);

  const filterContact = React.useMemo(() => {
    const result = filterInObject({
      searchText: SearchValue,
      data: comonContact,
      // searchKeys: ["firstName", "lastName", "phone"],
      // returnKeys: [],
    });
    return getAlphabatic(result);
  }, [SearchValue, screenFocus, comonContact.length, chatRooms]);

  const onRefresh = async () => {};
  const { t } = useTranslation();

  useEffect(() => {
    if (filterContact?.length) {
      const allId = filterContact.map((e) => e?.userId?._id);
      allIdQuery({
        variables: {
          input: {
            ids: allId,
          },
        },
      })
        .then((response) => {
          if (response.data?.getByIds?.length) {
            setOtherUsersProfileData(response.data?.getByIds);
          }
        })
        .catch((Err) => {
          console.log("Error in getting profile data from all id query", Err);
        });
    }
  }, [filterContact?.length, comonContact.length, chatRooms]);

  return (
    <View style={styles.container}>
      {loading && <CommonLoader />}

      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
        <Ionicons name="chevron-back" size={35} color="black" onPress={() => nav.goBack()} style={{ marginTop: 12 }} />
        <SearchInput
          SearchValue={SearchValue}
          SetSearchValue={SetSearchValue}
          ShowSearchIcon
          placeHolder={t("form.label.search")}
        />
      </View>

      <ScrollView nestedScrollEnabled refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <Contactlist
          setLoading={setLoading}
          otherUsers={filterContact}
          onlychat={filterChat}
          navigation={navigation}
          otherUsersProfileData={otherUsersProfileData}
        />
      </ScrollView>
    </View>
  );
}

// define your styles
const styles = StyleSheet.create({
  NodatafoundContainer: { alignItems: "center", flex: 1, justifyContent: "flex-start", marginTop: 30 },
  container: {
    backgroundColor: Colors.light.background,
    flex: 1,
  },
});

//make this component available to the app
export default GlobalSearch;
