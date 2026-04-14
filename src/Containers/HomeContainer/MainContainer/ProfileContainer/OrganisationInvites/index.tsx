import { FlatList, TouchableOpacity, View } from "react-native";
import { GetMyInvitesQuery, useGetMyInvitesQuery } from "@Service/generated/organization.generated";
import React, { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Colors from "@/Constants/Colors";
import CommonLoader from "@Components/CommonLoader";
import { HeaderWithScreenName } from "@Components/header/HeaderWithScreenName";
import Ionicons from "react-native-vector-icons/Ionicons";
import { RootState } from "@Store/Reducer";
import Text from "@Components/Text";
import ToastMessage from "@Util/ToastMesage";
import { refreshInvite } from "@Atoms/refreshInviteAtom";
import style from "./styles";
import { useAcceptMutation } from "@Service/generated/organization.generated";
import { useAtom } from "jotai";
import { useDeclineMutation } from "@Service/generated/organization.generated";

import { useTranslation } from "react-i18next";
import { windowWidth } from "@Util/ResponsiveView";
import { useFocusEffect } from "@react-navigation/core";
import { useOrganizations } from "@/hooks";
import { setOrganisationInvites } from "@/redux/Reducer/OrganisationsReducer";

export const SHOW_INVITES = "SHOW_INVITES";
export const HIDE_INVITES = "HIDE_INVITES";

// create a component
const OrganizationInvites = (navigation) => {
  const { comonContact, contacts } = useSelector((state: RootState) => state.Contact);

  const { data, loading, refetch } = useGetMyInvitesQuery();
  const [acceptRequest, acceptResponse] = useAcceptMutation();
  const [declineRequest, declineResponse] = useDeclineMutation();
  const OrganisationInvites = useSelector((state: RootState) => state.Organisation.invites);
  const [invitationRefresh, setInvitationRefresh] = useAtom(refreshInvite);

  const [loader, setLoading] = useState(false);

  const Dispatch = useDispatch();

  const { FetchAllOrganisation } = useOrganizations();



  useFocusEffect(
    useCallback(() => {
      refetch().then((response) => {
        Dispatch(setOrganisationInvites(response.data.getMyInvites));
      });
    }, [])
  );

  const AcceptOrRequest = (item: GetMyInvitesQuery["getMyInvites"][0], type: string) => {
    const removeDecline = OrganisationInvites.filter((value) => value._id !== item._id);
    console.log("item", item);
    setLoading(true);
    if (type == "Accept") {
      acceptRequest({ variables: { input: { _id: item._id, msgId: item?.msgId, orgId: item?.organization[0] } } })
        .then(async () => {
          await FetchAllOrganisation();
          Dispatch(setOrganisationInvites(removeDecline));
          setInvitationRefresh(true);
          setLoading(false);
          ToastMessage(t("label.invitation-accepted"));
        })
        .catch((err: any) => {
          console.log(JSON.stringify(err), "errrr");
          setLoading(false);
        });
    } else {
      declineRequest({ variables: { input: { _id: item._id, msgId: item?.msgId, orgId: item?.organization[0] } } })
        .then(() => {
          Dispatch(setOrganisationInvites(removeDecline));
          setInvitationRefresh(true);
          ToastMessage(t("label.invitation-declined"));
          setLoading(false);
        })
        .catch((err) => {
          console.log(err, "errrr");
          setLoading(false);
        });
    }
  };
  interface buttonProps {
    type: "Accept" | "Decline";
    onpress: () => {};
    title: string;
  }
  const EmptyList = () => (
    <View style={style.noInvite}>
      <Text style={{ color: Colors.light.White }}>{t(`others.You don't have any invites yet 😅`)}</Text>
    </View>
  );

  const Button = ({ type, onpress, title }: buttonProps) => {
    return (
      <TouchableOpacity onPress={onpress} style={[style.button, type == "Accept" ? style.accept : style.reject]}>
        <Text style={type == "Accept" ? style.acceptText : style.rejectText}>{title}</Text>
      </TouchableOpacity>
    );
  };
  const { t } = useTranslation();
  return (
    // eslint-disable-next-line react-native/no-color-literals
    <View style={{ flex: 1, backgroundColor: "#eff2f5" }}>
      {(acceptResponse.loading || acceptResponse.loading || declineResponse.loading || loader) && <CommonLoader />}
      <HeaderWithScreenName title={t("navigation.organization-invite")} />
      <View style={style.container}>
        <View style={style.IconContainer}>
          <Ionicons name="mail-open-outline" size={windowWidth / 5} color="white" />
        </View>
        <Text style={style.title}>{t("task.your-invites")}</Text>

        <FlatList
          ListEmptyComponent={() => <EmptyList />}
          data={OrganisationInvites}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ alignSelf: "center", alignItems: "center" }}
          renderItem={({ item }) => {
            const finduser = comonContact.find((v) => v.userId?._id == item.user?._id);
            const UserName = finduser ? `${finduser?.firstName} ${finduser?.lastName}` : item?.user?.phone;

            return (
              <View style={style.viewContainer}>
                <Text lineNumber={3} style={{ textAlign: "center", marginBottom: 10 }}>{`${UserName} ${t(
                  "task.invited you"
                )} ${item?.masterOrg?.name}`}</Text>
                <View style={{ flexDirection: "row", justifyContent: "space-between", paddingTop: 30 }}>
                  <Button
                    title={t("btn.decline")}
                    type={"Decline"}
                    onpress={async () => AcceptOrRequest(item, "Decline")}
                  />
                  <Button
                    title={t("btn.accept")}
                    type={"Accept"}
                    onpress={async () => AcceptOrRequest(item, "Accept")}
                  />
                </View>
              </View>
            );
          }}
        />
      </View>
    </View>
  );
};

//make this component available to the app
export default OrganizationInvites;
